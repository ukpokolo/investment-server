const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', walletController.createWallet);
router.get('/', walletController.getUserWallets);

module.exports = router; 