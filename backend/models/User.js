const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["organization", "user"],
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: function () {
      return this.role === "user";
    },
  },
  deviceInfo: {
    deviceId: String,
    deviceType: String,
    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    },
  },
  workingHours: {
    start: {
      type: String,
      default: "09:00",
    },
    end: {
      type: String,
      default: "17:00",
    },
  },
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshToken: String,
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
