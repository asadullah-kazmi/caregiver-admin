const express = require('express');
const admin = require('firebase-admin');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    // Get user count
    const userCountSnapshot = await admin.firestore()
      .collection('caregivers')
      .count()
      .get();
    const userCount = userCountSnapshot.data().count;

    // Get active pictogram count
    const pictogramCountSnapshot = await admin.firestore()
      .collection('custom_pictograms')
      .where('isActive', '==', true)
      .count()
      .get();
    const pictogramCount = pictogramCountSnapshot.data().count;

    // Get pictogram set count
    const setCountSnapshot = await admin.firestore()
      .collection('pictogram_sets')
      .count()
      .get();
    const setCount = setCountSnapshot.data().count;

    // Get active category count
    const categoryCountSnapshot = await admin.firestore()
      .collection('categories')
      .where('isActive', '==', true)
      .count()
      .get();
    const categoryCount = categoryCountSnapshot.data().count;

    // Get pending request count
    const requestCountSnapshot = await admin.firestore()
      .collection('picto_requests')
      .where('status', '==', 'pending')
      .count()
      .get();
    const requestCount = requestCountSnapshot.data().count;

    // Get recent users (last 10)
    const recentUsersSnapshot = await admin.firestore()
      .collection('caregivers')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const recentUsers = [];
    for (const doc of recentUsersSnapshot.docs) {
      const userData = doc.data();
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
      recentUsers.push({
        id: doc.id,
        email,
        name: userData.name || 'N/A',
        createdAt: userData.createdAt?.toDate() || null
      });
    }

    // Get recent pictograms (last 10)
    const recentPictogramsSnapshot = await admin.firestore()
      .collection('custom_pictograms')
      .orderBy('uploadedAt', 'desc')
      .limit(10)
      .get();
    
    const recentPictograms = recentPictogramsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate() || null
    }));

    // Get recent requests (last 10)
    const recentRequestsSnapshot = await admin.firestore()
      .collection('picto_requests')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const recentRequests = recentRequestsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null
    }));

    res.json({
      stats: {
        totalUsers: userCount,
        totalPictograms: pictogramCount,
        totalSets: setCount,
        totalCategories: categoryCount,
        pendingRequests: requestCount
      },
      recentUsers,
      recentPictograms,
      recentRequests
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

module.exports = router;
