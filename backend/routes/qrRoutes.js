const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const qrController = require('../controllers/qrController');

// For users/dashboard: Get current QR code for org
router.get('/active', auth, qrController.getActiveQRCode);

// For org/admin: Trigger manual QR code generation (restricted to organization role)
router.post('/generate', auth, role(['organization']), qrController.generateNewQRCode);

module.exports = router;
