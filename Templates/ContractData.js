function contractData(form, totalPrice) {
  ci = 12034;
  const payload = [];
  payload.push({
    deleteContentRange: {
      range: { startIndex: ci, endIndex: ci + 46 },
    },
  });
  payload.push({
    insertText: {
      location: {
        index: ci,
      },
      text: `ANNEX 1\n`,
    },
  });
  payload.push({
    updateTextStyle: {
      textStyle: { bold: true, underline: false },
      range: { startIndex: ci, endIndex: ci + 7 },
      fields: "bold",
    },
  });
  ci += 9;
  payload.push({
    insertText: {
      location: {
        index: ci,
      },
      text: `\nSchedule of Services\n`,
    },
  });
  payload.push({
    updateTextStyle: {
      textStyle: { bold: true, underline: true },
      range: { startIndex: ci, endIndex: ci + 20 },
      fields: "bold,underline",
    },
  });
  ci += 22;
  payload.push({
    insertText: {
      location: {
        index: ci,
      },
      text: `\nUK Digital Accountant Ltd does not offer 'all inclusive' accounting packages. This Annex is effective from the date of signature of the copy and includes agreed services. If service requirements change, the fees will change as well. All work is carried out on UK Digital Accountant Ltd workspace and additional charges will apply for different arrangements.\n`,
    },
  });
  ci += 359;
  payload.push({
    insertText: {
      location: {
        index: ci,
      },
      text: `\nServices Offered\n`,
    },
  });
  payload.push({
    updateTextStyle: {
      textStyle: { bold: true, underline: true },
      range: { startIndex: ci, endIndex: ci + 16 },
      fields: "bold,underline",
    },
  });
  ci += 17;
  payload.push({
    insertTable: {
      rows: 3,
      columns: 2,
      location: { index: ci },
    },
  });
  payload.push({
    insertTable: {
      rows: 2,
      columns: 3,
      location: {
        index: ci, // Position where table should be inserted
      },
    },
  });
  payload.push({
    updateTableCellStyle: {
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { index: 2 }, // Table starts at index 2
          rowIndex: 0,
          columnIndex: 0,
        },
        rowSpan: 2,
        columnSpan: 3,
      },
      tableCellStyle: {
        borderLeft: {
          color: { rgbColor: { red: 0, green: 0, blue: 0 } },
          width: { magnitude: 1, unit: "PT" },
        },
        borderRight: {
          color: { rgbColor: { red: 0, green: 0, blue: 0 } },
          width: { magnitude: 1, unit: "PT" },
        },
        borderTop: {
          color: { rgbColor: { red: 0, green: 0, blue: 0 } },
          width: { magnitude: 1, unit: "PT" },
        },
        borderBottom: {
          color: { rgbColor: { red: 0, green: 0, blue: 0 } },
          width: { magnitude: 1, unit: "PT" },
        },
      },
      fields: "*",
    },
  });

  // Add borders to the table

  return payload;
}
module.exports = contractData;
