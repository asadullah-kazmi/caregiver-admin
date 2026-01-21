const express = require('express');
const admin = require('firebase-admin');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all pictogram requests
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // 'pending', 'approved', 'rejected', 'completed'
    const category = req.query.category; // category ID
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = admin.firestore().collection('picto_requests');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    // Filter by search term (client-side for keyword)
    let requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      requests = requests.filter(req => 
        req.keyword?.toLowerCase().includes(searchLower)
      );
    }

    const total = requests.length;
    const paginatedRequests = requests.slice(offset, offset + limit);

    // Get user and category information for each request
    const requestsWithDetails = await Promise.all(
      paginatedRequests.map(async (request) => {
        let userInfo = null;
        let categoryInfo = null;

        // Get user info
        try {
          const userDoc = await admin.firestore()
            .collection('caregivers')
            .doc(request.requestedBy)
            .get();
          if (userDoc.exists) {
            userInfo = {
              name: userDoc.data().name,
              email: userDoc.data().email || null
            };
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }

        // Get category info
        if (request.category) {
          try {
            const categoryDoc = await admin.firestore()
              .collection('categories')
              .doc(request.category)
              .get();
            if (categoryDoc.exists) {
              categoryInfo = {
                id: categoryDoc.id,
                name: categoryDoc.data().name,
                nameEn: categoryDoc.data().nameEn,
                nameNl: categoryDoc.data().nameNl
              };
            }
          } catch (error) {
            console.error('Error fetching category:', error);
          }
        }

        return {
          ...request,
          user: userInfo,
          categoryInfo: categoryInfo
        };
      })
    );

    res.json({
      requests: requestsWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get single request
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await admin.firestore().collection('picto_requests').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null
    };

    // Get user and category info
    let userInfo = null;
    let categoryInfo = null;

    try {
      const userDoc = await admin.firestore()
        .collection('caregivers')
        .doc(request.requestedBy)
        .get();
      if (userDoc.exists) {
        userInfo = {
          name: userDoc.data().name,
          email: userDoc.data().email || null
        };
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }

    if (request.category) {
      try {
        const categoryDoc = await admin.firestore()
          .collection('categories')
          .doc(request.category)
          .get();
        if (categoryDoc.exists) {
          categoryInfo = {
            id: categoryDoc.id,
            name: categoryDoc.data().name,
            nameEn: categoryDoc.data().nameEn,
            nameNl: categoryDoc.data().nameNl
          };
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }

    res.json({
      ...request,
      user: userInfo,
      categoryInfo: categoryInfo
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// Update request status
router.put('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (adminNote !== undefined) {
      updateData.adminNote = (adminNote && typeof adminNote === 'string') ? adminNote.trim() || null : null;
    }

    await admin.firestore().collection('picto_requests').doc(id).update(updateData);

    const updatedDoc = await admin.firestore().collection('picto_requests').doc(id).get();
    
    res.json({
      success: true,
      request: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate() || null,
        updatedAt: updatedDoc.data().updatedAt?.toDate() || null
      }
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

// Delete request
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection('picto_requests').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// Get request count by status
router.get('/stats/count', verifyAdmin, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const snapshot = await admin.firestore()
      .collection('picto_requests')
      .where('status', '==', status)
      .count()
      .get();
    
    res.json({ count: snapshot.data().count });
  } catch (error) {
    console.error('Error counting requests:', error);
    res.status(500).json({ error: 'Failed to count requests' });
  }
});

module.exports = router;
