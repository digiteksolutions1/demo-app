const APIResponse = require("../utils/APIResponse");
const createFolder = require("../google/driveService");
const db = require("../database/db");
const {
  saveToGoogleDoc,
  duplicateFile,
  overwriteAnnexSection,
} = require("../google/docsService");
const generateQuote = require("../Templates/quoteTemplate");
const {
  htmlToGoogleDocsRequests,
  convertHTMLToGoogleDocsPayload,
} = require("../Templates/htmlToGoogleDoc");
const additionalInfoGenerator = require("../Templates/additionalInfo");
const contractGenerator = require("../Templates/ContractData");
const payload = require("../Templates/ContractData");
const updateGoogleDoc = require("../Templates/contractTesting2");
const contractData = require("../Templates/ContractData");
const appendFormDataToSheet = require("../google/sheetsService");

const FormDataController = {
  async formSubmit(req, res) {
    try {
      const { formData, clientEvaluation, cleanedNotes, t_Price } = req.body;

      const query = `
        INSERT INTO potentialclients 
          (form, notes, totalPrice, evaluate, date)
        VALUES (?, ?, ?, ?, NOW())
      `;
      const values = [
        JSON.stringify(formData),
        cleanedNotes,
        t_Price,
        JSON.stringify(clientEvaluation),
      ];

      const [response] = await db.query(query, values);

      //Create 1 main folder
      const folder = await createFolder(
        `${formData.contractDate}_${formData.clientName}`
      );

      //Create 3 docs
      // const quote = await createGoogleDoc("Quote", folder.id);
      // const contract = await createGoogleDoc("Contract", folder.id);
      // const addInfo = await createGoogleDoc("Additional Info", folder.id);

      // console.log(addInfo.id);

      const html = generateQuote(formData, t_Price);
      const requests = htmlToGoogleDocsRequests(html, 1);
      const quote = await saveToGoogleDoc(requests, "Quote", folder.id);

      const addInfo = additionalInfoGenerator(
        cleanedNotes,
        clientEvaluation,
        formData
      );
      const requests1 = htmlToGoogleDocsRequests(addInfo, 1);
      // console.log(JSON.stringify(requests1, null, 2));
      // console.log(JSON.parse(requests1));

      const additionalInfoDoc = await saveToGoogleDoc(
        requests1,
        "Additional Info",
        folder.id
      );

      // const duplicateFileId = await duplicateFile(
      //   ["115zWec71_VNRdBIWDbbKX9D_fBVqVGauUnEFfYuteec"],
      //   folder.id,
      //   "Contract"
      // );

      const combinedForm = { ...formData, totalPrice: t_Price };
      const sheetData = [
        response.insertId,
        formData.contractDate,
        formData.clientName,
        formData.tradingName,
        folder.webViewLink,
        quote.link,
        "",
        additionalInfoDoc.link,
        formData.addedBy,
        JSON.stringify(combinedForm),
        folder.id,
      ];
      console.log(sheetData);

      appendFormDataToSheet(sheetData)
        .then(() => {
          console.log("Sheet Data Added");
        })
        .catch((err) => {
          console.log(err);
        });

      // const contractFileId = contractGenerator(formData);
      // const contractHTML = convertHTMLToGoogleDocsPayload(
      //   contractFileId,
      //   12034
      // );

      // const contractFile = await overwriteAnnexSection(
      //   duplicateFileId,
      //   contractHTML
      // );
      // const payload = contractData(formData, t_Price);
      // await updateGoogleDoc(payload, duplicateFileId, 12034);

      return APIResponse.suceess(
        res,
        { folderLink: folder.webViewLink, id: response.insertId },
        "Success",
        200
      );
    } catch (err) {
      console.log("Form Data Submit Error", err);
      return APIResponse.error(res, null, "Internal Server Error", 500);
    }
  },
};

module.exports = FormDataController;
