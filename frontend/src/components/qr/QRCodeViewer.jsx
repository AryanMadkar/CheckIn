// src/components/qr/QRCodeViewer.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, RefreshCw, Download, Clock, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const QRCodeViewer = ({ qrType = 'check-in' }) => {
  const [qrData, setQrData] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { api } = useAppContext();

  useEffect(() => {
    fetchQRCode();
    const interval = setInterval(fetchQRCode, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [qrType]);

  useEffect(() => {
    if (qrData?.validUntil) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(qrData.validUntil).getTime();
        const remaining = end - now;
        
        if (remaining <= 0) {
          setTimeLeft(0);
          fetchQRCode();
        } else {
          setTimeLeft(Math.floor(remaining / 1000));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [qrData]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/qr/active?qrType=${qrType}`);
      setQrData(response.data);
    } catch (error) {
      setError('Failed to load QR code');
      console.error('QR fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewQR = async () => {
    try {
      setLoading(true);
      await api.post('/qr/generate', { qrType });
      await fetchQRCode();
    } catch (error) {
      setError('Failed to generate new QR code');
    }
  };

  const downloadQR = () => {
    if (qrData?.qrImageData) {
      const link = document.createElement('a');
      link.download = `${qrType}-qr-code.png`;
      link.href = qrData.qrImageData;
      link.click();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 max-w-md mx-auto"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2 capitalize">
          {qrType.replace('-', ' ')} QR Code
        </h3>
        
        {timeLeft > 0 && (
          <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{formatTime(timeLeft)}</span>
          </div>
        )}

        {loading ? (
          <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
            />
          </div>
        ) : error ? (
          <div className="aspect-square bg-gray-800 rounded-lg flex flex-col items-center justify-center mb-6 p-4">
            <AlertCircle className="w-16 h-16 text-red-400 mb-2" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : qrData?.qrImageData ? (
          <div className="mb-6">
            <img 
              src={qrData.qrImageData}
              alt={`${qrType} QR Code`}
              className="w-full max-w-xs mx-auto rounded-lg shadow-lg"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center mb-6">
            <QrCode className="w-16 h-16 text-gray-400" />
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchQRCode}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateNewQR}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-medium rounded-lg hover:from-cyan-400 hover:to-green-400 transition-all"
          >
            <QrCode className="w-4 h-4" />
            Generate New
          </motion.button>

          {qrData?.qrImageData && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadQR}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default QRCodeViewer;
