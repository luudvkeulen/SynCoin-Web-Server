var express = require('express');
var router = express.Router();

var walletController = require('../controllers/walletController');

router.post('/create', walletController.createWallet);

router.post('/tx', walletController.sendTransaction);

router.get('/tx', walletController.getTransactions);

router.get('/balance', walletController.getBalance);

module.exports = router;