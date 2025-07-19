const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: true,
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QRCode",
    required: true,
  },
  type: {
    type: String,
    enum: ["check-in", "check-out"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    accuracy: Number,
  },
  deviceInfo: {
    deviceId: String,
    platform: String,
    userAgent: String,
    ipAddress: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationDetails: {
    locationMatch: Boolean,
    qrCodeValid: Boolean,
    timeValid: Boolean,
    deviceTrusted: Boolean,
    spoofingDetected: Boolean,
  },
  notes: String,
}, { timestamps: true });

attendanceSchema.index({ userId: 1, organizationId: 1, timestamp: -1 });
attendanceSchema.index({ qrCodeId: 1, timestamp: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
