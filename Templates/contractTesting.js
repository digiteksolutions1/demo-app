const { overwriteAnnexSection } = require("../google/docsService");

function contractGeneratorToGoogleDocsPayload(form) {
  const requests = [];
  let currentIndex = 1;

  // Helper function to insert text and update index
  const insertText = (text, index) => {
    if (!text) return index;
    requests.push({
      insertText: {
        text: text,
        location: { index: index },
      },
    });
    return index + text.length;
  };

  // Helper function to apply text styles
  const applyStyle = (start, end, style) => {
    if (start >= end) return;
    requests.push({
      updateTextStyle: {
        range: { startIndex: start, endIndex: end },
        textStyle: style,
        fields: Object.keys(style).join(","),
      },
    });
  };

  // Start with "ANNEX 1"
  currentIndex = insertText("ANNEX 1\n\n", currentIndex);
  applyStyle(currentIndex - 9, currentIndex - 1, { bold: true });

  // Add "Schedule of Services" heading
  const scheduleStart = currentIndex;
  currentIndex = insertText("Schedule of Services\n", currentIndex);
  applyStyle(scheduleStart, currentIndex - 1, { bold: true, underline: true });

  // Add paragraph text
  const paraText =
    "UK Digital Accountant Ltd does not offer 'all inclusive' accounting packages. This Annex is effective from the date of signature of the copy and includes agreed services. If service requirements change, the fees will change as well. All work is carried out on UK Digital Accountant Ltd workspace and additional charges will apply for different arrangements.\n\n";
  currentIndex = insertText(paraText, currentIndex);

  // Add "Services Offered" heading
  const servicesStart = currentIndex;
  currentIndex = insertText("Services Offered\n", currentIndex);
  applyStyle(servicesStart, currentIndex - 1, { bold: true, underline: true });

  // Create table (2 rows if accounting section is included, otherwise just header row)
  const tableRowCount =
    form.isAccountingSection && form.businessType === "ST" ? 2 : 1;
  requests.push({
    insertTable: {
      rows: tableRowCount,
      columns: 3,
      location: { index: currentIndex },
    },
  });

  // Table starts at currentIndex + 1
  const tableStartIndex = currentIndex + 1;
  currentIndex = tableStartIndex;

  // Add table headers (first row)
  const headers = [
    { text: "Service and Description", style: { bold: true } },
    { text: "Fixed Fee", style: { bold: true } },
    { text: "Timescale", style: { bold: true } },
  ];

  headers.forEach((header, colIndex) => {
    const cellIndex = tableStartIndex + colIndex;
    requests.push({
      insertText: {
        text: header.text,
        location: { index: cellIndex },
      },
    });
    if (header.style) {
      applyStyle(cellIndex, cellIndex + header.text.length, header.style);
    }
  });

  // Add accounting services row if needed
  if (form.isAccountingSection && form.businessType === "ST") {
    const rowStartIndex = tableStartIndex + 3; // Start of second row

    // Service Description (column 1)
    const descText =
      "Accounting services\nSelf Assessment preparation & submission (for businesses up to £90k/year). Accounting advice via email, messages or short call up to 15 min. Additional charges will apply for longer calls, meetings, research and analysis.";
    requests.push({
      insertText: {
        text: descText,
        location: { index: rowStartIndex },
      },
    });
    applyStyle(rowStartIndex, rowStartIndex + "Accounting services".length, {
      bold: true,
    });

    // Fixed Fee (column 2)
    const priceText = `£${form.rangePrice}`;
    requests.push({
      insertText: {
        text: priceText,
        location: { index: rowStartIndex + 1 },
      },
    });

    // Timescale (column 3)
    const timescaleText = `Start Date\n${form.startDate}`;
    requests.push({
      insertText: {
        text: timescaleText,
        location: { index: rowStartIndex + 2 },
      },
    });
  }

  // Add table borders
  const borderStyle = {
    width: { magnitude: 1, unit: "PT" },
    dashStyle: "SOLID",
  };

  return requests;
}

// Example usage:
const payload = contractGeneratorToGoogleDocsPayload(formData);
console.log(JSON.stringify(payload, null, 2));

overwriteAnnexSection("1D5MGaxZmdC6crgy1VNZ5EjvJAUC1oU2DHmHQc5aMk-s", payload);
