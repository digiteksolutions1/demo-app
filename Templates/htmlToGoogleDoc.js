const { parseDocument } = require("htmlparser2");
const { DomUtils } = require("htmlparser2");

function htmlToGoogleDocsRequests(html, i) {
  const doc = parseDocument(html);
  const body = DomUtils.getChildren(doc);
  const requests = [];
  let index = i;

  function processNode(node, activeStyles = {}) {
    if (node.type === "text") {
      const text = node.data;
      if (text.trim() !== "") {
        const startIndex = index;
        const endIndex = index + text.length;

        // Insert text
        requests.push({
          insertText: {
            location: { index },
            text,
          },
        });

        // Apply formatting
        const textStyle = {};
        const fields = [];

        if (activeStyles.bold) {
          textStyle.bold = true;
          fields.push("bold");
        } else {
          // Explicitly unset bold if not active
          textStyle.bold = false;
          fields.push("bold");
        }
        if (activeStyles.underline) {
          textStyle.underline = true;
          fields.push("underline");
        } else {
          textStyle.underline = null;
          fields.push("underline");
        }

        if (activeStyles.link) {
          textStyle.link = { url: activeStyles.link };
          textStyle.underline = true;
          fields.push("link", "underline");
        } else {
          textStyle.link = null;
          textStyle.underline = false;
          fields.push("link", "underline");
        }

        requests.push({
          updateTextStyle: {
            textStyle,
            fields: fields.join(","),
            range: { startIndex, endIndex },
          },
        });

        index = endIndex;
      }
    } else if (node.type === "tag") {
      let newStyles = { ...activeStyles };

      if (node.name === "strong" || node.name === "b") {
        newStyles.bold = true;
      }
      if (node.name === "u") {
        newStyles.underline = true;
      }
      if (node.name === "a") {
        const href = node.attribs.href;
        if (href) newStyles.link = href;
      }

      if (node.name === "br") {
        requests.push({
          insertText: {
            location: { index },
            text: "\n",
          },
        });
        index++;
        return;
      }

      if (node.name === "p") {
        DomUtils.getChildren(node).forEach((child) =>
          processNode(child, newStyles)
        );
        requests.push({
          insertText: {
            location: { index },
            text: "\n\n",
          },
        });
        index += 2;
        return;
      }

      DomUtils.getChildren(node).forEach((child) =>
        processNode(child, newStyles)
      );
    }
  }

  body.forEach((node) => processNode(node));
  return requests;
}

//----------------------------------------------------------------------------------
// const { parseDocument } = require("htmlparser2");
// const { DomUtils } = require("htmlparser2");

// function htmlToGoogleDocsRequests(html, startIndex = 1) {
//   const doc = parseDocument(html);
//   const body = DomUtils.getChildren(doc);
//   const requests = [];
//   let index = startIndex;

//   const insertText = (text, style = {}) => {
//     const start = index;
//     const end = start + text.length;

//     requests.push({
//       insertText: {
//         location: { index },
//         text,
//       },
//     });

//     const textStyle = {};
//     const fields = [];

//     if (style.bold) {
//       textStyle.bold = true;
//       fields.push("bold");
//     }

//     if (style.underline) {
//       textStyle.underline = true;
//       fields.push("underline");
//     }

//     if (style.link) {
//       textStyle.link = { url: style.link };
//       textStyle.underline = true; // force underline for links
//       fields.push("link", "underline");
//     }

//     if (fields.length > 0) {
//       requests.push({
//         updateTextStyle: {
//           textStyle,
//           fields: fields.join(","),
//           range: { startIndex: start, endIndex: end },
//         },
//       });
//     }

//     index = end;
//   };

//   const processNode = (node, style = {}) => {
//     if (node.type === "text") {
//       if (node.data.trim() !== "") {
//         insertText(node.data, style);
//       }
//     } else if (node.type === "tag") {
//       if (node.name === "br") {
//         insertText("\n");
//         return;
//       }

//       if (node.name === "p") {
//         DomUtils.getChildren(node).forEach((child) => processNode(child));
//         insertText("\n\n");
//         return;
//       }

//       if (node.name === "strong" || node.name === "b") {
//         DomUtils.getChildren(node).forEach((child) =>
//           processNode(child, { ...style, bold: true })
//         );
//         return;
//       }

//       if (node.name === "u") {
//         DomUtils.getChildren(node).forEach((child) =>
//           processNode(child, { ...style, underline: true })
//         );
//         return;
//       }

//       if (node.name === "a" && node.attribs?.href) {
//         DomUtils.getChildren(node).forEach((child) =>
//           processNode(child, { ...style, link: node.attribs.href })
//         );
//         return;
//       }

//       // For table, tr, td, th — render as plain formatted text
//       if (node.name === "table") {
//         const rows = DomUtils.getChildren(node).filter((n) => n.name === "tr");
//         rows.forEach((row) => {
//           const cells = DomUtils.getChildren(row).filter(
//             (n) => n.name === "td" || n.name === "th"
//           );
//           cells.forEach((cell, i) => {
//             const text = DomUtils.getText(cell).trim();
//             const cellStyle =
//               cell.name === "th" ? { ...style, bold: true } : style;
//             insertText(text, cellStyle);
//             if (i < cells.length - 1) insertText(" | ");
//           });
//           insertText("\n");
//         });
//         insertText("\n");
//         return;
//       }

//       // Default: process children without changing style
//       DomUtils.getChildren(node).forEach((child) => processNode(child, style));
//     }
//   };

//   body.forEach((node) => processNode(node));
//   return requests;
// }

// module.exports = htmlToGoogleDocsRequests;
const cheerio = require("cheerio");
function convertHTMLToGoogleDocsPayload(html) {
  const $ = cheerio.load(html);
  const requests = [];
  let currentIndex = 1;
  const tableStack = [];

  // Helper: Insert text and return new index
  const insertText = (text, index) => {
    if (!text) return index;
    requests.push({
      insertText: {
        text,
        location: { index },
      },
    });
    return index + text.length;
  };

  // Helper: Apply text styling
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

  // Helper: Create table border style
  const getBorderStyle = () => ({
    width: { magnitude: 1, unit: "PT" },
    dashStyle: "SOLID",
  });

  // Helper: Process table cell content
  const processTableCell = (cell, rowIdx, colIdx, tableStartIndex) => {
    let cellIndex = tableStartIndex + rowIdx * 2 + colIdx;
    let textContent = "";
    const styles = [];

    $(cell)
      .contents()
      .each((_, content) => {
        if (content.type === "text") {
          textContent += $(content).text();
        } else if (content.name === "br") {
          textContent += "\n";
        } else if (content.name) {
          // Handle nested formatting
          const tag = content.name;
          const style = {};
          if (tag === "b" || tag === "strong") style.bold = true;
          if (tag === "i" || tag === "em") style.italic = true;
          if (tag === "u") style.underline = true;

          if (Object.keys(style).length > 0) {
            const start = textContent.length;
            textContent += $(content).text();
            const end = textContent.length;
            styles.push({ start, end, style });
          }
        }
      });

    // Insert cell text
    requests.push({
      insertText: {
        text: textContent,
        location: { index: cellIndex },
      },
    });

    // Apply cell formatting
    styles.forEach(({ start, end, style }) => {
      applyStyle(cellIndex + start, cellIndex + end, style);
    });

    return cellIndex + textContent.length;
  };

  // Process node recursively
  const processNode = (node, index) => {
    if (node.type === "text") {
      return insertText($(node).text(), index);
    }

    const tag = node.name;
    let newIndex = index;

    // Handle line breaks
    if (tag === "br") {
      return insertText("\n", index);
    }

    // Handle tables
    if (tag === "table") {
      const rows = [];
      $(node)
        .find("tr")
        .each((_, row) => {
          const cells = [];
          $(row)
            .find("th, td")
            .each((_, cell) => {
              cells.push(cell);
            });
          rows.push(cells);
        });

      const rowCount = rows.length;
      const columnCount = Math.max(...rows.map((r) => r.length));

      // Insert table
      requests.push({
        insertTable: {
          rows: rowCount,
          columns: columnCount,
          location: { index },
        },
      });

      const tableStartIndex = index + 1;
      tableStack.push(tableStartIndex);

      // Process table cells
      rows.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
          newIndex = processTableCell(cell, rowIdx, colIdx, tableStartIndex);
        });
      });

      // Apply table borders
      requests.push({
        updateTableCellStyle: {
          tableCellStyle: {
            borderLeft: getBorderStyle(),
            borderRight: getBorderStyle(),
            borderTop: getBorderStyle(),
            borderBottom: getBorderStyle(),
          },
          fields: "borderLeft,borderRight,borderTop,borderBottom",
          tableRange: {
            tableCellLocation: {
              tableStartLocation: { index: tableStartIndex },
              rowIndex: 0,
              columnIndex: 0,
            },
            rowSpan: rowCount,
            columnSpan: columnCount,
          },
        },
      });

      tableStack.pop();
      return newIndex;
    }

    // Process children
    if (node.children) {
      $(node)
        .contents()
        .each((_, child) => {
          newIndex = processNode(child, newIndex);
        });
    }

    // Apply text formatting
    const style = {};
    if (tag === "b" || tag === "strong") style.bold = true;
    if (tag === "i" || tag === "em") style.italic = true;
    if (tag === "u") style.underline = true;

    if (Object.keys(style).length > 0) {
      applyStyle(index, newIndex, style);
    }

    return newIndex;
  };

  // Start processing
  $("body")
    .contents()
    .each((_, node) => {
      currentIndex = processNode(node, currentIndex);
    });

  return { requests };
}

module.exports = { htmlToGoogleDocsRequests, convertHTMLToGoogleDocsPayload };

// module.exports = convertHTMLToGoogleDocsPayload;

// const html = `
//   <div>
//     <p>Hello <b>world</b>!</p>
//     <table border="1">
//       <tr><th>Header 1</th><th>Header 2</th></tr>
//       <tr><td><i>Cell 1</i></td><td><b>Cell 2</b></td></tr>
//     </table>
//     <br/>
//     <i>Italic text</i> and normal text.
//   </div>
// `;

// const payload = convertHTMLToGoogleDocsPayload(html);
// console.log(JSON.stringify(payload, null, 2));
