const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
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
    radius: {
      type: Number,
      default: 100, // meters
    },
  },
  settings: {
    timezone: {
      type: String,
      default: "UTC",
    },
    qrCodeValidityMinutes: {
      type: Number,
      default: 30,
    },
    locationToleranceMeters: {
      type: Number,
      default: 50,
    },
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
