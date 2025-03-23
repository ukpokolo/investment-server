const Transaction = require('../models/Transaction');
const InvestmentPlan = require('../models/Investment');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Notification = require('../models/Notification');

// // Create a new investment
// exports.createInvestment = async (req, res) => {
//   try {
//     const { planId, amount, cryptoType } = req.body;

//     // Validate investment plan
//     const plan = await InvestmentPlan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({
//         success: false,
//         message: 'Investment plan not found'
//       });
//     }

//     // Validate amount
//     if (amount < plan.minimumAmount || amount > plan.maximumAmount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid investment amount'
//       });
//     }

//     // Calculate expected profit and maturity date
//     const expectedProfit = amount * (plan.interest / 100);
//     const maturityDate = new Date();
//     maturityDate.setDate(maturityDate.getDate() + plan.duration);

//     // Get system wallet for crypto type
//     const systemWallet = await Wallet.findOne({
//       cryptoType,
//       user: null // System wallet identifier
//     });

//     if (!systemWallet) {
//       return res.status(400).json({
//         success: false,
//         message: `System wallet for ${cryptoType} not found. Please contact support.`
//       });
//     }

//     const transaction = new Transaction({
//       user: req.user.id,
//       type: 'INVESTMENT',
//       amount,
//       cryptoType,
//       walletAddress: systemWallet.address,
//       investmentPlan: planId,
//       expectedProfit,
//       maturityDate
//     });

//     await transaction.save();

//     res.status(201).json({
//       success: true,
//       transaction,
//       message: 'Investment created successfully. Please transfer funds to complete.'
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: 'Error creating investment',
//       error: err.message
//     });
//   }
// };

// Create a new investment
exports.createInvestment = async (req, res) => {
  try {
    const { planId, amount, cryptoType } = req.body;

    // Validate investment plan
    const plan = await InvestmentPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Investment plan not found'
      });
    }

    // Validate amount
    if (amount < plan.minimumAmount || amount > plan.maximumAmount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment amount'
      });
    }

    // Calculate expected profit and maturity date
    const expectedProfit = amount * (plan.interest / 100);
    const maturityDate = new Date();
    maturityDate.setDate(maturityDate.getDate() + plan.duration);

    // Get system wallet for crypto type
    const systemWallet = await Wallet.findOne({
      cryptoType,
      user: null // System wallet identifier
    });

    if (!systemWallet) {
      return res.status(400).json({
        success: false,
        message: `System wallet for ${cryptoType} not found. Please contact support.`
      });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type: 'INVESTMENT',
      amount,
      cryptoType,
      walletAddress: systemWallet.address,
      investmentPlan: planId,
      expectedProfit,
      maturityDate
    });

    await transaction.save();

    // Create a notification for the admin
    const user = await User.findById(req.user.id);
    const notification = new Notification({
      title: 'New Investment Request',
      message: `${user.name} has made an investment of ${amount} ${cryptoType}.`,
      type: 'INFO',
      link: `/admin/investments/${transaction._id}`
    });

    await notification.save();

    res.status(201).json({
      success: true,
      transaction,
      message: 'Investment created successfully. Please transfer funds to complete.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating investment',
      error: err.message
    });
  }
};

// Request a withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, walletId } = req.body;

    // Validate wallet ownership
    const wallet = await Wallet.findOne({
      _id: walletId,
      user: req.user.id
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    // Validate dormant funds
    const user = await User.findById(req.user.id);
    if (amount > user.dormantFunds) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient dormant funds'
      });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type: 'WITHDRAWAL',
      amount,
      cryptoType: wallet.cryptoType,
      walletAddress: wallet.address,
      status: 'PENDING' // Set status to PENDING initially
    });

    await transaction.save();

    // Create a notification for the admin
    const notification = new Notification({
      title: 'New Withdrawal Request',
      message: `${user.name} has requested a withdrawal of ${amount} ${wallet.cryptoType}.`,
      type: 'INFO',
      link: `/admin/transactions/${transaction._id}`
    });

    await notification.save();

    res.status(201).json({
      success: true,
      transaction,
      message: 'Withdrawal request submitted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error requesting withdrawal',
      error: err.message
    });
  }
};

// Create a new withdrawal
// exports.createWithdrawal = async (req, res) => {
//   try {
//     const { amount, walletId } = req.body;
//     const userId = req.user.id;

//     // Find the user's wallet
//     const wallet = await Wallet.findById(walletId);
//     if (!wallet) {
//       return res.status(404).json({ success: false, message: 'Wallet not found' });
//     }

//     // Create a new withdrawal transaction
//     const transaction = new Transaction({
//       user: userId,
//       type: 'WITHDRAWAL',
//       amount,
//       walletAddress: wallet.address,
//       cryptoType: wallet.cryptoType,
//       status: 'PENDING'
//     });

//     await transaction.save();

//     // Create a notification for the admin
//     const user = await User.findById(userId);
//     const notification = new Notification({
//       title: 'New Withdrawal Request',
//       message: `${user.name} has requested a withdrawal of ${amount} ${wallet.cryptoType}.`,
//       type: 'INFO',
//       link: `/admin/transactions/${transaction._id}`
//     });

//     await notification.save();

//     res.status(201).json({ success: true, transaction });
//   } catch (err) {
//     res.status(500).json({ success: false, message: 'Error creating withdrawal', error: err.message });
//   }
// };

// Get user transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('investmentPlan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: err.message
    });
  }
};

// Get all transactions (admin only)
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .populate('investmentPlan')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: err.message
    });
  }
};



// // Admin approve transaction
// exports.approveTransaction = async (req, res) => {
//   try {
//     const { transactionId } = req.params;

//     const transaction = await Transaction.findById(transactionId);

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: 'Transaction not found'
//       });
//     }

//     if (transaction.status !== 'PENDING') {
//       return res.status(400).json({
//         success: false,
//         message: 'Transaction is not pending'
//       });
//     }

//     transaction.status = 'APPROVED';
//     await transaction.save();

//     // Update user's account overview
//     const user = await User.findById(transaction.user);
//     if (transaction.type === 'INVESTMENT') {
//       user.activeCapital += transaction.amount;
//       user.returnOnInvestment += transaction.expectedProfit;
//       user.tradingStatus = 'ACTIVE';
//     }
//     await user.save();

//     res.json({
//       success: true,
//       transaction,
//       message: 'Transaction approved successfully'
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: 'Error approving transaction',
//       error: err.message
//     });
//   }
// };