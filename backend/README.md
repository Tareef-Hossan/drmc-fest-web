# DRMC Tech Carnival 2026 - Backend

This is the backend system for the 9th DRMC International Tech Carnival 2026, built with Firebase Firestore and Cloud Functions.

## Features

- **Registration System**: Handle participant registrations with validation, duplicate checks, and server-side fee calculation
- **Volunteer Management**: Accept and manage volunteer applications
- **Payment Verification**: Track bKash transaction IDs and payment status
- **Admin Panel**: Role-based access for managing registrations, volunteers, and payments
- **Email Notifications**: Automated confirmation emails for registrations and volunteer applications
- **Rate Limiting**: Protect against form abuse
- **Security**: Firestore security rules, input validation, and sanitization

## Setup Instructions

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: "DRMC Tech Carnival 2026"
3. Enable Firestore Database (in production mode)
4. Enable Cloud Functions

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 3. Initialize Firebase

```bash
cd backend
firebase login
firebase init
```

Select:
- Firestore: Configure Firestore
- Functions: Configure Cloud Functions
- Hosting: Configure Firebase Hosting

### 4. Install Dependencies

```bash
cd functions
npm install
```

### 5. Configure Email

Set up your email credentials (Gmail or any SMTP provider):

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-app-password"
```

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an app password at https://myaccount.google.com/apppasswords

### 6. Deploy Firestore Rules and Indexes

```bash
cd backend
firebase deploy --only firestore
```

### 7. Import Mock Data

1. Download service account key from Firebase Console → Project Settings → Service Accounts
2. Save it as `service-account-key.json` in the backend folder
3. Install dependencies:

```bash
npm install firebase-admin
```

4. Run the import script:

```bash
node setup-data.js
```

### 8. Deploy Cloud Functions

```bash
firebase deploy --only functions
```

### 9. Deploy Hosting (Optional)

```bash
firebase deploy --only hosting
```

## API Endpoints

### POST /api/registrations
Create a new registration

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "01712345678",
  "institution": "Example School",
  "level": "Senior",
  "teamName": "Team Name (optional)",
  "segments": ["Programming Contest", "Google It"],
  "txId": "TXN123456789",
  "consent": true
}
```

**Response:**
```json
{
  "success": true,
  "regId": "DRMC26-A1B2C3",
  "message": "Registration successful. Please keep your registration ID safe."
}
```

### POST /api/volunteers
Submit a volunteer application

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "01812345678",
  "institution": "Example College",
  "team": "Event Operations",
  "availability": "All 3 days",
  "reason": "I want to help...",
  "experience": "Previous experience..."
}
```

### GET /api/segments
Get all segments with fees and details

### GET /api/schedule
Get the event schedule

## Database Structure

### Collections

**segments**: Segment details (fees, prizes, team size, format, day)
**schedule**: Event schedule by day
**registrations**: Participant registrations
**volunteers**: Volunteer applications
**users**: Admin users (role-based access)
**settings**: Event settings (can be edited by admin)

## Security

- Firestore security rules restrict access based on user roles
- Server-side validation on all inputs
- Rate limiting (5 requests per minute per IP)
- Duplicate checks (email/phone + segment)
- Payment verification workflow
- PII handling for minors (retention policy recommended)

## Admin Panel

To access the admin panel, you'll need to:
1. Create an admin user in the `users` collection
2. Implement authentication (Firebase Auth recommended)
3. Build the admin UI (see admin-panel folder)

## Development

### Run Local Emulator

```bash
firebase emulators:start
```

### Test Locally

The emulator will run at:
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Hosting: http://localhost:5000

## Production Considerations

1. **Add reCAPTCHA**: Integrate Google reCAPTCHA v3 to prevent bot submissions
2. **Use Redis for rate limiting**: For production, use Redis instead of in-memory rate limiting
3. **Set up monitoring**: Use Firebase Performance Monitoring and Crashlytics
4. **Configure budget alerts**: Set budget alerts in Firebase Console
5. **PII retention policy**: Set up automatic deletion of registrations after the event
6. **bKash merchant API**: If available, integrate real bKash payment verification

## Troubleshooting

### Functions deployment fails
- Check that Node.js version is 18 or higher
- Ensure all dependencies are installed
- Check Firebase console for error logs

### Email not sending
- Verify email credentials are correct
- Check if app password is valid (for Gmail)
- Check Cloud Functions logs

### Firestore rules denied
- Ensure user is authenticated
- Check user role in the users collection
- Verify rules match your data structure

## Support

For issues or questions, contact the DRMC IT Club team.
