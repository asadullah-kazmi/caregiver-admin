/**
 * Helper script to create an admin user in Firestore
 * 
 * Usage:
 * 1. Create a user in Firebase Authentication first
 * 2. Get the user's UID
 * 3. Run: node scripts/createAdmin.js <uid> <email>
 * 
 * Example:
 * node scripts/createAdmin.js abc123xyz admin@example.com
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node createAdmin.js <uid> <email>');
  console.error('Example: node createAdmin.js abc123xyz admin@example.com');
  process.exit(1);
}

const [uid, email] = args;

async function createAdmin() {
  try {
    // Verify user exists in Auth
    try {
      const userRecord = await admin.auth().getUser(uid);
      console.log(`✓ User found in Auth: ${userRecord.email}`);
    } catch (error) {
      console.error('✗ Error: User not found in Firebase Authentication');
      console.error('  Please create the user in Firebase Console first (Authentication > Add user)');
      process.exit(1);
    }

    // Create admin document in Firestore
    const adminData = {
      email: email,
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('admin_users').doc(uid).set(adminData);
    
    console.log('✓ Admin user created successfully!');
    console.log(`  UID: ${uid}`);
    console.log(`  Email: ${email}`);
    console.log(`  Document: admin_users/${uid}`);
    console.log('\nYou can now log in to the admin panel with this user.');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();
