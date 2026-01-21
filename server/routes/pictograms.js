const express = require('express');
const admin = require('firebase-admin');
const { verifyAdmin } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const router = express.Router();

// Lazy initialization of storage bucket (after Firebase is initialized)
const getBucket = () => {
  try {
    // Try to get the default bucket
    const bucket = admin.storage().bucket();
    return bucket;
  } catch (error) {
    console.error('Error getting storage bucket:', error);
    // Try alternative bucket name formats
    const projectId = admin.app().options.projectId || 'caregiver-cba18';
    const alternativeBuckets = [
      `${projectId}.firebasestorage.app`,
      `${projectId}.appspot.com`,
      projectId
    ];
    
    for (const bucketName of alternativeBuckets) {
      try {
        const bucket = admin.storage().bucket(bucketName);
        console.log(`Trying bucket: ${bucketName}`);
        return bucket;
      } catch (e) {
        // Continue to next bucket name
      }
    }
    throw new Error('Could not find a valid storage bucket');
  }
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all pictograms with pagination
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category?.trim() || '';
    const search = req.query.search?.trim() || '';
    const offset = (page - 1) * limit;

    let snapshot;
    const categoryId = category && category.trim() ? category.trim() : null;

    // Try to apply category filter with Firestore query
    if (categoryId) {
      console.log('Attempting Firestore query with category filter:', categoryId);
      
      try {
        // Try query with category filter and orderBy
        let query = admin.firestore()
          .collection('custom_pictograms')
          .where('category', '==', categoryId)
          .orderBy('uploadedAt', 'desc');
        snapshot = await query.get();
        console.log(`Firestore query successful: Found ${snapshot.docs.length} pictograms`);
      } catch (error) {
        // If query fails (likely missing composite index), fetch all and filter client-side
        console.warn('Firestore query failed, falling back to client-side filter:', error.message);
        console.warn('Error code:', error.code, 'Error details:', error);
        let query = admin.firestore()
          .collection('custom_pictograms')
          .orderBy('uploadedAt', 'desc');
        snapshot = await query.get();
        console.log(`Fetched all pictograms (${snapshot.docs.length}), will filter client-side`);
      }
    } else {
      console.log('No category filter - fetching all pictograms');
      let query = admin.firestore()
        .collection('custom_pictograms')
        .orderBy('uploadedAt', 'desc');
      snapshot = await query.get();
    }
    
    let pictograms = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: doc.data().uploadedAt?.toDate() || null
    }));

    // ALWAYS apply category filter client-side as a double-check
    // This ensures filtering works even if Firestore query had issues
    if (categoryId) {
      const beforeFilter = pictograms.length;
      
      let debugCount = 0;
      pictograms = pictograms.filter(p => {
        // Handle different data types: string, number, null, undefined
        if (p.category === null || p.category === undefined) {
          return false;
        }
        // Convert to string and trim for comparison
        const picCategory = String(p.category).trim();
        const match = picCategory === categoryId;
        
        // Debug first few mismatches
        if (!match && debugCount < 3) {
          console.log(`Mismatch: Pictogram "${p.keyword}" has category "${picCategory}" (type: ${typeof p.category}), looking for "${categoryId}"`);
          debugCount++;
        }
        
        return match;
      });
      
      console.log(`Category filter: ${beforeFilter} -> ${pictograms.length} pictograms for category "${categoryId}"`);
      
      if (pictograms.length === 0 && beforeFilter > 0) {
        // Debug: Show what category values we actually have
        const uniqueCategories = new Set();
        snapshot.docs.forEach(doc => {
          const cat = doc.data().category;
          if (cat !== null && cat !== undefined) {
            uniqueCategories.add(String(cat).trim());
          }
        });
        console.log('Unique category values found in database:', Array.from(uniqueCategories));
        console.log('Looking for category ID:', categoryId);
        console.log('Available category IDs:', Array.from(uniqueCategories));
      }
    }

    // Apply search filter client-side if provided
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      pictograms = pictograms.filter(p => 
        p.keyword?.toLowerCase().includes(searchLower)
      );
    }

    const total = pictograms.length;
    
    // Apply pagination after filtering
    pictograms = pictograms.slice(offset, offset + limit);

    res.json({
      pictograms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pictograms:', error);
    res.status(500).json({ error: 'Failed to fetch pictograms' });
  }
});

// Upload new pictogram
router.post('/upload', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { keyword, category, description } = req.body;

    if (!keyword || !category) {
      return res.status(400).json({ error: 'Keyword and category are required' });
    }

    // Generate unique ID
    const pictogramId = admin.firestore().collection('custom_pictograms').doc().id;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'pictograms',
          public_id: pictogramId,
          resource_type: 'image',
          format: 'png',
          overwrite: false
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Create Firestore document
    const pictogramData = {
      keyword: keyword.trim(),
      category: category, // Store category ID
      imageUrl: uploadResult.secure_url,
      description: description?.trim() || null,
      isActive: true,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      uploadedBy: req.user.uid
    };

    await admin.firestore().collection('custom_pictograms').doc(pictogramId).set(pictogramData);

    res.json({
      success: true,
      pictogram: {
        id: pictogramId,
        ...pictogramData,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    let errorMessage = 'Failed to upload pictogram';
    if (error.message?.includes('Invalid image')) {
      errorMessage = 'Invalid image file. Please upload a valid PNG, JPG, or JPEG image.';
    } else if (error.message?.includes('File too large')) {
      errorMessage = 'Image file is too large. Maximum size is 5MB.';
    }
    res.status(500).json({ error: errorMessage });
  }
});

// Update pictogram
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { keyword, category, description, isActive } = req.body;

    const updateData = {};
    if (keyword !== undefined) updateData.keyword = keyword.trim();
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    await admin.firestore().collection('custom_pictograms').doc(id).update(updateData);

    const updatedDoc = await admin.firestore().collection('custom_pictograms').doc(id).get();
    res.json({
      success: true,
      pictogram: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        uploadedAt: updatedDoc.data().uploadedAt?.toDate() || null
      }
    });
  } catch (error) {
    console.error('Error updating pictogram:', error);
    res.status(500).json({ error: 'Failed to update pictogram' });
  }
});

// Delete pictogram
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get pictogram data
    const doc = await admin.firestore().collection('custom_pictograms').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Pictogram not found' });
    }

    const imageUrl = doc.data().imageUrl;

    // Delete image from Cloudinary
    if (imageUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1].split('.')[0];
        const folder = 'pictograms';
        const publicId = `${folder}/${publicIdWithExt}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue even if image deletion fails
      }
    }

    // Delete document from Firestore
    await admin.firestore().collection('custom_pictograms').doc(id).delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting pictogram:', error);
    res.status(500).json({ error: 'Failed to delete pictogram' });
  }
});

// Get pictogram count
router.get('/count', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('custom_pictograms')
      .where('isActive', '==', true)
      .count()
      .get();
    res.json({ count: snapshot.data().count });
  } catch (error) {
    console.error('Error counting pictograms:', error);
    res.status(500).json({ error: 'Failed to count pictograms' });
  }
});

// Test storage bucket access
router.get('/test-storage', verifyAdmin, async (req, res) => {
  try {
    const bucket = getBucket();
    const [exists] = await bucket.exists();
    
    if (!exists) {
      return res.status(404).json({ 
        error: 'Storage bucket does not exist',
        bucketName: bucket.name,
        message: 'Please enable Firebase Storage in Firebase Console and ensure the bucket exists.'
      });
    }
    
    res.json({ 
      success: true,
      bucketName: bucket.name,
      message: 'Storage bucket is accessible'
    });
  } catch (error) {
    console.error('Storage test error:', error);
    res.status(500).json({ 
      error: 'Storage bucket error',
      message: error.message,
      bucketName: admin.storage().bucket().name
    });
  }
});

module.exports = router;
