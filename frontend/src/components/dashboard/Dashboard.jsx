// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  MapPin, 
  Camera, 
  QrCode, 
  User, 
  LogOut,
  Clock,
  Building,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [particles, setParticles] = useState([]);
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 20 + 10,
      });
    }
    setParticles(newParticles);

    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      setOrganization(response.data.organization || response.data.organizationId);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });
      
      setLocationPermission(true);
      alert('Location access granted!');
    } catch (error) {
      alert('Location access denied. Please enable location services.');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop the stream immediately after permission check
      stream.getTracks().forEach(track => track.stop());
      
      setCameraPermission(true);
      alert('Camera access granted!');
    } catch (error) {
      alert('Camera access denied. Please enable camera permissions.');
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
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(particle.id) * 15, 0],
              opacity: [0, 1, 0],
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
        className="absolute top-1/4 left-1/6 w-80 h-80 bg-green-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.4, 0.2, 0.4],
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-2 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full"
            >
              <Zap className="w-6 h-6 text-black" />
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
              ElectroAuth
            </h1>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="p-2 bg-gray-800/50 border border-cyan-400/30 rounded-lg text-cyan-400 hover:bg-cyan-400/10 transition-all"
            >
              <User className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2 bg-gray-800/50 border border-red-400/30 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <User className="w-10 h-10 text-black" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name}!
              </h2>
              
              <p className="text-gray-400 mb-6">
                Ready to track your attendance for {organization?.name}?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl">
                  <Building className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white font-semibold">Organization</p>
                    <p className="text-gray-400 text-sm">{organization?.name || 'Not assigned'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl">
                  <Clock className="w-8 h-8 text-cyan-400" />
                  <div>
                    <p className="text-white font-semibold">Role</p>
                    <p className="text-gray-400 text-sm capitalize">{user?.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-black/30 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-white font-semibold">Status</p>
                    <p className="text-gray-400 text-sm">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Permissions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Required Permissions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Permission */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  locationPermission 
                    ? 'border-green-400 bg-green-400/10' 
                    : 'border-gray-600 hover:border-cyan-400/50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    locationPermission ? 'bg-green-400' : 'bg-gray-700'
                  }`}>
                    <MapPin className={`w-8 h-8 ${locationPermission ? 'text-black' : 'text-gray-400'}`} />
                  </div>
                  
                  <h4 className="text-white font-semibold mb-2">Location Access</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Required to verify your attendance location
                  </p>
                  
                  {locationPermission ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Granted</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={requestLocationPermission}
                      className="bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-2 px-4 rounded-lg hover:from-cyan-400 hover:to-green-400 transition-all"
                    >
                      Grant Access
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Camera Permission */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  cameraPermission 
                    ? 'border-green-400 bg-green-400/10' 
                    : 'border-gray-600 hover:border-cyan-400/50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    cameraPermission ? 'bg-green-400' : 'bg-gray-700'
                  }`}>
                    <Camera className={`w-8 h-8 ${cameraPermission ? 'text-black' : 'text-gray-400'}`} />
                  </div>
                  
                  <h4 className="text-white font-semibold mb-2">Camera Access</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Required to scan QR codes for attendance
                  </p>
                  
                  {cameraPermission ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Granted</span>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={requestCameraPermission}
                      className="bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-2 px-4 rounded-lg hover:from-cyan-400 hover:to-green-400 transition-all"
                    >
                      Grant Access
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* QR Scanner Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl text-center"
          >
            <QrCode className="w-20 h-20 text-cyan-400 mx-auto mb-4" />
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Scan QR Code
            </h3>
            
            <p className="text-gray-400 mb-6">
              Scan the organization's QR code to mark your attendance
            </p>

            {(locationPermission && cameraPermission) ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/qr-scanner')}
                className="bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-3 px-8 rounded-xl hover:from-cyan-400 hover:to-green-400 transition-all inline-flex items-center gap-2"
              >
                <QrCode className="w-6 h-6" />
                Start Scanning
              </motion.button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <AlertCircle className="w-5 h-5" />
                <span>Please grant all permissions first</span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
