const express = require("express");
const router = express.Router();
const auth = require("../auth/auth");
const FormDataController = require("../controllers/FormDataController");

router.post("/formData", auth, FormDataController.formSubmit);

module.exports = router;
