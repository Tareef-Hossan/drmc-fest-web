// Frontend -> Firestore (no Cloud Functions needed).
// Load it in a page with: <script type="module" src="firebase-client.js"></script>
// It exposes window.FestDB.submitRegistration(), window.FestDB.submitVolunteer(), window.FestDB.uploadProject().
// Authentication: window.FestAuth.login(), window.FestAuth.signup(), window.FestAuth.logout(), window.FestAuth.getCurrentUser()
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app-check.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';

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
const storage = getStorage(app);
const auth = getAuth(app);

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

// d = { eventId, eventName, name, email, phone, institution, teamName, txId, consent, fee, userId }
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
  if (d.userId) data.userId = d.userId;

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

// Upload project for online events
// d = { regId, eventId, file, projectName, description }
export async function uploadProject(d) {
  const { regId, eventId, file, projectName, description } = d;

  // Verify registration exists
  const regDoc = await getDoc(doc(db, 'registrations', regId));
  if (!regDoc.exists) {
    throw new Error('Registration not found');
  }

  const regData = regDoc.data();
  if (regData.eventId !== eventId) {
    throw new Error('Registration does not match this event');
  }

  // Verify event is online
  const eventDoc = await getDoc(doc(db, 'events', eventId));
  if (!eventDoc.exists) {
    throw new Error('Event not found');
  }

  const eventData = eventDoc.data();
  if (!eventData.isOnline) {
    throw new Error('This event does not accept project submissions');
  }

  // Upload file to Firebase Storage
  const fileExtension = file.name.split('.').pop();
  const fileName = `${regId}_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `projects/${eventId}/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  // Update registration with project info
  await updateDoc(doc(db, 'registrations', regId), {
    project: {
      name: clean(projectName),
      description: clean(description),
      fileUrl: downloadURL,
      fileName: file.name,
      uploadedAt: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });

  return downloadURL;
}

// ==================== AUTHENTICATION FUNCTIONS ====================

// Sign up new user
export async function signup(email, password, name, phone, institution) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email.toLowerCase(),
      name: clean(name),
      phone: clean(phone).replace(/\D/g, ''),
      institution: clean(institution),
      role: 'user',
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true, user, message: 'Account created! Please check your email to verify.' };
  } catch (error) {
    console.error('Signup error:', error);
    let message = 'Signup failed';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Email already in use';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password should be at least 6 characters';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    }
    return { success: false, error: message };
  }
}

// Login existing user
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      return { success: false, error: 'User profile not found' };
    }

    return { success: true, user, userData: userDoc.data() };
  } catch (error) {
    console.error('Login error:', error);
    let message = 'Login failed';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = 'Invalid email or password';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many attempts. Please try again later';
    }
    return { success: false, error: message };
  }
}

// Logout current user
export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}

// Get current authenticated user
export function getCurrentUser() {
  return auth.currentUser;
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Get user's registrations from Firestore
export async function getUserRegistrations(userId) {
  try {
    const q = query(collection(db, 'registrations'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const registrations = [];
    querySnapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });
    return registrations;
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
}

// Listen to user's registrations in real-time
export function onUserRegistrations(userId, callback) {
  const q = query(collection(db, 'registrations'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const registrations = [];
    snapshot.forEach((doc) => {
      registrations.push({ id: doc.id, ...doc.data() });
    });
    callback(registrations);
  });
}

// Get event results/winner information
export async function getEventResults(eventId) {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists) {
      return null;
    }
    const eventData = eventDoc.data();
    return {
      eventId,
      eventName: eventData.name,
      results: eventData.results || null,
      winners: eventData.winners || null,
      status: eventData.status || 'upcoming'
    };
  } catch (error) {
    console.error('Error fetching event results:', error);
    return null;
  }
}

// Update registration with user ID (called after signup/login)
export async function linkRegistrationToUser(regId, userId) {
  try {
    await updateDoc(doc(db, 'registrations', regId), {
      userId: userId,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error linking registration:', error);
    return { success: false, error: 'Failed to link registration' };
  }
}

// Make the functions usable from normal (non-module) blocks.
window.FestDB = { submitRegistration, submitVolunteer, uploadProject };
window.FestAuth = { signup, login, logout, getCurrentUser, onAuthStateChange, getUserRegistrations, onUserRegistrations, getEventResults, linkRegistrationToUser };
