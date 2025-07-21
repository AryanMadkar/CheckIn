// src/components/profile/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building,
  MapPin,
  Mail,
  Calendar,
  Edit3,
  Save,
  X,
  Settings,
  LogOut,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          duration: Math.random() * 30 + 20,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditData(userData);
      } else {
        // Handle unauthorized
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("accessToken");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-green-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-24" />

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
            >
              <Zap className="w-8 h-8 text-black" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Profile Dashboard
              </h1>
              <p className="text-gray-400">Manage your digital identity</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">
                Personal Information
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-all duration-300"
              >
                {isEditing ? (
                  <Save className="w-5 h-5" />
                ) : (
                  <Edit3 className="w-5 h-5" />
                )}
                {isEditing ? "Save" : "Edit"}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={editData.name || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, name: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={editData.email || ""}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 focus:outline-none transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      className="bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-cyan-400 transition-all duration-300"
                    >
                      Save Changes
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <User className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p className="text-white font-semibold">
                          {user?.name || "Not set"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
                      <div className="p-3 bg-cyan-500/20 rounded-lg">
                        <Mail className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white font-semibold">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <Shield className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Role</p>
                        <p className="text-white font-semibold capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
                      <div className="p-3 bg-orange-500/20 rounded-lg">
                        <Clock className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Last Login</p>
                        <p className="text-white font-semibold">
                          {user?.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Organization Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Organization</h3>

            {user?.organization ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Building className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-white font-semibold">
                      {user.organization.name}
                    </p>
                  </div>
                </div>

                {user.organization.address && (
                  <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white font-semibold">
                        {user.organization.address}
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-green-500/10 rounded-xl border border-cyan-500/20">
                  <p className="text-sm text-cyan-400 mb-1">Member since</p>
                  <p className="text-white font-semibold">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-500/20 rounded-full w-16 h-16 mx-auto mb-4">
                  <Building className="w-8 h-8 text-gray-400 mx-auto mt-1" />
                </div>
                <p className="text-gray-400">No organization assigned</p>
              </div>
            )}
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-gray-900/50 backdrop-blur-xl border border-green-500/20 rounded-2xl p-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">
              Account Statistics
            </h3>

            <div className="grid md:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-400 text-sm font-medium">
                      Account Status
                    </p>
                    <p className="text-2xl font-bold text-white">Active</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl border border-cyan-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-400 text-sm font-medium">
                      Member Since
                    </p>
                    <p className="text-lg font-bold text-white">
                      {new Date(user?.createdAt).getFullYear()}
                    </p>
                  </div>
                  <div className="p-3 bg-cyan-500/20 rounded-full">
                    <Calendar className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl border border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-400 text-sm font-medium">
                      Profile Views
                    </p>
                    <p className="text-2xl font-bold text-white">42</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-6 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-400 text-sm font-medium">
                      Security Score
                    </p>
                    <p className="text-2xl font-bold text-white">98%</p>
                  </div>
                  <div className="p-3 bg-orange-500/20 rounded-full">
                    <Settings className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
