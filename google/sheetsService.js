const { google, getAuthClient } = require("./googleClient");

/**
 * Appends form data to the next free row in a Google Sheet.
 * @param {string} sheetId - The ID of the Google Sheet.
 * @param {string} range - The range to append (e.g., 'Sheet1!A1').
 * @param {object} formData - The object containing form fields and values.
 */
const appendFormDataToSheet = async (rowData) => {
  try {
    const sheetId = "1305SICGd8z7eUoWhg2n3USrntyz3Vg1ZHkREWdF17LA";
    const range = "Master!A2";
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Convert formData object to an array of values

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowData],
      },
    });

    console.log("Row appended successfully!");
  } catch (error) {
    console.error("Error appending row:", error);
    throw error;
  }
};

module.exports = appendFormDataToSheet;
