// Frontend -> Firestore (no Cloud Functions needed).
// Load it in a page with: <script type="module" src="firebase-client.js"></script>
// It exposes window.FestDB.submitRegistration() and window.FestDB.submitVolunteer().
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-check.js';

const firebaseConfig = {
  apiKey: "AIzaSyAv53_ayjOYmp-1C5eNasbw-F1RHHBWyOE",
  authDomain: "drmc-tech-carnival-2026.firebaseapp.com",
  projectId: "drmc-tech-carnival-2026",
  storageBucket: "drmc-tech-carnival-2026.firebasestorage.app",
  messagingSenderId: "577309794308",
  appId: "1:577309794308:web:ab23300ec6b41907081551",
  measurementId: "G-37B2KHEM7D"
};

// Optional: EmailJS (free 200 emails/month). Leave blank to skip emails.
const EMAILJS = { service: '', template: '', publicKey: '' };

const RECAPTCHA_SITE_KEY = '6LehDuUtAAAAAMO8-NHB8OYwk06iD8OY0x2AICbC';

// On localhost, App Check uses a debug token (printed in the browser console).
// Register that token in Firebase Console -> App Check -> Apps -> Manage debug tokens.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const app = initializeApp(firebaseConfig);
try {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
} catch (e) {
  console.warn('App Check failed to start', e);
}
const db = getFirestore(app);

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeRegId = () => {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return 'DRMC26-' + [...a].map(x => ALPHA[x % ALPHA.length]).join('');
};
const clean = s => String(s || '').trim();

async function mail(params) {
  if (!EMAILJS.service || !window.emailjs) return;
  try { await window.emailjs.send(EMAILJS.service, EMAILJS.template, params, EMAILJS.publicKey); }
  catch (e) { console.warn('Email failed', e); }
}

// d = { eventId, eventName, name, email, phone, institution, teamName, txId, consent, fee }
// Matches the /registrations rules in backend/firestore.rules.
export async function submitRegistration(d) {
  const phone = clean(d.phone).replace(/\D/g, '');
  if (!/^[0-9]{11}$/.test(phone)) throw new Error('Phone number must be 11 digits (e.g. 01712345678).');
  const fee = Number(d.fee) || 0;
  // Free events have no payment, but the rules still require a txId of 6+ characters.
  const txId = fee === 0 ? 'FREE-EVENT' : clean(d.txId);
  if (txId.length < 6) throw new Error('Please enter a valid bKash transaction ID (at least 6 characters).');

  const regId = makeRegId();
  const data = {
    regId,
    eventId: clean(d.eventId),
    name: clean(d.name),
    email: clean(d.email).toLowerCase(),
    phone,
    institution: clean(d.institution),
    txId,
    consent: d.consent === true,
    fee,
    paymentStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (clean(d.teamName)) data.teamName = clean(d.teamName);

  await setDoc(doc(db, 'registrations', regId), data);
  mail({ to_email: data.email, to_name: data.name, reg_id: regId, event: clean(d.eventName), fee });
  return regId;
}

// d = { name, email, phone, institution, team, availability, reason, experience }
export async function submitVolunteer(d) {
  const volunteerId = crypto.randomUUID();
  const data = {
    volunteerId,
    name: clean(d.name),
    email: clean(d.email).toLowerCase(),
    phone: clean(d.phone).replace(/\D/g, ''),
    institution: clean(d.institution),
    team: d.team,
    availability: d.availability || 'All 3 days',
    reason: clean(d.reason),
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  if (clean(d.experience)) data.experience = clean(d.experience);
  await setDoc(doc(db, 'volunteers', volunteerId), data);
  return volunteerId;
}

// Make the functions usable from normal (non-module) <script> blocks.
window.FestDB = { submitRegistration, submitVolunteer };
