const express = require("express");
const AuthController = require("../controllers/AuthController");
const PriceController = require("../controllers/PriceController");
const router = express.Router();

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/getPrice", PriceController.getPrice);

module.exports = router;
