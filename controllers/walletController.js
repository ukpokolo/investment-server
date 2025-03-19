const Wallet = require('../models/Wallet');
const crypto = require('crypto');

// Generate a mock wallet address (in production, you'd integrate with actual crypto services)
const generateWalletAddress = (cryptoType) => {
  return crypto.randomBytes(32).toString('hex');
};

exports.createWallet = async (req, res) => {
  try {
    const { name, cryptoType } = req.body;
    
    // Check if wallet with same name exists for user
    const existingWallet = await Wallet.findOne({ 
      user: req.user.id,
      name 
    });
    
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet with this name already exists'
      });
    }

    const walletAddress = generateWalletAddress(cryptoType);
    
    const wallet = new Wallet({
      user: req.user.id,
      name,
      cryptoType,
      address: walletAddress
    });

    await wallet.save();

    res.status(201).json({
      success: true,
      wallet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating wallet',
      error: err.message
    });
  }
};

exports.getUserWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ user: req.user.id });
    res.json({
      success: true,
      wallets
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallets',
      error: err.message
    });
  }
};

// Create system wallet (admin only)
exports.createSystemWallet = async (req, res) => {
  try {
    const { cryptoType, address } = req.body;

    // Validate required fields
    if (!cryptoType || !address) {
      return res.status(400).json({
        success: false,
        message: 'Both cryptoType and address are required'
      });
    }

    // Check if system wallet already exists for this crypto type
    const existingWallet = await Wallet.findOne({ 
      cryptoType,
      user: null 
    });
    
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: `System wallet for ${cryptoType} already exists`
      });
    }

    const systemWallet = new Wallet({
      user: null, // null user indicates system wallet
      name: `System ${cryptoType} Wallet`,
      cryptoType,
      address
    });
    
    await systemWallet.save();

    res.status(201).json({
      success: true,
      wallet: systemWallet,
      message: `System wallet created for ${cryptoType}`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating system wallet',
      error: err.message
    });
  }
};

// Get all system wallets (admin only)
exports.getSystemWallets = async (req, res) => {
  try {
    const systemWallets = await Wallet.find({ user: null });
    res.json({
      success: true,
      wallets: systemWallets
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system wallets',
      error: err.message
    });
  }
}; 