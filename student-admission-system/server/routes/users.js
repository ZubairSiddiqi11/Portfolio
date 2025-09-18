const express = require('express');
const router = express.Router();

// Users routes
router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint - implementation needed' });
});

module.exports = router;