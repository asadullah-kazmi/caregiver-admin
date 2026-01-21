# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm run install-all
```

This will install dependencies for:
- Root project
- Server (backend)
- Client (frontend)

## Step 2: Firebase Service Account Key

1. Download the service account key from Firebase Console
2. Save it as `server/serviceAccountKey.json`

See `server/README.md` for detailed instructions.

## Step 3: Create Your First Admin User

Before you can log in, you need to create an admin user:

### Option A: Using Firebase Console

1. Go to Firebase Console → Authentication
2. Add a new user with email/password
3. Copy the User UID
4. Go to Firestore Database
5. Create a new document in the `admin_users` collection:
   - Document ID: The User UID you copied
   - Fields:
     - `email` (string): The user's email
     - `isAdmin` (boolean): `true`
     - `createdAt` (timestamp): Current timestamp

### Option B: Using Firebase CLI

```bash
# Create user in Auth
firebase auth:import users.json

# Then add to Firestore (you'll need to do this manually or via script)
```

## Step 4: Start the Application

```bash
npm run dev
```

This starts both:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

## Step 5: Login

1. Open http://localhost:3000
2. Use the email and password you created in Step 3
3. You should now have access to the admin panel!

## Troubleshooting

### "Access denied" error
- Make sure the user exists in `admin_users` collection
- Verify `isAdmin` is set to `true`
- Check that the document ID matches the Firebase Auth UID

### Firebase connection errors
- Verify `server/serviceAccountKey.json` exists and is valid
- Check Firebase project ID matches: `caregiver-cba18`

### Port already in use
- Change PORT in `server/.env` or `server/index.js`
- Change React port: `PORT=3001 npm start` in client directory
