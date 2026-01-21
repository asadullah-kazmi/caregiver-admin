const admin = require('firebase-admin');

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const adminDoc = await admin.firestore().collection('admin_users').doc(decodedToken.uid).get();

    if (!adminDoc.exists || !adminDoc.data().isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { verifyAdmin };
