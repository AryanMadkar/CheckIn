const Organization = require("../models/Organization");
const QRCode = require("../models/QRCode");
const qrGenerator = require("../utils/qrGenerator");

const qrScheduler = {
  // ✅ FIXED: Method name typo
  generateForOrganization: async (organizationId) => {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error("Organization not found");
      }

      // Deactivate existing QR codes
      await QRCode.updateMany(
        { organizationId: organization._id, active: true },
        { active: false }
      );

      // Generate new QR code
      const { code, qrCodeImage } = await qrGenerator.generateQRCode(
        organization._id,
        organization.location,
        organization.settings.qrCodeValidityMinutes
      );

      // Calculate validity period
      const now = new Date();
      const validFrom = new Date(now.getTime());
      const validUntil = new Date(
        now.getTime() + organization.settings.qrCodeValidityMinutes * 60 * 1000
      );

      // Save to database
      const qrCodeDoc = new QRCode({
        organizationId: organization._id,
        code,
        validFrom,
        validUntil,
        location: organization.location,
        qrImageData: qrCodeImage,
        active: true,
      });

      await qrCodeDoc.save();
      return qrCodeDoc;
    } catch (error) {
      console.error("QR code generation error:", error);
      throw error;
    }
  },
  generateTimedQRCodes: async () => {
    const organizations = await Organization.find({ isActive: true });

    for (const org of organizations) {
      const types = ["check-in", "check-out"];
      for (const type of types) {
        // Deactivate old QR codes of this type
        await QRCode.updateMany(
          { organizationId: org._id, qrType: type, active: true },
          { active: false }
        );

        const { code, qrCodeImage } = await qrGenerator.generateQRCode(
          org._id,
          org.location,
          org.settings.qrCodeValidityMinutes
        );

        const now = new Date();
        const validUntil = new Date(
          now.getTime() + org.settings.qrCodeValidityMinutes * 60 * 1000
        );

        await QRCode.create({
          organizationId: org._id,
          code,
          validFrom: now,
          validUntil,
          location: org.location,
          qrImageData: qrCodeImage,
          active: true,
          qrType: type,
        });
      }
    }
  },
};

module.exports = qrScheduler;
