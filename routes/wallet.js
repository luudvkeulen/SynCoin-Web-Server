const express = require('express');
const router = express.Router();
const walletController = require('../controllers/WalletController');

router.post('/create', walletController.createWallet);

router.post('/tx', walletController.sendTransaction);

router.get('/tx', walletController.getTransactions);

router.get('/wallet/balance', walletController.getBalance);

module.exports = router;