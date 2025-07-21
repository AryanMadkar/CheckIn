const User = require("../models/User");
const Organization = require("../models/Organization");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const authController = {
  registerOrganization: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, organizationName, address, location } =
        req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = new User({
        email,
        password,
        name,
        role: "organization",
      });

      await user.save();

      const organization = new Organization({
        name: organizationName,
        address,
        location,
        adminId: user._id,
      });

      await organization.save();

      user.organizationId = organization._id;
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "Organization registered successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        organization: {
          id: organization._id,
          name: organization.name,
        },
        accessToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  },

  registerUser: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, organizationCode } = req.body;
      let organization;

      if (organizationCode.match(/^[0-9a-fA-F]{24}$/)) {
        // It's a valid ObjectId format, search by _id
        organization = await Organization.findById(organizationCode);
      } else {
        // It's not an ObjectId format, search by name only
        organization = await Organization.findOne({ name: organizationCode });
      }

      if (!organization) {
        return res.status(400).json({ message: "Organization not found" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = new User({
        email,
        password,
        name,
        role: "user",
        organizationId: organization._id,
      });

      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        organization: {
          id: organization._id,
          name: organization.name,
        },
        accessToken,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  },

  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).populate("organizationId");
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      user.lastLogin = new Date();
      await user.save();

      const { accessToken, refreshToken } = generateTokens(user._id);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        organization: user.organizationId
          ? {
              id: user.organizationId._id,
              name: user.organizationId.name,
            }
          : null,
        accessToken,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  },

  refreshToken: async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        user._id
      );

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user._id)
        .populate("organizationId")
        .select("-password -refreshToken");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const response = {
        ...user.toObject(),
        organization: user.organizationId || null,
      };

      res.json(response);
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const { name, workingHours } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          name,
          workingHours,
        },
        { new: true }
      )
        .populate("organizationId")
        .select("-password -refreshToken");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const response = {
        ...user.toObject(),
        organization: user.organizationId || null,
      };

      res.json(response);
    } catch (error) {
      console.error("Update user profile error:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshToken");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  },
};

module.exports = authController;
