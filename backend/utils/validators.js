const { body } = require("express-validator");

exports.registerOrganizationValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("name").notEmpty(),
  body("organizationName").notEmpty(),
  body("location.latitude").isFloat(),
  body("location.longitude").isFloat(),
];
exports.registerUserValidation = [
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("name").notEmpty(),
  body("organizationCode").notEmpty(),
];
exports.loginValidation = [body("email").isEmail(), body("password").exists()];
exports.qrScanValidation = [
  body("code").exists(),
  body("location.latitude").isFloat(),
  body("location.longitude").isFloat(),
  body("type").isIn(["check-in", "check-out"]),
];

exports.generateQRValidation = [
  body("qrType")
    .isIn(["check-in", "check-out"])
    .withMessage("qrType must be either 'check-in' or 'check-out'")
];
