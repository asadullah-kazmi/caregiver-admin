# Quick Start Guide

## Step 1: Install Dependencies

```bash
npm run install-all
```

This installs all dependencies for:
- Root project
- Backend server
- Frontend client

## Step 2: Verify Firebase Service Account Key

Make sure `server/serviceAccountKey.json` exists and contains your Firebase service account credentials.

## Step 3: Start the Backend Server

### Option A: Backend Only
```bash
npm run server
```

### Option B: Both Backend and Frontend
```bash
npm run dev
```

## Step 4: Verify Server is Running

You should see:
```
Server running on port 5000
```

Test the server by visiting:
- http://localhost:5000/api/health

You should see: `{"status":"ok"}`

## Step 5: Access the Admin Panel

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Troubleshooting

### Port 5000 already in use?
Change the port in `server/index.js`:
```javascript
const PORT = process.env.PORT || 5001; // Change to 5001 or any available port
```

### Dependencies not installed?
Make sure you ran `npm run install-all` from the root directory.

### Firebase errors?
Verify `server/serviceAccountKey.json` is correctly configured.
