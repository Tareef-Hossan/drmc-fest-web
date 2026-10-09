# Firebase Configuration Update for Multi-Fest Architecture

## Overview
The Firebase backend has been updated to support the new multi-fest platform architecture (Organization → Fest → Event), replacing the previous single-fest structure.

## Changes Made

### 1. Firestore Security Rules (`firestore.rules`)

**Before:** Single-fest structure with segments
```javascript
match /segments/{id} {
  allow read: if true;
  allow write: if isAdmin();
}
```

**After:** Multi-fest structure with fests and events
```javascript
match /fests/{festId} {
  allow read: if true;
  allow write: if isAdmin();
}

match /events/{eventId} {
  allow read: if true;
  allow write: if isAdmin();
}
```

**Registration Schema Update:**
- Removed: `segments` (array of segment IDs)
- Removed: `level` (participation level)
- Added: `eventId` (single event reference)
- Added: `fee` (event fee)
- Updated: `paymentStatus` values (`pending`, `confirmed`, `rejected`)

### 2. Cloud Functions (`functions/index.js`)

**Updated Endpoints:**

| Old Endpoint | New Endpoint | Purpose |
|--------------|--------------|---------|
| `POST /api/registrations` | `POST /api/registrations` | Create registration (updated schema) |
| `GET /api/segments` | `GET /api/fests` | Get all fests |
| `GET /api/schedule` | `GET /api/events` | Get all events |
| - | `GET /api/events?festId=xxx` | Get events for specific fest |

**Registration Logic Update:**
- Now registers for a single event (not multiple segments)
- Checks event capacity before allowing registration
- Checks event deadline before allowing registration
- Increments event's `registered` count on successful registration
- Validates against `eventId` instead of `segments` array

### 3. Data Import Script (`setup-data.js`)

**Before:** Imported segments, schedule, registrations, volunteers
**After:** Imports fests, events, registrations, volunteers

```javascript
// Old
const segments = require('./data/segments.mock.json');
for (const [name, data] of Object.entries(segments)) {
  await db.collection('segments').doc(name).set(data);
}

// New
const fests = require('./data/fests.mock.json');
for (const [id, data] of Object.entries(fests)) {
  await db.collection('fests').doc(id).set(data);
}

const events = require('./data/events.mock.json');
for (const [id, data] of Object.entries(events)) {
  await db.collection('events').doc(id).set(data);
}
```

### 4. Firestore Indexes (`firestore.indexes.json`)

**Updated Indexes:**
- Email + eventId (for duplicate checking)
- Phone + eventId (for duplicate checking)
- PaymentStatus (for admin filtering)
- FestId (for event queries by fest)

### 5. Mock Data Files

**New Files:**
- `fests.mock.json` - Contains 3 sample fests
- `events.mock.json` - Contains 9 sample events across fests
- `registrations.mock.json` - Updated to use new schema

**Removed/Deprecated:**
- `segments.mock.json` - Replaced by events structure
- `schedule.mock.json` - Can be re-added if needed

## Database Schema

### Fest Collection
```javascript
{
  id: "tech-carnival-2026",
  name: "9th DRMC International Tech Carnival 2026",
  description: "...",
  startDate: "2026-10-08",
  endDate: "2026-10-10",
  venue: "Dhaka Residential Model College",
  image: "https://...",
  status: "upcoming",
  category: "Tech Festival",
  organization: "DRMC IT Club"
}
```

### Event Collection
```javascript
{
  id: "ai-web-dev-2026",
  festId: "tech-carnival-2026",
  name: "AI Web Development Contest",
  description: "...",
  category: "Programming",
  fee: 400,
  prizes: [12000, 8000, 4000],
  maxTeamSize: 3,
  format: "Build an AI web app · 6 hrs",
  day: "Day 1",
  deadline: "2026-10-05T23:59:59",
  capacity: 30,
  registered: 15,
  venue: "Computer Lab 1",
  requirements: "...",
  rules: "..."
}
```

### Registration Collection
```javascript
{
  regId: "DRMC26-ABC123",
  eventId: "ai-web-dev-2026",
  name: "John Doe",
  email: "john@example.com",
  phone: "01712345678",
  institution: "Dhaka University",
  teamName: "Code Warriors",
  txId: "TX123456789",
  consent: true,
  fee: 400,
  paymentStatus: "pending",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Deployment Steps

1. **Update Firebase Config:**
   ```bash
   cd backend
   firebase deploy --only firestore
   firebase deploy --only functions
   ```

2. **Import New Data:**
   ```bash
   cd backend
   node setup-data.js
   ```

3. **Update Frontend Config:**
   - Update `public/config.js` with new API endpoints
   - Update mock data in frontend files to match new schema

## Backward Compatibility

**Note:** This is a breaking change. The old single-fest structure is not compatible with the new multi-fest architecture. If you need to migrate existing data:

1. Convert segments to events
2. Create fest documents
3. Update registration documents to reference event IDs instead of segment arrays
4. Remove level field from registrations

## Testing

**Test the new API endpoints:**
```bash
# Get all fests
curl https://your-project.firebaseapp.com/api/fests

# Get all events
curl https://your-project.firebaseapp.com/api/events

# Get events for specific fest
curl https://your-project.firebaseapp.com/api/events?festId=tech-carnival-2026

# Create registration
curl -X POST https://your-project.firebaseapp.com/api/registrations \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "ai-web-dev-2026",
    "name": "Test User",
    "email": "test@example.com",
    "phone": "01712345678",
    "institution": "Test Institution",
    "teamName": "Test Team",
    "txId": "TX123456",
    "consent": true
  }'
```

## Summary

All Firebase backend components have been successfully updated to support the new multi-fest platform architecture. The changes are:

✅ Firestore Security Rules - Updated for fests/events schema
✅ Cloud Functions - New API endpoints for fests/events
✅ Data Import Script - Imports fests and events
✅ Firestore Indexes - Optimized for new queries
✅ Mock Data - Sample data for testing

The Firebase backend is now fully compatible with the new multi-fest frontend and ready for deployment.
