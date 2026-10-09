// Connects the existing forms (#fr registration, #fv volunteer) to Firestore.
// Load AFTER firebase-client.js:  <script type="module" src="register-hooks.js"></script>
import { submitRegistration, submitVolunteer } from './firebase-client.js';

const $ = s => document.querySelector(s);

document.addEventListener('submit', async e => {
  const id = e.target && e.target.id;
  if (id !== 'fr' && id !== 'fv') return;
  e.preventDefault();
  e.stopImmediatePropagation(); // stop the old fake-success handler

  const f = e.target;
  const errEl = $(id === 'fr' ? '#fe' : '#ve');
  const btn = f.querySelector('button[type=submit]');

  // required-field check (same rules the old handler used)
  const bad = [...f.querySelectorAll('[required]')].find(i =>
    i.type === 'checkbox' ? !i.checked
    : !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value)));
  if (bad) { errEl.textContent = 'Please complete the required fields correctly.'; bad.focus(); return; }

  const v = [...f.querySelectorAll('.in')];
  const phone = v[2].value.replace(/\D/g, '');
  if (phone.length !== 11) { errEl.textContent = 'Phone number must be 11 digits (e.g. 01XXXXXXXXX).'; v[2].focus(); return; }

  errEl.textContent = '';
  btn.disabled = true; const label = btn.textContent; btn.textContent = 'Submitting…';

  try {
    let outId;
    if (id === 'fr') {
      const segs = [...SEL];                       // selected segments (from the page script)
      if (!segs.length) throw new Error('Please select at least one segment.');
      const totalFee = segs.reduce((a, n) => a + inf(n)[0], 0);
      const tx = v[6].value.trim();
      if (totalFee > 0 && tx.length < 6) throw new Error('Please enter your bKash transaction ID.');
      outId = await submitRegistration({
        name: v[0].value, email: v[1].value, phone, institution: v[3].value,
        level: v[4].value.split(' ')[0],           // "Junior (Class III–VIII)" -> "Junior"
        teamName: v[5].value, segments: segs,
        txId: totalFee > 0 ? tx : 'FREE-ENTRY',
        consent: f.querySelector('input[type=checkbox][required]').checked,
        totalFee
      });
    } else {
      outId = await submitVolunteer({
        name: v[0].value, email: v[1].value, phone, institution: v[3].value,
        team: v[4].value, availability: v[5].value,
        reason: v[6].value, experience: v[7].value
      });
    }
    f.style.display = 'none';
    $(id === 'fr' ? '#fo' : '#vo').style.display = 'block';
    if (id === 'fr') $('#rid').textContent = outId;
    if (typeof fit === 'function') fit();
  } catch (err) {
    console.error(err);
    errEl.textContent = err.message && !/permission|insufficient/i.test(err.message)
      ? err.message
      : 'Could not submit. Please check your details and try again.';
  } finally {
    btn.disabled = false; btn.textContent = label;
  }
}, true);
