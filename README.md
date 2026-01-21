# Dag in beeld - Admin Panel

Admin panel for managing the "Dag in beeld" (Day in view) caregiver communication app.

## Features

- 🔐 **Authentication**: Firebase Auth with admin verification
- 📊 **Dashboard**: Statistics and recent activity overview
- 👥 **User Management**: View, search, and export user data
- 🖼️ **Pictogram Management**: Upload, edit, activate/deactivate, and delete custom pictograms
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React.js with Redux Toolkit
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Firestore and Storage enabled
- Firebase Admin SDK service account key

## Setup Instructions

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 2. Firebase Configuration

#### Backend Setup:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate a new private key
3. Download the JSON file
4. Save it as `server/serviceAccountKey.json`

#### Frontend Setup:
The Firebase config is already set up in `client/src/config/firebase.js` with your project credentials.

### 3. Environment Variables

Create a `server/.env` file (optional, defaults are set):

```env
PORT=5000
```

### 4. Firebase Security Rules

Make sure your Firestore and Storage rules are configured:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admin_users/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
    }
    match /caregivers/{caregiverId} {
      allow read: if request.auth != null;
    }
    match /custom_pictograms/{pictogramId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.isAdmin == true;
    }
    match /pictogram_sets/{setId} {
      allow read: if request.auth != null;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /custom_pictograms/{pictogramId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    firestore.get(/databases/(default)/documents/admin_users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### 5. Create Admin User

Before logging in, you need to create an admin user in Firestore:

1. Create a user account in Firebase Authentication (Email/Password)
2. Add a document in the `admin_users` collection with:
   - Document ID: The user's UID from Firebase Auth
   - Fields:
     - `email`: User's email
     - `isAdmin`: `true`
     - `createdAt`: Server timestamp

## Running the Application

### Development Mode

Run both server and client concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Production Build

```bash
# Build frontend
npm run build

# The built files will be in client/build/
```

## Project Structure

```
caregiver-admin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── store/        # Redux store
│   │   └── config/       # Firebase config
│   └── public/
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Auth middleware
│   └── index.js          # Server entry point
└── package.json          # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify admin token

### Statistics
- `GET /api/stats/dashboard` - Get dashboard statistics

### Users
- `GET /api/users` - Get users (with pagination and search)
- `GET /api/users/count` - Get user count

### Pictograms
- `GET /api/pictograms` - Get pictograms (with pagination, search, and category filter)
- `POST /api/pictograms/upload` - Upload new pictogram
- `PUT /api/pictograms/:id` - Update pictogram
- `DELETE /api/pictograms/:id` - Delete pictogram
- `GET /api/pictograms/count` - Get active pictogram count

## Features Overview

### Dashboard
- Total users count
- Active pictograms count
- Pictogram sets count
- Recent users (last 10)
- Recent pictograms (last 10)

### User Management
- View all registered users
- Search by name
- Pagination (20 users per page)
- Export to CSV

### Pictogram Management
- Upload new pictograms (PNG, JPG, JPEG, max 5MB)
- View all pictograms in grid layout
- Edit keyword, category, description, and active status
- Activate/Deactivate pictograms
- Delete pictograms (removes from Firestore and Storage)
- Filter by category
- Search by keyword
- Pagination

## Pictogram Categories

The app supports 17 categories:
- eten (Feeding)
- vrijetijd (Leisure)
- plaats (Place)
- levendWezen (Living being)
- onderwijs (Education)
- tijd (Time)
- diversen (Miscellaneous)
- beweging (Movement)
- religie (Religion)
- werk (Work)
- communicatie (Communication)
- document (Document)
- kennis (Knowledge)
- object (Object)
- gevoelens (Emotions)
- gezondheid (Health)
- lichaam (Body)

## Security

- All API routes are protected with admin verification middleware
- Firebase Security Rules enforce access control
- File upload validation (type and size)
- Input sanitization

## Troubleshooting

### Common Issues

1. **"Access denied" error**: Make sure the user exists in `admin_users` collection with `isAdmin: true`
2. **Firebase connection errors**: Verify Firebase config and service account key
3. **Image upload fails**: Check Storage rules and file size (max 5MB)
4. **CORS errors**: Ensure backend CORS is configured correctly

## License

Private project for Dag in beeld app.
