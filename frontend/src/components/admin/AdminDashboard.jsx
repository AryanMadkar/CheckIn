// src/components/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  QrCode, 
  BarChart3, 
  Settings, 
  Plus,
  Clock,
  MapPin,
  Building,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const AdminDashboard = () => {
  const [activeQRs, setActiveQRs] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: 0,
    activeQRCodes: 0
  });
  const [particles, setParticles] = useState([]);
  const { user, organization, api } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // Generate particles
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 25 + 15,
      });
    }
    setParticles(newParticles);

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch active QR codes
      const qrResponse = await api.get('/qr/active');
      setActiveQRs([qrResponse.data]);

      // Fetch attendance stats (you'll need to create this endpoint)
      // const statsResponse = await api.get('/organization/stats');
      // setStats(statsResponse.data);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    }
  };

  const generateQRCode = async (type) => {
    try {
      await api.post('/qr/generate', { qrType: type });
      fetchDashboardData();
      alert(`${type} QR code generated successfully!`);
    } catch (error) {
      alert('Failed to generate QR code');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.sin(particle.id) * 10, 0],
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
        className="absolute top-1/4 left-1/6 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="relative z-10 p-6">
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
              className="p-2 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full"
            >
              <Zap className="w-6 h-6 text-black" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400">{organization?.name}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/settings')}
              className="p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 hover:text-white transition-all"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Total Employees', value: stats.totalEmployees, color: 'cyan' },
              { icon: Clock, title: 'Today\'s Attendance', value: stats.todayAttendance, color: 'green' },
              { icon: QrCode, title: 'Active QR Codes', value: stats.activeQRCodes, color: 'purple' }
            ].map(({ icon: Icon, title, value, color }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-${color}-500/20 rounded-full`}>
                    <Icon className={`w-6 h-6 text-${color}-400`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{title}</p>
                    <p className="text-2xl font-bold text-white">{value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* QR Code Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">QR Code Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['check-in', 'check-out'].map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white capitalize">
                      {type.replace('-', ' ')} QR Code
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => generateQRCode(type)}
                      className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${
                        type === 'check-in' 
                          ? 'from-green-500 to-cyan-500' 
                          : 'from-red-500 to-orange-500'
                      } text-white font-medium rounded-lg hover:shadow-lg transition-all`}
                    >
                      <Plus className="w-4 h-4" />
                      Generate New
                    </motion.button>
                  </div>
                  
                  {/* QR Code display area */}
                  <div className="aspect-square bg-white rounded-lg flex items-center justify-center max-w-xs">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Manage Employees', path: '/admin/employees', color: 'blue' },
              { icon: BarChart3, label: 'View Reports', path: '/admin/reports', color: 'green' },
              { icon: QrCode, label: 'QR Codes', path: '/admin/qr-codes', color: 'purple' },
              { icon: Settings, label: 'Settings', path: '/admin/settings', color: 'gray' }
            ].map(({ icon: Icon, label, path, color }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(path)}
                className="p-6 bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl hover:border-gray-600 transition-all group"
              >
                <Icon className={`w-8 h-8 text-${color}-400 mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                <p className="text-white font-medium">{label}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
