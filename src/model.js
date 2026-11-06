export const ROLES = ['restaurant', 'organization', 'individual'];
export const ROLE_LABELS = {
  restaurant: 'Restaurant / food business',
  organization: 'Welfare organization',
  individual: 'Individual / family'
};
export const MAX_EVIDENCE_URLS = 5;
export const MAX_EVIDENCE_URL_LENGTH = 500;

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password ? parsed.href : '';
  } catch {
    return '';
  }
}

// Accept links to externally hosted photos or videos, one per line. The site
// does not upload the files or fetch the URLs; reviewers open links themselves.
export function parseEvidenceUrls(value = '') {
  const entries = String(value).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (entries.length > MAX_EVIDENCE_URLS) return { urls: [], error: `Please provide no more than ${MAX_EVIDENCE_URLS} photo or video links.` };
  const urls = entries.map(safeExternalUrl);
  if (entries.some((value) => value.length > MAX_EVIDENCE_URL_LENGTH) || urls.some((url) => !url || url.length > MAX_EVIDENCE_URL_LENGTH)) {
    return { urls: [], error: `Each photo or video link must be a valid http:// or https:// URL of at most ${MAX_EVIDENCE_URL_LENGTH} characters.` };
  }
  return { urls, error: '' };
}

export function validateListingTimes(preparedAt, availableFrom, pickupBy, now = new Date()) {
  const prepared = new Date(preparedAt);
  const start = new Date(availableFrom);
  const end = new Date(pickupBy);
  if ([prepared, start, end].some((date) => Number.isNaN(date.getTime()))) return 'Please provide valid preparation and pickup times.';
  if (prepared > now) return 'Preparation time cannot be in the future.';
  if (start < prepared) return 'The pickup window cannot start before the food was prepared.';
  if (end <= start) return 'The pickup deadline must be after the start time.';
  if (end <= now) return 'The pickup deadline must be in the future.';
  return '';
}

export function validatePickupTime(pickupAt, availableFrom, pickupBy, now = new Date()) {
  const pickup = new Date(pickupAt);
  const start = availableFrom?.toDate ? availableFrom.toDate() : new Date(availableFrom);
  const end = pickupBy?.toDate ? pickupBy.toDate() : new Date(pickupBy);
  if ([pickup, start, end].some((date) => Number.isNaN(date.getTime()))) return 'Please choose a valid pickup time.';
  if (pickup <= now || pickup < start || pickup > end) return 'Choose a future pickup time within the listed collection window.';
  return '';
}

export function dashboardFor(profile) {
  if (!profile) return 'register.html?finish=1';
  if (profile.role === 'individual') return 'centers.html';
  if (profile.status !== 'approved') return 'application.html';
  if (profile.role === 'restaurant') return 'donor-dashboard.html';
  if (profile.role === 'organization') return 'receiver-dashboard.html';
  return 'register.html?finish=1';
}

export function formatDate(value) {
  if (!value) return 'Not specified';
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not specified';
  return new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function localDateTimeValue(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
