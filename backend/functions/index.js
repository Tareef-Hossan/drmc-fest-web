const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

// CORS middleware
const corsHandler = cors({ origin: true });

// Rate limiting (in-memory, for production use Redis)
const rateLimiter = new Map();
const RATE_LIMIT = 5; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const validRequests = requests.filter(t => now - t < RATE_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  validRequests.push(now);
  rateLimiter.set(ip, validRequests);
  return true;
}

// Generate unique registration ID
function generateRegId() {
  const year = '26';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DRMC${year}-${random}`;
}

// POST /api/registrations - Create new registration
exports.api = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, () => {});

  const path = req.path;
  const ip = req.ip;

  // Route handler
  if (path === '/registrations' && req.method === 'POST') {
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    try {
      const { eventId, name, email, phone, institution, teamName, txId, consent } = req.body;

      // Validation
      if (!eventId || !name || !email || !phone || !institution || !txId || !consent) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (!/^[0-9]{11}$/.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 11 digits.' });
      }

      // Check if event exists and get fee
      const eventDoc = await db.collection('events').doc(eventId).get();
      if (!eventDoc.exists) {
        return res.status(404).json({ error: 'Event not found' });
      }

      const eventData = eventDoc.data();
      const fee = eventData.fee || 0;

      // Check capacity
      if (eventData.registered >= eventData.capacity) {
        return res.status(400).json({ error: 'Event is at full capacity' });
      }

      // Check deadline
      if (new Date(eventData.deadline) < new Date()) {
        return res.status(400).json({ error: 'Registration deadline has passed' });
      }

      // Check for duplicates
      const existingEmail = await db.collection('registrations')
        .where('email', '==', email)
        .where('eventId', '==', eventId)
        .get();

      if (!existingEmail.empty) {
        return res.status(409).json({ error: 'You have already registered for this event.' });
      }

      const existingPhone = await db.collection('registrations')
        .where('phone', '==', phone)
        .where('eventId', '==', eventId)
        .get();

      if (!existingPhone.empty) {
        return res.status(409).json({ error: 'This phone number has already registered for this event.' });
      }

      // Generate unique registration ID
      const regId = generateRegId();
      
      // Check uniqueness
      const existingRegId = await db.collection('registrations').doc(regId).get();
      if (existingRegId.exists) {
        return res.status(500).json({ error: 'Registration ID conflict. Please try again.' });
      }

      // Create registration
      const registration = {
        regId,
        eventId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        institution: institution.trim(),
        teamName: teamName ? teamName.trim() : null,
        txId: txId.trim(),
        consent,
        fee,
        paymentStatus: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('registrations').doc(regId).set(registration);

      // Increment event registered count
      await db.collection('events').doc(eventId).update({
        registered: admin.firestore.FieldValue.increment(1)
      });

      // Send confirmation email (if configured)
      try {
        await sendConfirmationEmail(email, name, regId, eventData.name, fee);
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the registration if email fails
      }

      res.status(201).json({
        success: true,
        regId,
        message: 'Registration successful. Please keep your registration ID safe.'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST /api/volunteers - Create volunteer application
  else if (path === '/volunteers' && req.method === 'POST') {
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    try {
      const { name, email, phone, institution, team, availability, reason, experience } = req.body;

      // Validation
      if (!name || !email || !phone || !institution || !team || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (!/^[0-9]{11}$/.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 11 digits.' });
      }

      const volunteerId = uuidv4();

      const volunteer = {
        volunteerId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        institution: institution.trim(),
        team,
        availability: availability || 'All 3 days',
        reason: reason.trim(),
        experience: experience ? experience.trim() : '',
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('volunteers').doc(volunteerId).set(volunteer);

      // Send volunteer confirmation email
      try {
        await sendVolunteerConfirmationEmail(email, name, team);
      } catch (emailError) {
        console.error('Email error:', emailError);
      }

      res.status(201).json({
        success: true,
        volunteerId,
        message: 'Volunteer application submitted successfully.'
      });

    } catch (error) {
      console.error('Volunteer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/fests - Get all fests
  else if (path === '/fests' && req.method === 'GET') {
    try {
      const snapshot = await db.collection('fests').get();
      const fests = {};
      snapshot.forEach(doc => {
        fests[doc.id] = doc.data();
      });
      res.json(fests);
    } catch (error) {
      console.error('Fests error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/events - Get all events
  else if (path === '/events' && req.method === 'GET') {
    try {
      const snapshot = await db.collection('events').get();
      const events = {};
      snapshot.forEach(doc => {
        events[doc.id] = doc.data();
      });
      res.json(events);
    } catch (error) {
      console.error('Events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // GET /api/events?festId=xxx - Get events for a specific fest
  else if (path === '/events' && req.method === 'GET') {
    try {
      const festId = req.query.festId;
      let query = db.collection('events');
      
      if (festId) {
        query = query.where('festId', '==', festId);
      }
      
      const snapshot = await query.get();
      const events = {};
      snapshot.forEach(doc => {
        events[doc.id] = doc.data();
      });
      res.json(events);
    } catch (error) {
      console.error('Events error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 404 for unknown routes
  else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Email functions (configure with your SMTP settings)
async function sendConfirmationEmail(email, name, regId, eventName, fee) {
  // Configure email transporter
  // You need to set up SMTP credentials in Firebase config
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email.user,
      pass: functions.config().email.pass
    }
  });

  const mailOptions = {
    from: 'DRMC IT Club <noreply@drmcitclub.com>',
    to: email,
    subject: 'Registration Confirmation - DRMC IT Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1de9b6;">Registration Confirmed!</h2>
        <p>Dear ${name},</p>
        <p>Your registration for <strong>${eventName}</strong> has been received.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Registration ID:</strong> ${regId}</p>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Registration Fee:</strong> ${fee > 0 ? `BDT ${fee.toLocaleString()}` : 'Free'}</p>
          <p><strong>Payment Status:</strong> Pending Verification</p>
        </div>
        <p>Please keep your registration ID safe and bring a valid student ID to the event.</p>
        <p>Best regards,<br>DRMC IT Club</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

async function sendVolunteerConfirmationEmail(email, name, team) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email.user,
      pass: functions.config().email.pass
    }
  });

  const mailOptions = {
    from: 'DRMC IT Club <noreply@drmcitclub.com>',
    to: email,
    subject: 'Volunteer Application Received - 9th DRMC International Tech Carnival 2026',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1de9b6;">Application Received!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for your interest in volunteering for the 9th DRMC International Tech Carnival 2026.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Preferred Team:</strong> ${team}</p>
          <p><strong>Status:</strong> Under Review</p>
        </div>
        <p>We will contact you soon with further details.</p>
        <p>Event Dates: October 8-10, 2026<br>
        Venue: Dhaka Residential Model College</p>
        <p>Best regards,<br>DRMC IT Club</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}
