# Quick Guide: Deploy to Firebase Hosting

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged into Firebase: `firebase login`

## Deployment Steps

### 1. Navigate to project root
```bash
cd "G:\Tareef\Code\Event\Fest Web"
```

### 2. Initialize Firebase (if not already done)
```bash
firebase init
```
Select:
- **Hosting**: Configure Firebase Hosting
- Use existing project: `drmc-tech-carnival-2026`
- Public directory: `public`
- Configure as single-page app: **No**
- Set up automatic builds: **No**

### 3. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

This will:
- Upload files from the `public/` folder
- Give you a URL like: `https://drmc-tech-carnival-2026.web.app` or `https://drmc-tech-carnival-2026.firebaseapp.com`

### 4. Copy the deployment URL
After deployment completes, Firebase will show:
```
✔ Deploy complete!
Project Console: https://console.firebase.google.com/project/drmc-tech-carnival-2026/overview
Hosting URL: https://drmc-tech-carnival-2026.web.app
```

Copy the **Hosting URL**.

## Update README with Deployment URL

### Option 1: Manual Edit
Open `README.md` and go to line 117. Change:
```markdown
**Demo URL**: [https://your-deployment-url.com](https://your-deployment-url.com)
```
To:
```markdown
**Demo URL**: [https://drmc-tech-carnival-2026.web.app](https://drmc-tech-carnival-2026.web.app)
```

### Option 2: Use the deployment URL you got
Replace with whatever URL Firebase gives you (could be `.web.app` or `.firebaseapp.com`).

## Other README Updates to Consider

### Update GitHub Repository URL (line 75)
If you push to GitHub, update:
```markdown
git clone https://github.com/your-username/drmc-smart-club-operations.git
```

### Update package.json repository URLs (lines 36-48)
```json
"repository": {
  "type": "git",
  "url": "https://github.com/your-username/drmc-smart-club-operations.git"
},
"bugs": {
  "url": "https://github.com/your-username/drmc-smart-club-operations/issues"
},
"homepage": "https://github.com/your-username/drmc-smart-club-operations#readme"
```

## Testing the Deployment

After deployment:
1. Open the deployment URL in browser
2. Test the fest directory
3. Test event registration
4. Test admin panel
5. Test all features to ensure everything works

## Custom Domain (Optional)

If you want a custom domain:
1. Go to Firebase Console → Hosting → Custom domains
2. Add your domain (e.g., `techcarnival.drmc.edu.bd`)
3. Follow DNS setup instructions
4. Update README with custom domain URL

## Troubleshooting

### Deployment fails
- Check you're logged in: `firebase login`
- Check project exists in Firebase Console
- Verify `firebase.json` points to correct public directory

### Wrong files deployed
- Check `firebase.json` hosting section:
```json
"hosting": {
  "public": "public",
  "ignore": [
    "firebase.json",
    "**/.*",
    "**/node_modules/**"
  ]
}
```

### URL not accessible
- Wait a few minutes for DNS propagation
- Check Firebase Console → Hosting for deployment status
- Try the `.firebaseapp.com` URL if `.web.app` doesn't work
