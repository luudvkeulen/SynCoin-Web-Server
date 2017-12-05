var express = require('express');
var router = express.Router();

var walletController = require('../controllers/WalletController');

router.post('/create', walletController.createWallet);

router.post('/tx', walletController.sendTransaction);

router.get('/tx', walletController.walletTransactions);

router.get('/balance', walletController.getBalance);

router.get('/verifypassword', walletController.verifyPassword);

module.exports = router;