const QRCode = require("qrcode");
const crypto = require("crypto");

const QrGenerator = {
  generateQRCode: async (organizationId, location, validityMinutes = 30) => {
    try {
      const timestamp = Date.now();
      const randomBytes = crypto.randomBytes(16).toString("hex");
      const code = `${organizationId}_${timestamp}_${randomBytes}`;

      const qrData = {
        code,
        organizationId,
        location,
        timestamp,
        validUntil: timestamp + validityMinutes * 60 * 1000,
      };

      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData), {
        errorCorrectionLevel: "H",
        type: "image/png",
        quality: 0.98,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      return {
        code,
        qrData,
        qrCodeImage,
      };
    } catch (error) {
      console.error("QR code generation error:", error);
      throw error;
    }
  },

  validateQRCode: (qrData) => {
    try {
      const currentTime = Date.now();
      const { validUntil } = qrData;
      return currentTime <= validUntil;
    } catch (error) {
      console.error("QR code validation error:", error);
      return false;
    }
  },
};

module.exports = QrGenerator;
