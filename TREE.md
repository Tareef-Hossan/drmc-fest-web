# Project Structure

```
drmc-tech-carnival-2026/
├── .env.example                    # Environment variables template
├── .eslintrc.json                  # ESLint configuration
├── .gitignore                      # Git ignore rules
├── .nvmrc                          # Node.js version specification
├── .prettierrc                     # Prettier configuration
├── .vscode/                        # VS Code settings
│   └── settings.json              # Editor configuration
├── CHANGELOG.md                    # Version history
├── CONTRIBUTING.md                 # Contribution guidelines
├── LICENSE                         # MIT License
├── package.json                    # Root package.json with scripts
├── README.md                       # Main project documentation
├── TREE.md                         # This file - project structure
│
├── public/                         # Frontend assets
│   ├── index.html                 # Main registration page
│   ├── config.js                  # Frontend configuration
│   ├── manifest.json              # PWA manifest
│   ├── robots.txt                 # SEO robots file
│   ├── sitemap.xml                # SEO sitemap
│   └── assets/
│       ├── images/
│       │   └── logo.png          # Event logo
│       └── icons/
│           └── README.md         # Icons guide (add PWA icons here)
│
└── backend/                        # Firebase backend
    ├── .gitignore                 # Backend-specific gitignore
    ├── firebase.json              # Firebase configuration
    ├── firestore.rules            # Database security rules
    ├── firestore.indexes.json     # Database indexes
    ├── README.md                  # Backend documentation
    ├── DEPLOYMENT.md              # Deployment guide
    ├── SUMMARY.md                 # Implementation summary
    ├── setup-data.js              # Data import script
    │
    ├── data/                      # Mock data files
    │   ├── segments.mock.json     # 43 segments with fees/prizes
    │   ├── schedule.mock.json     # 3-day event schedule
    │   ├── registrations.mock.json# Sample registrations
    │   └── volunteers.mock.json   # Sample volunteer applications
    │
    ├── functions/                 # Cloud Functions
    │   ├── index.js              # API endpoints
    │   └── package.json          # Function dependencies
    │
    └── admin/                     # Admin panel
        └── index.html            # Admin dashboard UI
```

## File Descriptions

### Root Configuration
- **.env.example**: Template for environment variables (never commit actual .env)
- **.eslintrc.json**: ESLint configuration for JavaScript linting
- **.gitignore**: Files and directories to exclude from Git
- **.nvmrc**: Specifies Node.js version 18
- **.prettierrc**: Prettier configuration for code formatting
- **.vscode/settings.json**: VS Code editor settings
- **package.json**: Root package file with npm scripts
- **README.md**: Main project documentation
- **CHANGELOG.md**: Version history and changes
- **CONTRIBUTING.md**: Guidelines for contributors
- **LICENSE**: MIT License
- **TREE.md**: This file - detailed project structure

### Frontend (public/)
- **index.html**: Main registration page with all UI
- **config.js**: Frontend configuration (API URL, event details)
- **manifest.json**: Progressive Web App manifest
- **robots.txt**: SEO robots file
- **sitemap.xml**: SEO sitemap
- **assets/images/logo.png**: Event logo
- **assets/icons/**: PWA icons (see README.md in that folder)

### Backend (backend/)
- **firebase.json**: Firebase project configuration
- **firestore.rules**: Database security rules (role-based access)
- **firestore.indexes.json**: Database indexes for queries
- **setup-data.js**: Script to import mock data to Firestore
- **README.md**: Backend-specific documentation
- **DEPLOYMENT.md**: Step-by-step deployment guide
- **SUMMARY.md**: Implementation summary and architecture

### Backend Data (backend/data/)
- **segments.mock.json**: All 43 segments with fees, prizes, team sizes
- **schedule.mock.json**: 3-day event schedule
- **registrations.mock.json**: 20 sample registrations
- **volunteers.mock.json**: 20 sample volunteer applications

### Backend Functions (backend/functions/)
- **index.js**: Cloud Functions for API endpoints
- **package.json**: Function dependencies

### Backend Admin (backend/admin/)
- **index.html**: Admin panel dashboard with authentication

## Key Directories

### /public
Contains all frontend assets that will be served by Firebase Hosting.

### /backend
Contains all Firebase-related files including Cloud Functions, Firestore rules, and admin panel.

### /backend/data
Contains mock data files for initial database population.

### /backend/functions
Contains Cloud Functions source code and dependencies.

### /backend/admin
Contains the admin panel HTML file.

## Important Notes

1. **Never commit**: `.env` files, `service-account-key.json`, or any credentials
2. **Backend structure**: Follows Firebase best practices
3. **Frontend structure**: Simple static site with minimal dependencies
4. **Mock data**: Located in `backend/data/` for easy importing
5. **Configuration**: All configuration in `config.js` and Firebase console
6. **PWA Icons**: Add PWA icons to `public/assets/icons/` (see README.md there)
7. **Code Quality**: ESLint and Prettier configured for consistent code style
