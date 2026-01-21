# Cloudinary Credentials

**IMPORTANT: This file contains sensitive credentials. Do NOT commit this to version control.**

## Credentials

```
CLOUDINARY_API_KEY=882946886619886
CLOUDINARY_API_SECRET=RAmjt6Xpo156NvIVAp5BQp-I7Mg
CLOUDINARY_CLOUD_NAME=your_cloud_name_here  # REQUIRED: Get this from Cloudinary dashboard
```

## Usage

These credentials should be stored in `server/.env` file (which is already in .gitignore):

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=882946886619886
CLOUDINARY_API_SECRET=RAmjt6Xpo156NvIVAp5BQp-I7Mg
```

**IMPORTANT**: You need to get your Cloudinary Cloud Name from your Cloudinary dashboard:
1. Go to https://cloudinary.com/console
2. Log in to your account
3. Your Cloud Name is displayed on the dashboard (usually visible in the URL or account settings)
4. Add it to your `server/.env` file as `CLOUDINARY_CLOUD_NAME=your_actual_cloud_name`

Then load them in your Node.js code using `dotenv`:

```javascript
require('dotenv').config();
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
```

## Security Note

- These credentials are already excluded from git via `.gitignore`
- Never share these credentials publicly
- Rotate them if they are ever exposed
