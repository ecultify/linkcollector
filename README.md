# Link Tracker PWA

A minimalist Progressive Web App that tracks links from Google Sheets with pagination (30 links per page).

## Setup

1. Install dependencies:
```bash
npm install
```

2. **For Local Development:**
   - Option A: Keep your `green-talent-472210-q9-6c4322bbe2a4.json` file in the root directory (already set up)
   - Option B: Create a `.env.local` file and add:
   ```
   GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```

3. Make sure your Google Service Account has access to the spreadsheet:
   - Spreadsheet ID: `1dDBEZ9BVCm-7WD55YSK5alUNBgSEhHk3aAY-RP-DFyw`
   - Sheet name: `Links`
   - Share the sheet with: `master@green-talent-472210-q9.iam.gserviceaccount.com`

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Deployment to Vercel

**Required Environment Variable:**

You need to add ONE environment variable in Vercel:

1. Go to your Vercel project settings → Environment Variables
2. Add a new environment variable:
   - **Name:** `GOOGLE_SERVICE_ACCOUNT_KEY`
   - **Value:** Copy the entire contents of your `green-talent-472210-q9-6c4322bbe2a4.json` file as a single-line JSON string
   - **Example:** `{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`
   - **Environments:** Select all (Production, Preview, Development)

3. After adding the environment variable, redeploy your application

**How to get the value:**
- Open your `green-talent-472210-q9-6c4322bbe2a4.json` file
- Copy the entire JSON content
- Paste it as the value (make sure it's all on one line, or Vercel will handle it)

## Features

- Displays links from Google Sheets
- Pagination: 30 links per page
- Tracks total link count and page count
- Duplicate link detection with location tracking
- PWA ready - can be installed on mobile devices
- Minimalist UI using shadcn components

