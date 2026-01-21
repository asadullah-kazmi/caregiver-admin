const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Verify admin status
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const adminDoc = await admin.firestore().collection('admin_users').doc(decodedToken.uid).get();

    if (!adminDoc.exists || !adminDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    res.json({ 
      success: true, 
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
