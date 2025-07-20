const cors = require("cors");

const corsOptions = {
  // For testing, allow all origins
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001", 
      "http://localhost:5000",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5000",
      "http://127.0.0.1:5500", // Live Server default port
      "null", // For local HTML files (file:// protocol)
      process.env.FRONTEND_URL,
    ];
    
    // For development/testing - allow all localhost and file origins
    if (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') ||
      origin === 'null' ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
  
  methods: [
    "GET", 
    "POST", 
    "PUT", 
    "PATCH",
    "DELETE", 
    "OPTIONS",
    "HEAD"
  ],
  
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  
  // Expose headers that frontend might need
  exposedHeaders: ["Set-Cookie"],
  
  // Handle preflight requests
  preflightContinue: false,
};

module.exports = cors(corsOptions);
