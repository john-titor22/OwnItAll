const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, 'dist');

// Serve static files from the Expo web export
app.use(express.static(DIST));

// SPA fallback — all routes serve index.html (Express v5 syntax)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Own It All running on port ${PORT}`);
});
