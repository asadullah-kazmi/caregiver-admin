require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Use env var for Firebase service account on Vercel, fall back to local file for dev
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('./serviceAccountKey.json');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const pictogramRoutes = require('./routes/pictograms');
const statsRoutes = require('./routes/stats');
const categoryRoutes = require('./routes/categories');
const requestRoutes = require('./routes/requests');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 5000;

// Initialize Firebase Admin
// Try multiple bucket name formats - Firebase uses different formats
const projectId = serviceAccount.project_id || 'caregiver-cba18';
// Try the newer format first (from client config), fallback to older format
const storageBucket = `${projectId}.firebasestorage.app`;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: storageBucket
});

// Log the bucket name being used for debugging
console.log(`Firebase initialized with storage bucket: ${storageBucket}`);

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pictograms', pictogramRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/requests', requestRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export the app for Vercel serverless functions
module.exports = app;

// Only start the server if not running in Vercel serverless mode
if (process.env.VERCEL !== '1') {
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Gracefully handle port-in-use errors in development
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const fallbackPort = PORT + 1;
      console.error(
        `Port ${PORT} is already in use. Trying fallback port ${fallbackPort}...`
      );

      app
        .listen(fallbackPort, () => {
          console.log(`Server running on fallback port ${fallbackPort}`);
        })
        .on('error', (fallbackErr) => {
          console.error(
            `Failed to start server on fallback port ${fallbackPort}:`,
            fallbackErr
          );
          process.exit(1);
        });
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}
