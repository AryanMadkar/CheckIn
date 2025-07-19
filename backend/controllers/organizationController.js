const Organization = require('../models/Organization');
const User = require('../models/User');

exports.getOrganizationProfile = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organizationId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    res.json(org);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch organization' });
  }
};
