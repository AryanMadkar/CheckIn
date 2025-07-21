// src/components/profile/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Building, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  LogOut, 
  Zap, 
  Clock,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [editData, setEditData] = useState({});
  const [particles, setParticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setOrganization(response.data.organization || response.data.organizationId);
      setEditData({
        name: response.data.name || '',
        workingHours: response.data.workingHours || { start: '09:00', end: '17:00' }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setEditData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        'http://localhost:5000/api/auth/profile',
        editData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      await fetchUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
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
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Dynamic Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/6 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </motion.button>

          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full"
            >
              <Zap className="w-6 h-6 text-black" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              Profile
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-green-500/20 p-8 text-center border-b border-gray-700">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <User className="w-12 h-12 text-black" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {user?.name || 'User Profile'}
              </h2>
              
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Shield className="w-5 h-5" />
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8 space-y-6">
              {/* Basic Information */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Basic Information</h3>
                  
                  {!isEditing ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </motion.button>
                  ) : (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setIsEditing(false);
                          setEditData({
                            name: user.name || '',
                            workingHours: user.workingHours || { start: '09:00', end: '17:00' }
                          });
                        }}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </motion.button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                        <User className="w-5 h-5 text-cyan-400" />
                        <span className="text-white">{user?.name || 'Not set'}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <span className="text-white">{user?.email}</span>
                      <span className="text-xs text-gray-500 ml-auto">Read-only</span>
                    </div>
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                      <Building className="w-5 h-5 text-green-400" />
                      <span className="text-white">{organization?.name || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Working Hours</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time
                    </label>
                    {isEditing ? (
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="time"
                        name="workingHours.start"
                        value={editData.workingHours?.start || '09:00'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                        <Clock className="w-5 h-5 text-green-400" />
                        <span className="text-white">{user?.workingHours?.start || '09:00'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Time
                    </label>
                    {isEditing ? (
                      <motion.input
                        whileFocus={{ scale: 1.02 }}
                        type="time"
                        name="workingHours.end"
                        value={editData.workingHours?.end || '17:00'}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-xl text-white focus:border-cyan-400 focus:outline-none transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl">
                        <Clock className="w-5 h-5 text-green-400" />
                        <span className="text-white">{user?.workingHours?.end || '17:00'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
