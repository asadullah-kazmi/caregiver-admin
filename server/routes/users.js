const express = require('express');
const admin = require('firebase-admin');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all users with pagination
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = admin.firestore().collection('caregivers');

    // Apply search filter if provided
    if (search) {
      query = query.where('name', '>=', search)
                   .where('name', '<=', search + '\uf8ff');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const total = snapshot.size;
    
    const users = [];
    for (const doc of snapshot.docs.slice(offset, offset + limit)) {
      const userData = doc.data();
      
      // Get email from Firebase Auth
      let email = 'N/A';
      try {
        const userRecord = await admin.auth().getUser(doc.id);
        email = userRecord.email || 'N/A';
      } catch (error) {
        // Silently handle user-not-found errors (user may exist in Firestore but not in Auth)
        if (error.code !== 'auth/user-not-found') {
          console.error(`Error fetching user ${doc.id}:`, error);
        }
      }

      users.push({
        id: doc.id,
        email,
        name: userData.name || 'N/A',
        role: userData.role || 'N/A',
        clientName: userData.clientName || 'N/A',
        ageRange: userData.ageRange || 'N/A',
        language: userData.language || 'N/A',
        createdAt: userData.createdAt?.toDate() || null
      });
    }

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user count
router.get('/count', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('caregivers').count().get();
    res.json({ count: snapshot.data().count });
  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({ error: 'Failed to count users' });
  }
});

module.exports = router;
