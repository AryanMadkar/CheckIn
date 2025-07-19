const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); // [9]
const antiSpoofing = require("../middleware/antiSpoofingMiddleware"); // [8]
const attendanceController = require("../controllers/attendanceController"); // [3]
const validators = require("../utils/validators"); // [22]
const Attendance = require("../models/Attendance"); // [11]

router.post("/scan", auth, validators.qrScanValidation, antiSpoofing, attendanceController.scanQRCode);

router.get("/records", auth, async (req, res) => {
  try {
    if (!req.user.organizationId) {
      return res.status(400).json({ message: "No organization associated with user" });
    }

    const { organizationId } = req.user;
    const { page = 1, limit = 20 } = req.query; // New: Pagination for optimization [26]

    // New: Basic validation for query params
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    const records = await Attendance.find({ organizationId })
      .populate("userId", "name email")
      .sort({ timestamp: -1 }) // Sort by recent
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments({ organizationId });

    res.json({
      records,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message }); // Improved error response
  }
});

module.exports = router;
