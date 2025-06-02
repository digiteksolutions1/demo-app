const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./routes/all.routes");
const hash = require("./utils/hash");
require("dotenv").config();
require("./database/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/", router);
app.use(morgan("dev")); // LOGS

app.use(express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});
app.listen(PORT, () => {
  console.log(`🚀 Server is running at ${PORT}`);
});
