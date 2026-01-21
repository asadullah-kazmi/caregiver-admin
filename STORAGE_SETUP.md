# Firebase Storage Setup Guide

## Issue: "Storage bucket not found"

This error occurs when Firebase Storage hasn't been enabled or the bucket doesn't exist.

## Solution: Enable Firebase Storage

### Step 1: Enable Storage in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **caregiver-cba18**
3. Click on **Storage** in the left sidebar
4. If you see "Get Started", click it
5. Choose **Start in test mode** (we'll set up security rules later)
6. Select a location for your storage (choose the same region as your Firestore if possible)
7. Click **Done**

### Step 2: Verify Bucket Name

After enabling Storage, check the bucket name:

1. In Firebase Console → Storage
2. Look at the URL or bucket name shown
3. It should be one of:
   - `caregiver-cba18.firebasestorage.app` (newer format)
   - `caregiver-cba18.appspot.com` (older format)

### Step 3: Update Server Configuration (if needed)

If your bucket name is different, update `server/index.js`:

```javascript
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'YOUR_ACTUAL_BUCKET_NAME_HERE'
});
```

### Step 4: Test Storage Access

After restarting your server, test the storage connection:

1. Make sure you're logged in as admin
2. Visit: `http://localhost:5000/api/pictograms/test-storage`
3. You should see: `{"success": true, "bucketName": "...", "message": "Storage bucket is accessible"}`

### Step 5: Set Up Storage Security Rules

Go to Firebase Console → Storage → Rules and add:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /custom_pictograms/{pictogramId} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null && 
                    firestore.get(/databases/(default)/documents/admin_users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

Click **Publish**.

## Troubleshooting

### Still getting "bucket not found" error?

1. **Verify Storage is enabled**: Check Firebase Console → Storage
2. **Check bucket name**: Use the test endpoint to see what bucket name is being used
3. **Check service account permissions**: Make sure your service account has Storage Admin role
4. **Restart server**: After enabling Storage, restart your Node.js server

### Service Account Permissions

Your service account needs Storage permissions:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **caregiver-cba18**
3. Go to **IAM & Admin** → **IAM**
4. Find your service account email (from `serviceAccountKey.json`)
5. Make sure it has **Storage Admin** or **Storage Object Admin** role

## Quick Test

After enabling Storage, restart your server and try uploading a pictogram again. The error should be resolved!
