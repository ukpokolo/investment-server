const InvestmentPlan = require('../models/Investment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

// GET all investment plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await InvestmentPlan.find();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET a specific investment plan
exports.getPlanById = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Investment plan not found' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE a new investment plan
exports.createPlan = async (req, res) => {
  try {
    const {
      name, interest, duration, durationUnit, minimumAmount,
      maximumAmount, tradingCommission, referralBonus, category, status
    } = req.body;

    if (!name || interest === undefined || !duration || !durationUnit ||
      minimumAmount === undefined || maximumAmount === undefined ||
      tradingCommission === undefined || referralBonus === undefined) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (minimumAmount > maximumAmount) {
      return res.status(400).json({ message: 'Minimum amount cannot be greater than maximum amount' });
    }

    const newPlan = new InvestmentPlan({
      name,
      interest,
      duration,
      durationUnit,
      minimumAmount,
      maximumAmount,
      tradingCommission,
      referralBonus,
      category: category || 'Standard',
      status: status || 'Active'
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An investment plan with this name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// UPDATE an investment plan
exports.updatePlan = async (req, res) => {
  try {
    const { minimumAmount, maximumAmount } = req.body;

    if (minimumAmount !== undefined && maximumAmount !== undefined &&
      minimumAmount > maximumAmount) {
      return res.status(400).json({ message: 'Minimum amount cannot be greater than maximum amount' });
    }

    const updatedPlan = await InvestmentPlan.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Investment plan not found' });
    }

    res.json(updatedPlan);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'An investment plan with this name already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE an investment plan
exports.deletePlan = async (req, res) => {
  try {
    const plan = await InvestmentPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Investment plan not found' });
    }
    res.json({ message: 'Investment plan deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveInvestment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Ensure the transaction is an investment and is pending
    if (transaction.type !== 'INVESTMENT' || transaction.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Invalid transaction' });
    }

    // Find the user
    const user = await User.findById(transaction.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update the user's active capital and return on investment
    user.activeCapital += transaction.amount;
    user.returnOnInvestment += transaction.expectedProfit || 0;
    await user.save();

    // Update the transaction status to approved
    transaction.status = 'APPROVED';
    await transaction.save();

    // Create a notification for the user
    const notification = new Notification({
      title: 'Investment Approved',
      message: `Your investment of ${transaction.amount} ${transaction.cryptoType} has been approved.`,
      type: 'SUCCESS',
      user: user._id,
      link: `/transactions/${transaction._id}`
    });

    await notification.save();

    res.status(200).json({ success: true, message: 'Investment approved and user updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error approving investment', error: err.message });
  }
};

