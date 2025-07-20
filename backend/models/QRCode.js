const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    qrType: {
      type: String,
      enum: ["check-in", "check-out"],
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
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
    },
    active: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    qrImageData: String, // Base64 encoded QR code image
  },
  {
    timestamps: true,
  }
);

qrCodeSchema.index({ organizationId: 1, validFrom: 1, validUntil: 1 });
qrCodeSchema.index({ code: 1, active: 1 });

module.exports = mongoose.model("QRCode", qrCodeSchema);
