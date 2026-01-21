# Server Setup

## Service Account Key

You need to download the Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `caregiver-cba18`
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save the downloaded JSON file as `serviceAccountKey.json` in this directory

The file should have this structure:
```json
{
  "type": "service_account",
  "project_id": "caregiver-cba18",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Important**: Never commit this file to version control!
