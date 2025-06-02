const express = require("express");
const app = express();
const PORT = 3001; // Change for each app

app.get("/", (req, res) => {
  res.send("Hello from Node App");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
