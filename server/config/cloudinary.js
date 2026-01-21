const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
// Note: You need to set CLOUDINARY_CLOUD_NAME in your .env file
// Get it from your Cloudinary dashboard: https://cloudinary.com/console
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name', // REQUIRED: Set this in server/.env
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
