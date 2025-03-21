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

// Get wallet details
exports.getWalletDetails = async (req, res) => {
  try {
    const { walletId } = req.params;
    const wallet = await Wallet.findOne({ _id: walletId, user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet details',
      error: err.message
    });
  }
};

// Update user wallet
exports.updateUserWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { name, cryptoType } = req.body;

    const wallet = await Wallet.findOneAndUpdate(
      { _id: walletId, user: req.user.id },
      { name, cryptoType },
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating wallet',
      error: err.message
    });
  }
};

// Delete user wallet
exports.deleteUserWallet = async (req, res) => {
  try {
    const { walletId } = req.params;

    const wallet = await Wallet.findOneAndDelete({ _id: walletId, user: req.user.id });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    res.json({
      success: true,
      message: 'Wallet deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting wallet',
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

// Update system wallet (admin only)
exports.updateSystemWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const { cryptoType, address } = req.body;

    const wallet = await Wallet.findOneAndUpdate(
      { _id: walletId, user: null },
      { cryptoType, address },
      { new: true }
    );

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'System wallet not found'
      });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating system wallet',
      error: err.message
    });
  }
};

// Delete system wallet (admin only)
exports.deleteSystemWallet = async (req, res) => {
  try {
    const { walletId } = req.params;

    const wallet = await Wallet.findOneAndDelete({ _id: walletId, user: null });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'System wallet not found'
      });
    }

    res.json({
      success: true,
      message: 'System wallet deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting system wallet',
      error: err.message
    });
  }
};