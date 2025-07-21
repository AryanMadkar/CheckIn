// src/components/auth/Register.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Zap,
  User,
  Lock,
  Mail,
  Building,
  MapPin,
  ArrowRight,
  Check,
  Loader2,
  Navigation,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    organizationName: "",
    organizationCode: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: ""
    },
    location: {
      latitude: "",
      longitude: ""
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [particles, setParticles] = useState([]);
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
  }, []);

  // Geocoding function using Nominatim (OpenStreetMap)
  const geocodeAddress = async () => {
    const { street, city, state, zipCode, country } = formData.address;
    
    // Check if required address fields are filled
    if (!street || !city || !state || !country) {
      setErrors(prev => ({ 
        ...prev, 
        geocoding: "Please fill in street, city, state, and country before getting coordinates" 
      }));
      return;
    }

    setIsGeocodingLoading(true);
    setErrors(prev => ({ ...prev, geocoding: "", latitude: "", longitude: "" }));

    try {
      // Construct the address string
      const addressString = `${street}, ${city}, ${state} ${zipCode}, ${country}`;
      
      // Using Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
          }
        }));
        
        // Show success message
        setErrors(prev => ({ 
          ...prev, 
          geocoding: "",
          success: "Coordinates found successfully!" 
        }));
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setErrors(prev => ({ ...prev, success: "" }));
        }, 3000);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          geocoding: "Address not found. Please check your address or enter coordinates manually." 
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setErrors(prev => ({ 
        ...prev, 
        geocoding: "Failed to get coordinates. Please enter them manually." 
      }));
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  // Alternative: Google Maps Geocoding (requires API key)
  const geocodeAddressGoogle = async () => {
    const { street, city, state, zipCode, country } = formData.address;
    
    if (!street || !city || !state || !country) {
      setErrors(prev => ({ 
        ...prev, 
        geocoding: "Please fill in street, city, state, and country before getting coordinates" 
      }));
      return;
    }

    setIsGeocodingLoading(true);
    setErrors(prev => ({ ...prev, geocoding: "", latitude: "", longitude: "" }));

    try {
      const addressString = `${street}, ${city}, ${state} ${zipCode}, ${country}`;
      const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setFormData(prev => ({
          ...prev,
          location: {
            latitude: lat,
            longitude: lng
          }
        }));
        
        setErrors(prev => ({ 
          ...prev, 
          geocoding: "",
          success: "Coordinates found successfully!" 
        }));
        
        setTimeout(() => {
          setErrors(prev => ({ ...prev, success: "" }));
        }, 3000);
      } else {
        setErrors(prev => ({ 
          ...prev, 
          geocoding: "Address not found. Please check your address or enter coordinates manually." 
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setErrors(prev => ({ 
        ...prev, 
        geocoding: "Failed to get coordinates. Please enter them manually." 
      }));
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  // Auto-geocode when address fields are complete
  useEffect(() => {
    if (userType === "organization" && 
        formData.address.street && 
        formData.address.city && 
        formData.address.state && 
        formData.address.country &&
        (!formData.location.latitude || !formData.location.longitude)) {
      
      // Debounce the geocoding request
      const timeoutId = setTimeout(() => {
        geocodeAddress();
      }, 1500); // Wait 1.5 seconds after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [formData.address.street, formData.address.city, formData.address.state, formData.address.country, userType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith('location.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: { ...prev.location, [field]: value === "" ? "" : parseFloat(value) }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    
    if (userType === "organization") {
      if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required";
      if (!formData.address.street.trim()) newErrors.street = "Street address is required";
      if (!formData.address.city.trim()) newErrors.city = "City is required";
      if (!formData.address.state.trim()) newErrors.state = "State is required";
      if (!formData.address.zipCode.trim()) newErrors.zipCode = "Zip code is required";
      if (!formData.address.country.trim()) newErrors.country = "Country is required";
      if (!formData.location.latitude || formData.location.latitude === "") newErrors.latitude = "Latitude is required";
      if (!formData.location.longitude || formData.location.longitude === "") newErrors.longitude = "Longitude is required";
    } else {
      if (!formData.organizationCode.trim()) newErrors.organizationCode = "Organization code is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    
    setIsLoading(true);
    setErrors({});

    const endpoint = userType === "organization"
      ? "http://localhost:5000/api/auth/register-organization"
      : "http://localhost:5000/api/auth/register-user";

    try {
      let requestBody;
      
      if (userType === "organization") {
        requestBody = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          organizationName: formData.organizationName,
          address: {
            street: formData.address.street,
            city: formData.address.city,
            state: formData.address.state,
            zipCode: formData.address.zipCode,
            country: formData.address.country
          },
          location: {
            latitude: parseFloat(formData.location.latitude),
            longitude: parseFloat(formData.location.longitude)
          }
        };
      } else {
        requestBody = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          organizationCode: formData.organizationCode
        };
      }

      const response = await axios.post(endpoint, requestBody);
      
      if (response.data.accessToken || response.data.token) {
        localStorage.setItem("accessToken", response.data.accessToken || response.data.token);
      }
      
      alert("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errorObj = {};
        error.response.data.errors.forEach((err) => {
          errorObj[err.path || err.param || 'general'] = err.msg || err.message;
        });
        setErrors(errorObj);
      } else {
        setErrors({ general: error.response?.data?.message || "Registration failed" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && userType) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => step > 1 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-8">
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
        className="absolute top-1/3 left-1/5 w-80 h-80 bg-green-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/5 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl"
        animate={{
          scale: [1.3, 1, 1.3],
          opacity: [0.4, 0.2, 0.4],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full"
            >
              <Zap className="w-8 h-8 text-black" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Join ElectroAuth
          </h1>
          <p className="text-gray-400">Create your digital identity</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <motion.div
                  animate={{
                    backgroundColor: step >= stepNum ? "#10b981" : "#374151",
                    scale: step === stepNum ? 1.2 : 1,
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                >
                  {step > stepNum ? <Check className="w-4 h-4" /> : stepNum}
                </motion.div>
                {stepNum < 3 && (
                  <motion.div
                    animate={{ backgroundColor: step > stepNum ? "#10b981" : "#374151" }}
                    className="w-12 h-1 mx-2"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Role */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Role</h2>
                <div className="space-y-4">
                  {[
                    { type: "organization", icon: Building, title: "Organization Admin", desc: "Create and manage your organization", color: "green" },
                    { type: "user", icon: User, title: "Team Member", desc: "Join an existing organization", color: "cyan" }
                  ].map(({ type, icon: Icon, title, desc, color }) => (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.02, backgroundColor: `rgba(${color === 'green' ? '16, 185, 129' : '6, 182, 212'}, 0.1)` }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUserType(type)}
                      className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
                        userType === type
                          ? `border-${color}-400 bg-${color}-400/10`
                          : `border-gray-600 hover:border-${color}-400/50`
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Icon className={`w-8 h-8 text-${color}-400`} />
                        <div className="text-left">
                          <h3 className="text-white font-bold">{title}</h3>
                          <p className="text-gray-400 text-sm">{desc}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  disabled={!userType}
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-3 px-6 rounded-xl hover:from-cyan-400 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Personal Information</h2>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  >
                    {errors.general}
                  </motion.div>
                )}
                <div className="space-y-4">
                  {[
                    { name: "name", type: "text", icon: User, placeholder: "Enter your full name", label: "Full Name *" },
                    { name: "email", type: "email", icon: Mail, placeholder: "Enter your email address", label: "Email Address *" },
                    { name: "password", type: showPassword ? "text" : "password", icon: Lock, placeholder: "Create a secure password", label: "Password *", hasToggle: true }
                  ].map(({ name, type, icon: Icon, placeholder, label, hasToggle }) => (
                    <div key={name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleInputChange}
                          className={`w-full pl-10 ${hasToggle ? 'pr-12' : 'pr-4'} py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                            errors[name] ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                          }`}
                          placeholder={placeholder}
                          required
                        />
                        {hasToggle && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-cyan-400 transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        )}
                      </div>
                      {errors[name] && <p className="text-red-400 text-xs">{errors[name]}</p>}
                    </div>
                  ))}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-300"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={nextStep}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 text-black font-bold py-3 px-6 rounded-xl hover:from-cyan-400 hover:to-green-400 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Next <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Organization/User Specific Info */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {userType === "organization" ? "Organization Details" : "Join Organization"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {userType === "organization" ? (
                    <>
                      {/* Organization Name */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Organization Name *</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <motion.input
                            whileFocus={{ scale: 1.02 }}
                            type="text"
                            name="organizationName"
                            value={formData.organizationName}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                              errors.organizationName ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                            }`}
                            placeholder="Enter organization name"
                            required
                          />
                        </div>
                        {errors.organizationName && <p className="text-red-400 text-xs">{errors.organizationName}</p>}
                      </div>

                      {/* Address Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Address Information</h3>
                        
                        {/* Street Address */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">Street Address *</label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <motion.input
                              whileFocus={{ scale: 1.02 }}
                              type="text"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleInputChange}
                              className={`w-full pl-10 pr-4 py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                errors.street ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                              }`}
                              placeholder="123 Main St"
                              required
                            />
                          </div>
                          {errors.street && <p className="text-red-400 text-xs">{errors.street}</p>}
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: "address.city", placeholder: "Metro", label: "City *", error: "city" },
                            { name: "address.state", placeholder: "MH", label: "State *", error: "state" }
                          ].map(({ name, placeholder, label, error }) => (
                            <div key={name} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-300">{label}</label>
                              <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="text"
                                name={name}
                                value={name === "address.city" ? formData.address.city : formData.address.state}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                  errors[error] ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                                }`}
                                placeholder={placeholder}
                                required
                              />
                              {errors[error] && <p className="text-red-400 text-xs">{errors[error]}</p>}
                            </div>
                          ))}
                        </div>

                        {/* Zip & Country */}
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: "address.zipCode", placeholder: "123456", label: "Zip Code *", error: "zipCode" },
                            { name: "address.country", placeholder: "India", label: "Country *", error: "country" }
                          ].map(({ name, placeholder, label, error }) => (
                            <div key={name} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-300">{label}</label>
                              <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="text"
                                name={name}
                                value={name === "address.zipCode" ? formData.address.zipCode : formData.address.country}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                  errors[error] ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                                }`}
                                placeholder={placeholder}
                                required
                              />
                              {errors[error] && <p className="text-red-400 text-xs">{errors[error]}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Location Coordinates */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Location Coordinates</h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={geocodeAddress}
                            disabled={isGeocodingLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:from-blue-400 hover:to-purple-400 transition-all duration-300 disabled:opacity-50"
                          >
                            {isGeocodingLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Navigation className="w-4 h-4" />
                            )}
                            {isGeocodingLoading ? "Finding..." : "Get Coordinates"}
                          </motion.button>
                        </div>

                        {/* Geocoding Status Messages */}
                        {errors.geocoding && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                          >
                            {errors.geocoding}
                          </motion.div>
                        )}
                        
                        {errors.success && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
                          >
                            {errors.success}
                          </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { name: "location.latitude", placeholder: "19.1825", label: "Latitude *", error: "latitude" },
                            { name: "location.longitude", placeholder: "72.8402", label: "Longitude *", error: "longitude" }
                          ].map(({ name, placeholder, label, error }) => (
                            <div key={name} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-300">{label}</label>
                              <motion.input
                                whileFocus={{ scale: 1.02 }}
                                type="number"
                                step="any"
                                name={name}
                                value={name === "location.latitude" ? formData.location.latitude : formData.location.longitude}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                                  errors[error] ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                                }`}
                                placeholder={placeholder}
                                required
                              />
                              {errors[error] && <p className="text-red-400 text-xs">{errors[error]}</p>}
                            </div>
                          ))}
                        </div>
                        <p className="text-gray-500 text-xs">
                          Coordinates will be automatically filled when you complete the address. You can also enter them manually or click "Get Coordinates" to find them.
                        </p>
                      </div>
                    </>
                  ) : (
                    /* User Registration - Organization Code */
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">Organization Code *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <motion.input
                          whileFocus={{ scale: 1.02 }}
                          type="text"
                          name="organizationCode"
                          value={formData.organizationCode}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 bg-black/50 border rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 ${
                            errors.organizationCode ? 'border-red-500 focus:border-red-400' : 'border-gray-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                          }`}
                          placeholder="Enter organization code"
                          required
                        />
                      </div>
                      {errors.organizationCode && <p className="text-red-400 text-xs">{errors.organizationCode}</p>}
                      <p className="text-gray-500 text-xs">Enter your organization's unique code to join</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={prevStep}
                      className="flex-1 bg-gray-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-600 transition-all duration-300"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          Create Account
                          <Check className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <motion.button
                whileHover={{ scale: 1.05, color: "#22d3ee" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login")}
                className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
              >
                Login
              </motion.button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
