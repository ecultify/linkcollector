import { NextResponse } from "next/server";
import { google } from "googleapis";
import { readFileSync } from "fs";
import { join } from "path";

const SPREADSHEET_ID = "1dDBEZ9BVCm-7WD55YSK5alUNBgSEhHk3aAY-RP-DFyw";
const SHEET_NAME = "Links";

// Load credentials from environment variable or JSON file
function getCredentials() {
  // Try environment variable first (for Vercel deployment)
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  }
  
  // Fall back to JSON file (for local development)
  try {
    const credentialsPath = join(process.cwd(), "green-talent-472210-q9-6c4322bbe2a4.json");
    return JSON.parse(readFileSync(credentialsPath, "utf8"));
  } catch (error) {
    throw new Error("Google Service Account credentials not found. Please set GOOGLE_SERVICE_ACCOUNT_KEY environment variable or provide the credentials JSON file.");
  }
}

export async function GET() {
  try {
    const credentials = getCredentials();
    
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // Fetch all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const rows = response.data.values || [];
    
    console.log(`Fetched ${rows.length} rows from sheet`);
    
    // Skip header row if exists (check if first row looks like headers)
    // If first row doesn't contain a URL pattern, treat it as header
    const startIndex = rows.length > 0 && !rows[0]?.[0]?.toString().match(/^https?:\/\//) ? 1 : 0;
    
    const links = rows.slice(startIndex).map((row, index) => ({
      id: index + 1,
      url: row[0] || "",
      title: row[1] || row[0] || `Link ${index + 1}`,
      ...(row[2] && { description: row[2] }),
    })).filter(link => link.url && link.url.trim() !== ""); // Filter out empty rows

    console.log(`Processed ${links.length} links`);

    return NextResponse.json({ links }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching sheets:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from Google Sheets", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
