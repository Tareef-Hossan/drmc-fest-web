# Your To-Do List - Things You Need to Do

This is a checklist of tasks that YOU need to complete to make the project fully functional and deployed.

## ✅ Completed Tasks (Already Done)

- [x] Design template applied to all fest pages (tech-carnival-2026.html, winter-tech-fest-2026.html, freshers-tech-fest-2027.html)
- [x] Navigation links updated with "Back to Fests" functionality
- [x] CSS bugs fixed in dashboard.html and admin.html (missing .chip class definition)
- [x] Sitemap.xml updated with all fest pages and correct URLs
- [x] Robots.txt updated with proper disallow rules for admin/dashboard
- [x] All HTML files checked for syntax errors
- [x] Backend functions verified for correctness
- [x] Configuration files reviewed
- [x] Footer dates updated in winter-tech-fest-2026.html (15-17 Dec 2026)
- [x] Footer dates updated in freshers-tech-fest-2027.html (20-22 Jan 2027)
- [x] Countdown timer dates updated in winter-tech-fest-2026.html
- [x] Countdown timer dates updated in freshers-tech-fest-2027.html
- [x] Search tip text updated to be generic (removed "43 segments" count)
- [x] Footer copyright year updated in freshers-tech-fest-2027.html to 2027
- [x] All links and navigation verified to work correctly

## 🔴 Critical (Must Do Before Going Live)

### 1. Create Firebase Project
- [ ] Go to https://console.firebase.google.com/
- [ ] Create a new project named "DRMC Tech Carnival 2026"
- [ ] Enable Firestore Database (production mode)
- [ ] Enable Cloud Functions
- [ ] Enable Authentication (Email/Password)
- [ ] Enable Hosting (optional but recommended)

### 2. Install Dependencies
```bash
npm run install:all
```
This will install:
- Root dependencies (eslint, prettier, serve)
- Backend dependencies (firebase-admin, etc.)

### 3. Configure Firebase Locally
```bash
cd backend
firebase login
firebase init
```
- Select your project: "DRMC Tech Carnival 2026"
- Select: Firestore, Functions, Hosting
- Choose JavaScript for Functions
- Hosting public directory: `../public`

### 4. Deploy Firestore Configuration
```bash
cd backend
firebase deploy --only firestore
```
This deploys security rules and indexes.

### 5. Configure Email Service
- [ ] Enable 2FA on your Gmail account
- [ ] Generate app password at https://myaccount.google.com/apppasswords
- [ ] Run: `firebase functions:config:set email.user="your-email@gmail.com" email.pass="your-16-char-password"`

### 6. Import Mock Data
```bash
cd backend
npm install firebase-admin
```
- [ ] Download service account key from Firebase Console → Project Settings → Service Accounts
- [ ] Save as `service-account-key.json` in `backend/` folder
- [ ] Run: `node setup-data.js`
- [ ] Verify data appears in Firebase Console → Firestore

### 7. Deploy Cloud Functions
```bash
cd backend
firebase deploy --only functions
```
- [ ] Note the function URL (will be shown after deployment)
- [ ] It will look like: `https://your-project-id.cloudfunctions.net/api`

### 8. Update Frontend Configuration
Edit `public/config.js`:
```javascript
const CONFIG = {
  API_BASE: 'https://your-project-id.cloudfunctions.net/api',  // Use your actual URL
  USE_API: true,  // Change from false to true
  EVENT: {
    name: '9th DRMC International Tech Carnival 2026',
    startDate: '2026-10-08',
    endDate: '2026-10-10',
    venue: 'Dhaka Residential Model College',
    bKashNumber: '01814333287'
  }
};
```

### 9. Deploy Frontend
```bash
cd backend
firebase deploy --only hosting
```
- [ ] Your site will be live at: `https://your-project-id.web.app`

### 10. Create Admin User
- [ ] Go to Firebase Console → Authentication
- [ ] Click "Add user"
- [ ] Email: admin@drmcitclub.com (or your preferred email)
- [ ] Password: Choose a strong password
- [ ] Click "Add user"
- [ ] Add this user to Firestore `users` collection with role: 'admin'

### 11. Test Everything
- [ ] Open your deployed site
- [ ] Test registration form (submit a test registration)
- [ ] Check email for confirmation
- [ ] Test volunteer form
- [ ] Login to admin panel
- [ ] Verify you can see registrations
- [ ] Test payment verification

## 🟡 Important (Highly Recommended)

### 12. Add PWA Icons
- [ ] Create your logo as PNG with transparent background
- [ ] Go to https://realfavicongenerator.net/
- [ ] Upload your logo
- [ ] Generate all icon sizes
- [ ] Download and place files in `public/assets/icons/`
- [ ] Specifically need: icon-192x192.png, icon-512x512.png

### 13. Add reCAPTCHA (Spam Protection)
- [ ] Go to https://www.google.com/recaptcha/admin
- [ ] Register a new site
- [ ] Select reCAPTCHA v3
- [ ] Add your domain (localhost for testing, your production domain)
- [ ] Copy site key and secret key
- [ ] Run: `firebase functions:config:set recaptcha.site_key="YOUR_KEY" recaptcha.secret_key="YOUR_SECRET"`
- [ ] Add reCAPTCHA script to HTML (optional but recommended)

### 14. Set Up Budget Alerts
- [ ] Go to Firebase Console → Usage and billing
- [ ] Set budget alerts for $10, $20, $50
- [ ] Monitor Firestore reads/writes
- [ ] Monitor Cloud Functions invocations

### 15. Configure Domain (Optional)
- [ ] Buy a domain (e.g., drmcitclub.com)
- [ ] Go to Firebase Console → Hosting → Custom domains
- [ ] Add your domain
- [ ] Update DNS records as instructed
- [ ] Enable SSL certificate

## 🟢 Nice to Have (Optional Enhancements)

### 16. Add Analytics
- [ ] Enable Google Analytics in Firebase Console
- [ ] Add analytics tracking code to HTML
- [ ] Track form submissions, page views

### 17. Add Error Tracking
- [ ] Enable Firebase Crashlytics
- [ ] Add to functions and frontend
- [ ] Monitor for errors

### 18. Set Up Automated Backups
- [ ] Configure Firestore export to Cloud Storage
- [ ] Schedule daily backups
- [ ] Test restore process

### 19. Create Social Media Assets
- [ ] Create social media sharing images
- [ ] Update Open Graph tags with actual URLs
- [ ] Test sharing on Facebook/Twitter

### 20. Update Contact Information
- [ ] Update email in contact forms
- [ ] Update phone number
- [ ] Update social media links

## 📋 Pre-Launch Checklist

Before going live, verify:

- [ ] All forms work correctly
- [ ] Email notifications are sent
- [ ] Admin panel is accessible
- [ ] Payment verification works
- [ ] Site loads on mobile devices
- [ ] Dark/light theme works
- [ ] All links are correct
- [ ] bKash number is correct
- [ ] Event dates are correct
- [ ] Venue information is accurate
- [ ] No console errors
- [ ] Sitemap is accessible at /sitemap.xml
- [ ] Robots.txt is accessible at /robots.txt
- [ ] SSL certificate is valid
- [ ] Domain is pointing correctly

## 🔐 Security Checklist

- [ ] Service account key is NOT in Git (check .gitignore)
- [ ] No .env files are committed
- [ ] Admin password is strong
- [ ] Email credentials are secure
- [ ] Firestore rules are deployed
- [ ] Rate limiting is active
- [ ] reCAPTCHA is configured (if added)
- [ ] Budget alerts are set

## 💰 Cost Monitoring

- [ ] Check estimated costs in Firebase Console
- [ ] Expected cost: $15-25 for the event period
- [ ] Monitor daily during event
- [ ] Set budget alerts

## 📞 Support Contacts

- [ ] Document admin team contacts
- [ ] Document Firebase support contacts
- [ ] Document emergency procedures

## 🎯 Timeline Suggested

### 1 Week Before Event
- ✅ Complete all critical tasks (1-11)
- ✅ Test everything thoroughly
- ✅ Train admin team

### 3 Days Before Event
- ✅ Add PWA icons (task 12)
- ✅ Set up budget alerts (task 14)
- ✅ Do final testing

### 1 Day Before Event
- ✅ Monitor deployment
- ✅ Check email delivery
- ✅ Verify admin access

### During Event
- ✅ Monitor registrations daily
- ✅ Check payment verifications
- ✅ Review volunteer applications
- ✅ Monitor costs

### After Event
- ✅ Export all data
- ✅ Archive registrations
- ✅ Clean up unused data
- ✅ Review costs
- ✅ Document lessons learned

## 📝 Notes

- **Service Account Key**: Never commit this file. It's already in .gitignore but double-check.
- **Email Password**: Use app password, not your regular Gmail password
- **Testing**: Use the emulator locally first: `npm run emulator`
- **Rollback**: If something goes wrong, you can rollback: `firebase deploy --only hosting:production --force`
- **Documentation**: Keep these docs updated as you make changes

## ❓ Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Backend Guide: `backend/DEPLOYMENT.md`
- Backend Docs: `backend/README.md`
- Project Structure: `TREE.md`

---

**Pro Tip**: Start with tasks 1-11 (Critical section). Once those are done, your site will be fully functional. The rest are enhancements that can be added later.
