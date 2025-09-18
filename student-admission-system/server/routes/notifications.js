const express = require('express');
const router = express.Router();

// Notifications routes
router.get('/', (req, res) => {
  res.json({ message: 'Notifications endpoint - implementation needed' });
});

module.exports = router;