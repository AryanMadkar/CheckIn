const QRCode = require("../models/QRCode");
const qrGenerator = require("../utils/qrGenerator");
const Organization = require("../models/Organization");

exports.generateNewQRCode = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const org = await Organization.findById(orgId);
    
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    await QRCode.updateMany(
      { organizationId: org._id, active: true },
      { active: false }
    );

    // Fixed method name: generateQRCode instead of generateORCode
    const { code, qrCodeImage } = await qrGenerator.generateQRCode(
      org._id,
      org.location,
      org.settings.qrCodeValidityMinutes
    );

    const now = Date.now();
    const qrDoc = await QRCode.create({
      organizationId: org._id,
      code,
      validFrom: new Date(now),
      validUntil: new Date(
        now + org.settings.qrCodeValidityMinutes * 60 * 1000
      ),
      location: org.location,
      qrImageData: qrCodeImage,
      active: true,
    });

    res.json({
      message: "New QR code generated",
      qr: {
        code: qrDoc.code,
        validFrom: qrDoc.validFrom,
        validUntil: qrDoc.validUntil,
        qrImageData: qrDoc.qrImageData,
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ message: "QR code generation failed" });
  }
};

exports.getActiveQRCode = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const qr = await QRCode.findOne({
      organizationId: orgId,
      active: true,
    }).sort({ validFrom: -1 });

    if (!qr) {
      return res.status(404).json({ message: "No active QR code" });
    }

    res.json({
      code: qr.code,
      validFrom: qr.validFrom,
      validUntil: qr.validUntil,
      qrImageData: qr.qrImageData,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch QR code" });
  }
};
