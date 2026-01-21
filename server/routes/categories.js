const express = require('express');
const admin = require('firebase-admin');
const { verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; // 'active' or 'inactive'
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = admin.firestore().collection('categories');

    // Apply filters
    if (status === 'active') {
      query = query.where('isActive', '==', true);
    } else if (status === 'inactive') {
      query = query.where('isActive', '==', false);
    }

    const snapshot = await query.orderBy('name', 'asc').get();
    
    // Filter by search term (client-side filtering for name fields)
    let categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null
    }));

    if (search) {
      const searchLower = search.toLowerCase();
      categories = categories.filter(cat => 
        cat.name?.toLowerCase().includes(searchLower) ||
        cat.nameEn?.toLowerCase().includes(searchLower) ||
        cat.nameNl?.toLowerCase().includes(searchLower)
      );
    }

    const total = categories.length;
    const paginatedCategories = categories.slice(offset, offset + limit);

    // Get pictogram count for each category
    const categoriesWithCounts = await Promise.all(
      paginatedCategories.map(async (category) => {
        const pictogramCount = await admin.firestore()
          .collection('custom_pictograms')
          .where('category', '==', category.id)
          .where('isActive', '==', true)
          .count()
          .get();
        
        return {
          ...category,
          pictogramCount: pictogramCount.data().count
        };
      })
    );

    res.json({
      categories: categoriesWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await admin.firestore().collection('categories').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get pictogram count
    const pictogramCount = await admin.firestore()
      .collection('custom_pictograms')
      .where('category', '==', id)
      .where('isActive', '==', true)
      .count()
      .get();

    res.json({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      updatedAt: doc.data().updatedAt?.toDate() || null,
      pictogramCount: pictogramCount.data().count
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { name, nameEn, nameNl, description } = req.body;

    if (!name || !nameEn || !nameNl) {
      return res.status(400).json({ 
        error: 'Name, Name (English), and Name (Dutch) are required' 
      });
    }

    const categoryData = {
      name: name.trim(),
      nameEn: nameEn.trim(),
      nameNl: nameNl.trim(),
      description: description?.trim() || null,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await admin.firestore().collection('categories').add(categoryData);
    
    res.json({
      success: true,
      category: {
        id: docRef.id,
        ...categoryData,
        createdAt: new Date(),
        updatedAt: new Date(),
        pictogramCount: 0
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nameEn, nameNl, description, isActive } = req.body;

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (name !== undefined) updateData.name = name.trim();
    if (nameEn !== undefined) updateData.nameEn = nameEn.trim();
    if (nameNl !== undefined) updateData.nameNl = nameNl.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    await admin.firestore().collection('categories').doc(id).update(updateData);

    const updatedDoc = await admin.firestore().collection('categories').doc(id).get();
    
    // Get pictogram count
    const pictogramCount = await admin.firestore()
      .collection('custom_pictograms')
      .where('category', '==', id)
      .where('isActive', '==', true)
      .count()
      .get();

    res.json({
      success: true,
      category: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data().createdAt?.toDate() || null,
        updatedAt: updatedDoc.data().updatedAt?.toDate() || null,
        pictogramCount: pictogramCount.data().count
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has pictograms
    const pictogramSnapshot = await admin.firestore()
      .collection('custom_pictograms')
      .where('category', '==', id)
      .limit(1)
      .get();

    if (!pictogramSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete category. It contains pictograms. Please remove all pictograms first or deactivate the category instead.' 
      });
    }

    // Delete category
    await admin.firestore().collection('categories').doc(id).delete();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Get active categories (for dropdowns)
router.get('/active/list', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await admin.firestore()
      .collection('categories')
      .where('isActive', '==', true)
      .orderBy('name', 'asc')
      .get();

    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      nameEn: doc.data().nameEn,
      nameNl: doc.data().nameNl
    }));

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching active categories:', error);
    res.status(500).json({ error: 'Failed to fetch active categories' });
  }
});

module.exports = router;
