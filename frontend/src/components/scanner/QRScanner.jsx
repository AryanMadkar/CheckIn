// src/components/scanner/QRScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, QrCode, CheckCircle, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceType, setAttendanceType] = useState("check-in");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanQRCode();
      }
    } catch (error) {
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (!canvas || !video) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const scanFrame = () => {
      if (!isScanning) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        // Here you would integrate with a QR code library like jsQR
        // For demo purposes, we'll simulate QR detection

        // This is a placeholder - you'll need to install and use jsQR or similar
        // const code = jsQR(imageData.data, imageData.width, imageData.height);
        // if (code) {
        //   handleQRDetected(code.data);
        //   return;
        // }
      } catch (error) {
        console.error("QR scanning error:", error);
      }

      requestAnimationFrame(scanFrame);
    };

    requestAnimationFrame(scanFrame);
  };

  const handleQRDetected = async (qrData) => {
    if (loading) return;

    setIsScanning(false);
    setLoading(true);
    stopCamera();

    try {
      // Get user's current location
      const position = await getCurrentPosition();

      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:5000/api/attendance/scan",
        {
          code: qrData,
          type: attendanceType,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          deviceInfo: {
            deviceId: navigator.userAgent,
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            ipAddress: "client-ip", // This would be handled by backend
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScanResult({
        success: true,
        message: response.data.message,
        attendance: response.data.attendance,
      });
    } catch (error) {
      setScanResult({
        success: false,
        message: error.response?.data?.message || "Attendance scan failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  };

  // Simulate QR detection for demo (remove when implementing real QR scanner)
  const simulateQRScan = () => {
    const mockQRData = `test_qr_code_${Date.now()}`;
    handleQRDetected(mockQRData);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-6 border-b border-gray-800"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </motion.button>

        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">QR Scanner</h1>
        </div>

        <div className="w-20"></div>
      </motion.div>

      <div className="p-6">
        {/* Attendance Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex justify-center">
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setAttendanceType("check-in")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  attendanceType === "check-in"
                    ? "bg-green-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Check In
              </button>
              <button
                onClick={() => setAttendanceType("check-out")}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  attendanceType === "check-out"
                    ? "bg-red-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Check Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Camera Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          {!scanResult ? (
            <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                {!isScanning && !loading ? (
                  <>
                    <div className="w-32 h-32 border-4 border-dashed border-gray-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                      <QrCode className="w-16 h-16 text-gray-600" />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-4">
                      Scan QR Code for{" "}
                      {attendanceType === "check-in" ? "Check In" : "Check Out"}
                    </h3>

                    <p className="text-gray-400 mb-6">
                      Position the QR code within the camera frame
                    </p>

                    {error && (
                      <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCamera}
                      className="bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-3 px-8 rounded-xl hover:from-cyan-400 hover:to-green-400 transition-all"
                    >
                      Start Camera
                    </motion.button>

                    {/* Demo Button - Remove in production */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={simulateQRScan}
                      className="mt-4 bg-gray-700 text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-600 transition-all block mx-auto"
                    >
                      Demo Scan (Test)
                    </motion.button>
                  </>
                ) : loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-white">Processing attendance...</p>
                  </>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-4 border-2 border-cyan-400 rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400"></div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopCamera}
                      className="mt-4 bg-red-500 text-white font-medium py-2 px-6 rounded-lg hover:bg-red-600 transition-all"
                    >
                      Stop Camera
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Scan Result
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl text-center"
            >
              {scanResult.success ? (
                <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
              ) : (
                <X className="w-20 h-20 text-red-400 mx-auto mb-4" />
              )}

              <h3
                className={`text-2xl font-bold mb-4 ${
                  scanResult.success ? "text-green-400" : "text-red-400"
                }`}
              >
                {scanResult.success ? "Success!" : "Failed!"}
              </h3>

              <p className="text-gray-300 mb-6">{scanResult.message}</p>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setScanResult(null);
                    setError("");
                  }}
                  className="bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-2 px-6 rounded-lg hover:from-cyan-400 hover:to-green-400 transition-all"
                >
                  Scan Again
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/dashboard")}
                  className="bg-gray-700 text-white font-medium py-2 px-6 rounded-lg hover:bg-gray-600 transition-all"
                >
                  Back to Dashboard
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default QRScanner;
