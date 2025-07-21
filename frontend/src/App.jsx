// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/common/ProtectedRoute";

// User Components
import Dashboard from "./components/dashboard/Dashboard";
import UserProfile from "./components/profile/UserProfile";
import QRScanner from "./components/scanner/QRScanner";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import AttendanceRecords from "./components/attendance/AttendanceRecords";
import QRCodeViewer from "./components/qr/QRCodeViewer";

import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <AppContextProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/qr-scanner"
              element={
                <ProtectedRoute>
                  <QRScanner />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/records"
              element={
                <ProtectedRoute>
                  <AttendanceRecords />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/qr-codes"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-black p-6">
                    <div className="max-w-4xl mx-auto space-y-8">
                      <h1 className="text-3xl font-bold text-white text-center mb-8">
                        QR Code Management
                      </h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <QRCodeViewer qrType="check-in" />
                        <QRCodeViewer qrType="check-out" />
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AppContextProvider>
    </ErrorBoundary>
  );
}

export default App;
