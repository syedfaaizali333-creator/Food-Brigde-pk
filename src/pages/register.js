import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isConfigured, errorMessage } from '../firebase.js';
import { dashboardFor, ROLES, safeExternalUrl, parseEvidenceUrls } from '../model.js';
import { getProfile } from '../session.js';
import { installShell, setMessage, busy } from '../ui.js';

installShell();
const authPanel = document.getElementById('auth-panel');
const authForm = document.getElementById('auth-form');
const form = document.getElementById('register-form');
const message = document.getElementById('register-message');
const submit = document.getElementById('register-submit');
const google = document.getElementById('google-register');
const emailSignIn = document.getElementById('email-signin');
const emailCreate = document.getElementById('email-create');
const switchAccount = document.getElementById('switch-account');
const fields = (id) => document.getElementById(`register-${id}`);
const roles = [...form.querySelectorAll('input[name=role]')];
const params = new URLSearchParams(window.location.search);
const requestedRole = params.get('role');
const originalEvidenceHelp = document.getElementById('evidence-help').textContent;
let user = null;
let oldProfile = null;
let submitting = false;
let authBusy = false;
let authReady = false;
let authVersion = 0;

function selectRequestedRole() {
  if (ROLES.includes(requestedRole)) form.querySelector(`[name=role][value=${requestedRole}]`).checked = true;
}
function selectedRole() { return form.querySelector('[name=role]:checked')?.value || ''; }
function updateRole() {
  const role = selectedRole();
  const business = role === 'restaurant' || role === 'organization';
  form.querySelectorAll('[data-business-only]').forEach((node) => { node.hidden = !business; });
  ['contact', 'address', 'description'].forEach((name) => { fields(name).required = business; });
  fields('website').disabled = !business;
  fields('evidence').disabled = !business;
  document.getElementById('name-label').textContent = role === 'restaurant' ? 'Restaurant / business name' : role === 'organization' ? 'Organization name' : 'Your full name';
  if (role === 'individual' && user?.displayName && !fields('name').value) fields('name').value = user.displayName;
}
roles.forEach((radio) => radio.addEventListener('change', updateRole));
selectRequestedRole();
updateRole();

function updateAuthButtons() {
  [google, emailSignIn, emailCreate].forEach((button) => { button.disabled = !isConfigured || !authReady || authBusy; });
}
function showAccount(signedInUser) {
  const signedIn = Boolean(signedInUser);
  authPanel.hidden = signedIn;
  document.getElementById('signed-account').hidden = !signedIn;
  document.getElementById('signed-email').textContent = signedInUser?.email || '';
  document.getElementById('signed-uid').textContent = signedInUser?.uid || '';
  if (signedIn) fields('password').value = '';
}
function populateRejected(profile) {
  document.getElementById('register-heading').textContent = 'Update your application';
  document.getElementById('register-intro').textContent = 'Update your details and submit them for review again.';
  form.querySelector(`[name=role][value=${profile.role}]`).checked = true;
  roles.forEach((radio) => { radio.disabled = radio.value !== profile.role; });
  ['name', 'contact', 'phone', 'city', 'address', 'website', 'description'].forEach((name) => {
    fields(name).value = profile[name === 'contact' ? 'contactName' : name] || '';
  });
  fields('evidence').value = Array.isArray(profile.evidenceUrls) ? profile.evidenceUrls.join('\n') : '';
  if (profile.evidencePaths?.length) document.getElementById('evidence-help').textContent = 'Previous uploads are no longer available here. Please provide a website or accessible photo/video links, one per line.';
  updateRole();
}

async function authenticate(button, label, action) {
  if (authBusy || !authReady) return;
  authBusy = true;
  setMessage(message, '');
  busy(button, true, label);
  updateAuthButtons();
  try { await action(); }
  catch (error) { setMessage(message, errorMessage(error)); }
  finally {
    busy(button, false);
    authBusy = false;
    updateAuthButtons();
  }
}

if (!isConfigured) {
  document.getElementById('setup-message').hidden = false;
} else {
  onAuthStateChanged(auth, async (nextUser) => {
    const version = ++authVersion;
    user = nextUser;
    oldProfile = null;
    authReady = true;
    form.hidden = true;
    submit.disabled = true;
    roles.forEach((radio) => { radio.disabled = false; });
    showAccount(nextUser);
    updateAuthButtons();
    setMessage(message, '');
    if (!nextUser) {
      form.reset();
      document.getElementById('evidence-help').textContent = originalEvidenceHelp;
      selectRequestedRole();
      updateRole();
      document.getElementById('register-heading').textContent = 'Join FoodBridge';
      document.getElementById('register-intro').textContent = 'Step 1: Sign in or create an account. Then choose how you want to join.';
      return;
    }
    document.getElementById('register-intro').textContent = 'Checking your account…';
    if (!nextUser.email) {
      setMessage(message, 'This account has no email address. Please switch to an email or Google account.');
      return;
    }
    try {
      const profile = await getProfile(nextUser.uid);
      if (version !== authVersion) return;
      if (profile) {
        if (profile.status === 'rejected' && params.get('edit') === '1') {
          oldProfile = profile;
          populateRejected(profile);
        } else {
          window.location.replace(dashboardFor(profile));
          return;
        }
      } else {
        document.getElementById('register-intro').textContent = 'Step 2: Choose how you are joining and complete your details.';
        updateRole();
      }
      form.hidden = false;
      submit.disabled = false;
    } catch (error) {
      if (version !== authVersion) return;
      document.getElementById('register-intro').textContent = 'Your sign-in is saved, but your registration could not be checked. Refresh this page to retry.';
      setMessage(message, errorMessage(error));
    }
  });

  google.addEventListener('click', () => authenticate(google, 'Opening Google…', () => signInWithPopup(auth, googleProvider)));
  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!authForm.reportValidity()) return;
    const email = fields('email').value.trim();
    const password = fields('password').value;
    authenticate(emailSignIn, 'Signing in…', () => signInWithEmailAndPassword(auth, email, password));
  });
  emailCreate.addEventListener('click', () => {
    if (!authForm.reportValidity()) return;
    const email = fields('email').value.trim();
    const password = fields('password').value;
    authenticate(emailCreate, 'Creating account…', () => createUserWithEmailAndPassword(auth, email, password));
  });
  switchAccount.addEventListener('click', async () => {
    switchAccount.disabled = true;
    try { await signOut(auth); authForm.reset(); }
    catch (error) { setMessage(message, errorMessage(error)); }
    finally { switchAccount.disabled = false; }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;
    setMessage(message, '');
    if (!user || form.hidden || submit.disabled) { setMessage(message, 'Please sign in before completing registration.'); return; }
    if (!form.reportValidity()) return;
    const role = selectedRole();
    if (!ROLES.includes(role)) { setMessage(message, 'Please choose how you are joining FoodBridge.'); return; }
    const business = role !== 'individual';
    const websiteInput = business ? fields('website').value.trim() : '';
    const website = websiteInput ? safeExternalUrl(websiteInput) : '';
    if (websiteInput && !website) { setMessage(message, 'Please enter a valid website starting with http:// or https://.'); return; }
    const { urls: evidenceUrls, error: evidenceError } = parseEvidenceUrls(business ? fields('evidence').value : '');
    if (evidenceError) { setMessage(message, evidenceError); return; }
    if (business && !website && !evidenceUrls.length) { setMessage(message, 'Please provide a website / social page or at least one photo or video link for verification.'); return; }
    const data = {
      role,
      name: fields('name').value.trim(),
      contactName: business ? fields('contact').value.trim() : fields('name').value.trim(),
      phone: fields('phone').value.trim(),
      city: fields('city').value.trim(),
      address: business ? fields('address').value.trim() : '',
      website,
      description: business ? fields('description').value.trim() : ''
    };
    if (Object.entries(data).some(([key, value]) => ['name', 'contactName', 'phone', 'city'].includes(key) && !value) || (business && (!data.address || !data.description))) {
      setMessage(message, 'Please complete all required details.'); return;
    }
    if (data.phone.length < 7) { setMessage(message, 'Please enter a phone number with at least 7 characters.'); return; }
    const account = user;
    const version = authVersion;
    submitting = true;
    let navigating = false;
    busy(submit, true, 'Submitting registration…');
    try {
      const existing = await getProfile(account.uid);
      if (version !== authVersion) return;
      if (existing && !(oldProfile && existing.status === 'rejected')) {
        window.location.assign(dashboardFor(existing));
        navigating = true;
        return;
      }
      const application = {
        ...data,
        uid: account.uid,
        email: account.email,
        status: 'pending',
        evidenceUrls,
        createdAt: oldProfile?.createdAt || serverTimestamp(),
        consentAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reviewedAt: null,
        reviewedBy: '',
        reviewNote: ''
      };
      await setDoc(doc(db, 'profiles', account.uid), application);
      if (version !== authVersion) return;
      window.location.assign(dashboardFor(application));
      navigating = true;
    } catch (error) {
      if (version === authVersion) setMessage(message, `${errorMessage(error)} Your sign-in is saved; you can correct your details and submit again.`);
    } finally {
      submitting = false;
      if (!navigating) {
        busy(submit, false);
        if (form.hidden) submit.disabled = true;
      }
    }
  });
}
