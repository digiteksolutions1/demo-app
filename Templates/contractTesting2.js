const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { google, getAuthClient } = require("../google/googleClient");

/**
 * Converts HTML to Google Docs batchUpdate payload format
 * Supports: div, bold (b/strong), underline (u), tables (table, tr, td, th)
 * @param {string} htmlContent - HTML string to convert
 * @param {number} startIndex - Starting index in the document (default: 1, after title)
 * @returns {Object} - Google Docs batchUpdate payload
 */
function htmlToGoogleDocsBatchUpdate(htmlContent, startIndex = 1) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  let requests = [];
  let currentIndex = startIndex;

  // Helper functions
  function createTextInsert(text, index) {
    return {
      insertText: {
        location: { index },
        text: text,
      },
    };
  }

  function createTextStyle(startIndex, endIndex, textStyle) {
    return {
      updateTextStyle: {
        range: { startIndex, endIndex },
        textStyle,
        fields: Object.keys(textStyle).join(","),
      },
    };
  }

  function createTableInsert(rows, columns, index) {
    return {
      insertTable: {
        location: { index },
        rows: rows,
        columns: columns,
      },
    };
  }

  function createTableCellInsert(text, tableStartIndex, rowIndex, columnIndex) {
    return {
      insertText: {
        location: {
          index: tableStartIndex,
          segmentId: "",
        },
        text: text,
      },
    };
  }

  // Process text content with inline formatting
  function processTextContent(element, baseIndex) {
    let fullText = "";
    let formatRanges = [];
    let textPosition = 0;

    function traverseNode(node, isBold = false, isUnderline = false) {
      if (node.nodeType === dom.window.Node.TEXT_NODE) {
        const nodeText = node.textContent;
        fullText += nodeText;

        // Track formatting ranges
        if (isBold || isUnderline) {
          const style = {};
          if (isBold) style.bold = true;
          if (isUnderline) style.underline = true;

          formatRanges.push({
            start: baseIndex + textPosition,
            end: baseIndex + textPosition + nodeText.length,
            style: style,
          });
        }

        textPosition += nodeText.length;
      } else if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        const newBold = isBold || tagName === "b" || tagName === "strong";
        const newUnderline = isUnderline || tagName === "u";

        for (let child of node.childNodes) {
          traverseNode(child, newBold, newUnderline);
        }
      }
    }

    traverseNode(element);

    return {
      text: fullText,
      formatRanges: formatRanges,
      length: fullText.length,
    };
  }

  // Process table with proper cell content insertion
  function processTableComplete(tableElement, insertIndex) {
    const rows = tableElement.querySelectorAll("tr");
    const numRows = rows.length;
    const numCols = rows[0] ? rows[0].querySelectorAll("td, th").length : 1;

    let tableRequests = [];

    // Step 1: Insert table structure
    tableRequests.push(createTableInsert(numRows, numCols, insertIndex));

    // Step 2: Calculate cell positions and insert content
    // Google Docs table structure:
    // - Table starts at insertIndex + 1
    // - Each cell starts at: tableStart + 2 + (rowIndex * numCols * 2) + (colIndex * 2) + 1

    const tableStartIndex = insertIndex + 1;

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll("td, th");
      cells.forEach((cell, colIndex) => {
        const cellContent = processTextContent(cell, 0);

        if (cellContent.text.trim()) {
          // Calculate cell content position
          const cellContentIndex =
            tableStartIndex + 2 + rowIndex * numCols * 2 + colIndex * 2 + 1;

          // Insert cell text
          tableRequests.push(
            createTextInsert(cellContent.text, cellContentIndex)
          );

          // Apply formatting to cell text
          cellContent.formatRanges.forEach((range) => {
            const adjustedRange = {
              start: cellContentIndex + (range.start - 0),
              end: cellContentIndex + (range.end - 0),
              style: range.style,
            };
            tableRequests.push(
              createTextStyle(
                adjustedRange.start,
                adjustedRange.end,
                adjustedRange.style
              )
            );
          });
        }
      });
    });

    // Step 3: Calculate final index after table
    const tableEndIndex = insertIndex + 2 + numRows * numCols * 2;

    return {
      requests: tableRequests,
      endIndex: tableEndIndex,
    };
  }

  // Main processing function
  function processAllElements() {
    const body = document.body || document.documentElement;
    const children = Array.from(body.childNodes);

    for (let node of children) {
      if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();

        if (tagName === "table") {
          // Process complete table with content
          const tableResult = processTableComplete(node, currentIndex);
          requests.push(...tableResult.requests);
          currentIndex = tableResult.endIndex;

          // Add spacing after table
          requests.push(createTextInsert("\n", currentIndex));
          currentIndex += 1;
        } else if (tagName === "div" || tagName === "p") {
          // Process div/paragraph with formatting
          const textResult = processTextContent(node, currentIndex);

          if (textResult.text.trim()) {
            // Insert text
            requests.push(createTextInsert(textResult.text, currentIndex));

            // Apply formatting
            textResult.formatRanges.forEach((range) => {
              requests.push(
                createTextStyle(range.start, range.end, range.style)
              );
            });

            currentIndex += textResult.length;
          }

          // Add paragraph break
          requests.push(createTextInsert("\n", currentIndex));
          currentIndex += 1;
        } else {
          // Handle other elements
          const textResult = processTextContent(node, currentIndex);

          if (textResult.text.trim()) {
            requests.push(createTextInsert(textResult.text, currentIndex));

            textResult.formatRanges.forEach((range) => {
              requests.push(
                createTextStyle(range.start, range.end, range.style)
              );
            });

            currentIndex += textResult.length;
          }
        }
      } else if (node.nodeType === dom.window.Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text) {
          requests.push(createTextInsert(text, currentIndex));
          currentIndex += text.length;
        }
      }
    }
  }

  // Execute processing
  processAllElements();

  return {
    requests: requests,
  };
}

function testConverter() {
  console.log("=== Testing HTML to Google Docs Converter ===\n");

  // Test 1: Basic text with formatting
  const test1 = "<div>Hello <b>world</b> with <u>underlined</u> text</div>";
  console.log("Test 1 - Basic formatting:");
  console.log("Input:", test1);
  console.log(
    "Output:",
    JSON.stringify(htmlToGoogleDocsBatchUpdate(test1), null, 2)
  );
  console.log("\n---\n");

  // Test 2: Table with formatting
  const test2 = `
    <table>
      <tr>
        <th><b>Name</b></th>
        <th><u>Age</u></th>
      </tr>
      <tr>
        <td>John</td>
        <td>25</td>
      </tr>
      <tr>
        <td><b>Jane</b></td>
        <td><u>30</u></td>
      </tr>
    </table>
  `;
  console.log("Test 2 - Table with formatting:");
  console.log("Input:", test2.trim());
  console.log(
    "Output:",
    JSON.stringify(htmlToGoogleDocsBatchUpdate(test2), null, 2)
  );
  console.log("\n---\n");

  // Test 3: Mixed content
  const test3 = `
    <div>Introduction paragraph with <b>bold</b> text.</div>
    <table>
      <tr>
        <td>Cell 1</td>
        <td><u>Cell 2</u></td>
      </tr>
    </table>
    <div>Conclusion with <b><u>bold and underlined</u></b> text.</div>
  `;
  console.log("Test 3 - Mixed content:");
  console.log("Input:", test3.trim());
  console.log(
    "Output:",
    JSON.stringify(htmlToGoogleDocsBatchUpdate(test3), null, 2)
  );
  console.log("\n---\n");

  // Test 4: Nested formatting
  const test4 =
    "<div>Text with <b>bold and <u>nested underline</u></b> formatting</div>";
  console.log("Test 4 - Nested formatting:");
  console.log("Input:", test4);
  console.log(
    "Output:",
    JSON.stringify(htmlToGoogleDocsBatchUpdate(test4), null, 2)
  );
}

async function updateGoogleDoc(payload, id, startIndex = 12034) {
  //   const { requests } = htmlToGoogleDocsBatchUpdate(html, startIndex);
  const auth = await getAuthClient();
  const docs = google.docs({ version: "v1", auth });

  // Get the document
  const doc = await docs.documents.get({ documentId: id });

  // Execute the batch update
  await docs.documents.batchUpdate({
    documentId: id,
    requestBody: {
      requests: [payload],
    },
  });
  // Example of how to use with Google Docs API
  /*
  const { google } = require('googleapis');
  const docs = google.docs({ version: 'v1', auth: yourAuthClient });
  
  return docs.documents.batchUpdate({
    documentId: documentId,
    requestBody: payload
  });
  */
  console.log("Successful");
}

module.exports = updateGoogleDoc;

// const id = "1D5MGaxZmdC6crgy1VNZ5EjvJAUC1oU2DHmHQc5aMk-s";
// updateGoogleDoc(payload, id, 12034);

// console.log(payload);
