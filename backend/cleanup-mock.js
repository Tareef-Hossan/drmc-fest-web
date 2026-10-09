// Deletes ONLY the mock registrations/volunteers listed in data/*.mock.json.
// Real submissions (random IDs) are never touched. Segments, schedule and admin role are kept.
//   node cleanup-mock.js          -> preview (deletes nothing)
//   node cleanup-mock.js --yes    -> actually delete
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account-key.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const DO_IT = process.argv.includes('--yes');

async function run() {
  const regs = require('./data/registrations.mock.json').map(r => r.regId);
  const vols = require('./data/volunteers.mock.json').map(v => v.volunteerId);

  const targets = [
    ...regs.map(id => db.collection('registrations').doc(id)),
    ...vols.map(id => db.collection('volunteers').doc(id))
  ];

  console.log(`Mock registrations: ${regs.length}`);
  console.log(`Mock volunteers:    ${vols.length}`);

  if (!DO_IT) {
    console.log('\nPreview only. Run "node cleanup-mock.js --yes" to delete them.');
    return;
  }

  for (let i = 0; i < targets.length; i += 400) {
    const batch = db.batch();
    targets.slice(i, i + 400).forEach(ref => batch.delete(ref));
    await batch.commit();
  }
  console.log(`\nDeleted ${targets.length} mock documents. Real entries were kept.`);
}

run().catch(e => { console.error(e); process.exit(1); });
