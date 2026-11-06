// Run only on a trusted machine with Application Default Credentials. This
// script is never bundled into the website and never accepts browser input.
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const [kind, value] = process.argv.slice(2);
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
if (!projectId || !['--email', '--uid'].includes(kind) || !value) {
  console.error('Usage: FIREBASE_PROJECT_ID=your-project npm run grant-admin -- --email admin@example.com');
  console.error('Or use --uid <Firebase Authentication UID>. Set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON outside this repository.');
  process.exit(1);
}
try {
  initializeApp({ credential: applicationDefault(), projectId });
  const auth = getAuth();
  const user = kind === '--email' ? await auth.getUserByEmail(value) : await auth.getUser(value);
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
  console.log(`Administrator claim granted to ${user.email || user.uid} (${user.uid}). Sign out and sign back in to refresh the token.`);
} catch (error) {
  console.error('Could not grant the claim:', error.message);
  process.exitCode = 1;
}
