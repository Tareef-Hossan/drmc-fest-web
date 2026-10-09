const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('./service-account-key.json'); // You'll need to download this from Firebase console

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function importData() {
  console.log('Starting data import...');

  // Import fests
  const fests = require('./data/fests.mock.json');
  console.log('Importing fests...');
  for (const [id, data] of Object.entries(fests)) {
    await db.collection('fests').doc(id).set(data);
  }
  console.log(`Imported ${Object.keys(fests).length} fests`);

  // Import events
  const events = require('./data/events.mock.json');
  console.log('Importing events...');
  for (const [id, data] of Object.entries(events)) {
    await db.collection('events').doc(id).set(data);
  }
  console.log(`Imported ${Object.keys(events).length} events`);

  // Import registrations (sample data)
  const registrations = require('./data/registrations.mock.json');
  console.log('Importing registrations...');
  for (const reg of registrations) {
    await db.collection('registrations').doc(reg.regId).set(reg);
  }
  console.log(`Imported ${registrations.length} registrations`);

  // Import volunteers (sample data)
  const volunteers = require('./data/volunteers.mock.json');
  console.log('Importing volunteers...');
  for (const vol of volunteers) {
    await db.collection('volunteers').doc(vol.volunteerId).set(vol);
  }
  console.log(`Imported ${volunteers.length} volunteers`);

  // Create admin role document (keyed by the Auth user's UID, which the security rules check)
  const ADMIN_EMAIL = 'admin@drmcitclub.com'; // must match the user you add in Firebase Authentication
  console.log('Creating admin role document...');
  try {
    const user = await getAuth().getUserByEmail(ADMIN_EMAIL);
    await db.collection('users').doc(user.uid).set({
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: FieldValue.serverTimestamp()
    });
    console.log(`Admin role set for ${ADMIN_EMAIL} (uid: ${user.uid})`);
  } catch (e) {
    console.log(`!! No Auth user found for ${ADMIN_EMAIL}.`);
    console.log('   Add that user in Firebase Console -> Authentication, then run this script again.');
  }

  console.log('Data import completed successfully!');
}

importData().catch(console.error);
