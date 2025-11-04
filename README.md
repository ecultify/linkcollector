# Link Tracker PWA

A minimalist Progressive Web App that tracks links from Google Sheets with pagination (30 links per page).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add your Google Service Account credentials:
```
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

3. Make sure your Google Service Account has access to the spreadsheet:
   - Spreadsheet ID: `1dDBEZ9BVCm-7WD55YSK5alUNBgSEhHk3aAY-RP-DFyw`
   - Sheet name: `Links`

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

## Features

- Displays links from Google Sheets
- Pagination: 30 links per page
- Tracks total link count and page count
- PWA ready - can be installed on mobile devices
- Minimalist UI using shadcn components
