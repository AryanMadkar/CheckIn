const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const orgController = require('../controllers/organizationController');
const role = require('../middleware/roleMiddleware');

// Get own organization profile
router.get('/me', auth, role(['organization']), orgController.getOrganizationProfile);

module.exports = router;
