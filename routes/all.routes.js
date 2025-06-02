const express = require("express");
const router = express.Router();

const publicRoutes = require("./public.routes");
const protectedRoutes = require("./protected.routes");

router.use("/api/v1", publicRoutes);
router.use("/api/v1", protectedRoutes);

module.exports = router;
