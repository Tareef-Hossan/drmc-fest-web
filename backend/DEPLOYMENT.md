# Deployment Guide - DRMC Tech Carnival 2026

This guide will help you deploy the complete backend system for the event registration platform.

## Prerequisites

- Node.js 18 or higher
- Firebase CLI: `npm install -g firebase-tools`
- Google account for Firebase
- Gmail account (or SMTP provider) for email notifications

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: "DRMC Tech Carnival 2026"
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Required Services

In Firebase Console, enable:

1. **Firestore Database**
   - Go to Build → Firestore Database
   - Click "Create database"
   - Select "Start in production mode"
   - Choose a location (e.g., asia-southeast1 for Bangladesh)

2. **Cloud Functions**
   - Go to Build → Functions
   - Click "Get started"
   - Accept the Blaze Plan (pay-as-you-go) if prompted

3. **Authentication** (for admin panel)
   - Go to Build → Authentication
   - Click "Get started"
   - Enable Email/Password authentication

4. **Hosting** (optional, for serving the frontend)
   - Go to Build → Hosting
   - Click "Get started"

## Step 2: Local Setup

### 2.1 Clone and Navigate

```bash
cd "g:\Tareef\Code\Event\Fest Web\backend"
```

### 2.2 Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2.3 Login to Firebase

```bash
firebase login
```

This will open a browser for authentication.

### 2.4 Initialize Firebase

```bash
firebase init
```

Select the following options:
- Firestore: Configure Firestore
- Functions: Configure Cloud Functions
- Hosting: Configure Firebase Hosting (optional)

When prompted:
- Use an existing project: Select "DRMC Tech Carnival 2026"
- What language: JavaScript
- Do you want to use ESLint: No
- Do you want to install dependencies: Yes

### 2.5 Copy Configuration Files

The firebase.json and firestore.rules files are already created. Make sure they're in the backend folder.

## Step 3: Deploy Firestore Configuration

### 3.1 Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3.2 Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

## Step 4: Install Function Dependencies

```bash
cd functions
npm install
```

## Step 5: Configure Email Service

### 5.1 For Gmail (Recommended)

1. Enable 2-factor authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate a new app password (select "Mail" and "Other")
4. Copy the 16-character password

### 5.2 Set Firebase Config

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-16-char-app-password"
```

## Step 6: Import Mock Data

### 6.1 Download Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `service-account-key.json` in the backend folder
4. **IMPORTANT**: Never commit this file to version control!

### 6.2 Install Firebase Admin SDK

```bash
cd backend
npm install firebase-admin
```

### 6.3 Run Data Import

```bash
node setup-data.js
```

This will import data from the `data/` folder:
- `data/segments.mock.json` - 43 segments with fees and prizes
- `data/schedule.mock.json` - 3-day schedule
- `data/registrations.mock.json` - 20 sample registrations
- `data/volunteers.mock.json` - 20 sample volunteer applications
- Default admin user

## Step 7: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will take a few minutes. You'll see the function URLs after deployment.

## Step 8: Update Frontend Configuration

### 8.1 Edit config.js

Open `config.js` in the project root and update:

```javascript
const CONFIG = {
  // Update to your Firebase Functions URL
  API_BASE: 'https://your-project-id.firebaseapp.com/api',
  
  // Set to true to use the real API
  USE_API: true,
  
  // Event details
  EVENT: {
    name: '9th DRMC International Tech Carnival 2026',
    startDate: '2026-10-08',
    endDate: '2026-10-10',
    venue: 'Dhaka Residential Model College',
    bKashNumber: '01814333287'
  }
};
```

Your function URL will be shown after deployment, typically:
`https://your-project-id.cloudfunctions.net/api`

## Step 9: Deploy Admin Panel

### 9.1 Update Admin Panel Config

Open `backend/admin/index.html` and update the Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Get these values from Firebase Console → Project Settings → General → Your apps.

### 9.2 Deploy Admin Panel

Option 1: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Option 2: Deploy to Netlify/Vercel (upload the admin folder)

## Step 10: Create Admin User

### 10.1 Create User in Firebase Auth

1. Go to Firebase Console → Authentication
2. Click "Add user"
3. Email: admin@drmcitclub.com (or your preferred email)
4. Password: Choose a strong password
5. Click "Add user"

### 10.2 Add User to Firestore

Using the Firebase Console or the setup script, ensure the user exists in the `users` collection with role 'admin':

```javascript
{
  email: "admin@drmcitclub.com",
  role: "admin",
  createdAt: timestamp
}
```

## Step 11: Add reCAPTCHA (Optional but Recommended)

### 11.1 Get reCAPTCHA Site Key

1. Go to [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register a new site
3. Select reCAPTCHA v3
4. Add your domain (localhost for testing, your production domain)
5. Copy the site key and secret key

### 11.2 Add to Firebase Config

```bash
firebase functions:config:set recaptcha.site_key="YOUR_SITE_KEY" recaptcha.secret_key="YOUR_SECRET_KEY"
```

### 11.3 Update Frontend

Add reCAPTCHA to the registration forms:

```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>
```

## Step 12: Test the Deployment

### 12.1 Test Registration

1. Open the frontend in your browser
2. Fill out the registration form
3. Submit
4. Check your email for confirmation
5. Check Firebase Console → Firestore → registrations

### 12.2 Test Volunteer Application

1. Open the volunteer form
2. Fill out and submit
3. Check Firebase Console → Firestore → volunteers

### 12.3 Test Admin Panel

1. Open the admin panel URL
2. Login with admin credentials
3. Verify you can see registrations and volunteers
4. Test payment verification

## Step 13: Monitor and Maintain

### 13.1 Set Up Monitoring

1. Go to Firebase Console → Cloud Functions
2. Click on a function to view logs
3. Set up alerts for errors

### 13.2 Check Usage

1. Go to Firebase Console → Usage and billing
2. Monitor Firestore reads/writes
3. Monitor Cloud Functions invocations
4. Set budget alerts

### 13.3 Regular Tasks

- Check payment verifications daily
- Review volunteer applications
- Monitor email delivery
- Check for spam registrations
- Update segment fees/prizes as needed via admin panel

## Troubleshooting

### Functions won't deploy

- Check Node.js version (must be 18+)
- Run `npm install` in functions folder
- Check Firebase CLI version: `firebase --version`
- Update if needed: `npm install -g firebase-tools@latest`

### Email not sending

- Verify email credentials with `firebase functions:config:get`
- Check Cloud Functions logs for errors
- For Gmail, ensure app password is correct
- Check if 2FA is enabled on the email account

### Firestore rules denied

- Check if user is authenticated
- Verify user role in users collection
- Test rules in Firebase Console → Firestore → Rules → Simulator

### Payment verification issues

- Ensure TxID is unique
- Check Firestore for existing TxID
- Verify the registration exists before updating

### Rate limiting too strict

- Edit `functions/index.js`
- Change `RATE_LIMIT` value
- Redeploy functions

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Admin authentication enabled
- [ ] Email credentials configured
- [ ] Service account key secured (not in git)
- [ ] reCAPTCHA enabled
- [ ] Rate limiting active
- [ ] HTTPS enforced
- [ ] PII retention policy set
- [ ] Budget alerts configured
- [ ] Regular backups planned

## Cost Estimation

### Free Tier (Spark Plan)
- Firestore: 50K reads/day, 20K writes/day
- Cloud Functions: 125K invocations/month
- Hosting: 10GB/month

### Blaze Plan (Pay-as-you-go)
- Firestore: $0.18/GB stored, $0.06/100K reads, $0.18/100K writes
- Cloud Functions: $0.40/million invocations
- Hosting: $0.15/GB served

### Estimated Costs for Event
- 500 registrations: ~$5-10 Firestore
- 100 volunteers: ~$1-2 Firestore
- Email sending: Free (Gmail) or minimal with SMTP
- Cloud Functions: ~$5-10 for 1000 invocations
- **Total**: ~$15-25 for the event period

## Support

For issues:
1. Check Firebase Console logs
2. Review this deployment guide
3. Check Firebase documentation
4. Contact DRMC IT Club tech team

## Next Steps

After deployment:
1. Test all forms thoroughly
2. Train admin team on using the admin panel
3. Set up payment verification workflow
4. Create backup plan for data
5. Prepare contingency for technical issues
6. Document any custom changes
