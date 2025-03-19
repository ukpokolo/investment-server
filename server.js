// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`)
});
const walletController = require('./controllers/walletController');

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS configuration for production
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Replace with your frontend URL in production
  credentials: true
}));

app.use(express.json());

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

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
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});