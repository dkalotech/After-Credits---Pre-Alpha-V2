
/**
 * Google Sheets Apps Script Code
 * -----------------------------
 * Copy this into your Google Apps Script editor (Extensions > Apps Script)
 * 
 * function doGet(e) {
 *   const ss = SpreadsheetApp.getActiveSpreadsheet();
 *   const data = {
 *     movies: getSheetData(ss, "Movies"),
 *     reviews: getSheetData(ss, "Reviews"),
 *     chatMessages: getSheetData(ss, "Chat"),
 *     oscarNoms: getSheetData(ss, "Oscars"),
 *     users: getSheetData(ss, "Users")
 *   };
 *   return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   const ss = SpreadsheetApp.getActiveSpreadsheet();
 *   const payload = JSON.parse(e.postData.contents);
 *   const { action, type, data } = payload;
 *   const sheet = ss.getSheetByName(type);
 *   if (!sheet) return ContentService.createTextOutput(JSON.stringify({error: "Sheet not found"})).setMimeType(ContentService.MimeType.JSON);
 *   
 *   const headers = sheet.getDataRange().getValues()[0];
 *   const rowData = headers.map(h => {
 *     let val = data[h];
 *     if (val === undefined || val === null) return "";
 *     if (typeof val === 'object') return JSON.stringify(val);
 *     return val;
 *   });
 * 
 *   if (action === "add") {
 *     sheet.appendRow(rowData);
 *   } else if (action === "update") {
 *     const rows = sheet.getDataRange().getValues();
 *     const idIndex = headers.indexOf("id");
 *     for (let i = 1; i < rows.length; i++) {
 *       if (rows[i][idIndex] == data.id) {
 *         sheet.getRange(i + 1, 1, 1, headers.length).setValues([rowData]);
 *         break;
 *       }
 *     }
 *   }
 *   return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function getSheetData(ss, name) {
 *   const sheet = ss.getSheetByName(name);
 *   if (!sheet) return [];
 *   const data = sheet.getDataRange().getValues();
 *   if (data.length <= 1) return [];
 *   const headers = data[0];
 *   return data.slice(1).map(row => {
 *     const obj = {};
 *     headers.forEach((h, i) => {
 *       let val = row[i];
 *       try {
 *         if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
 *           val = JSON.parse(val);
 *         }
 *       } catch (e) {}
 *       obj[h] = val;
 *     });
 *     return obj;
 *   });
 * }
 */

// Use the direct URL for all requests to support static deployment (GitHub Pages)
// Google Apps Script doGet/doPost support CORS when published as "Anyone"
const DIRECT_URL = import.meta.env.VITE_SHEETS_API_URL;

export const sheetsService = {
  async getAllData() {
    if (!DIRECT_URL) throw new Error("Vault URL not configured");
    
    try {
      const response = await fetch(DIRECT_URL);
      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        throw new Error(`Server Error ${response.status}`);
      }

      const data = await response.json();
      return {
        movies: Array.isArray(data.movies) ? data.movies : [],
        reviews: Array.isArray(data.reviews) ? data.reviews : [],
        chatMessages: Array.isArray(data.chatMessages) ? data.chatMessages : [],
        oscarNoms: Array.isArray(data.oscarNoms) ? data.oscarNoms : [],
        users: Array.isArray(data.users) ? data.users : []
      };
    } catch (error: any) {
      console.error("Sheets Fetch Error:", error);
      throw error;
    }
  },

  async addRecord(type: 'Movies' | 'Reviews' | 'Chat' | 'Oscars' | 'Users', data: any) {
    if (!DIRECT_URL) return false;
    try {
      // Use no-cors if standard fetch fails, but standard fetch with redirect: 'follow' 
      // usually works for Google Apps Script if set up correctly.
      const response = await fetch(DIRECT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script POST often requires no-cors from browsers
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', type, data })
      });
      // With no-cors, we won't know if it succeeded, but we assume success for the UI
      return true;
    } catch (error) {
      console.error("Sheets Add Error:", error);
      return false;
    }
  },

  async updateRecord(type: 'Movies' | 'Reviews' | 'Chat' | 'Oscars' | 'Users', data: any) {
    if (!DIRECT_URL) return false;
    try {
      await fetch(DIRECT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', type, data })
      });
      return true;
    } catch (error) {
      console.error("Sheets Update Error:", error);
      return false;
    }
  }
};
