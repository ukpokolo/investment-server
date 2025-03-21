// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load default .env file first
require('dotenv').config();

// Then try to load environment-specific config
if (process.env.NODE_ENV) {
  require('dotenv').config({
    path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`),
    override: true
  });
} else {
  console.log('NODE_ENV not set, using default .env file');
}

console.log('Using environment:', process.env.NODE_ENV);
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL.replace(/\/$/, '') || '*', // Remove trailing slash if present  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'investment-token']
}));

app.use(express.json());

// Database connection with retry logic
const connectDB = async () => {
  try {
    // Make sure process.env.MONGODB_URI is defined
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Retry logic
    setTimeout(connectDB, 5000);
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wallets', require('./routes/wallets'));
app.use('/api/transactions', require('./routes/transactions'));

// Basic route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Investment API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV
  });
});

// Handle preflight requests
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});