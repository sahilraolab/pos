const express = require("express");
const path = require("path");
const app = express();

const PORT = 3001;

// Serve static frontend files from the 'renderer' folder
app.use(express.static(path.join(__dirname, "renderer")));

// Fallback to index.html for SPA routes (if using React/Vue etc.)
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "renderer", "index.html"));
// });

app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});
