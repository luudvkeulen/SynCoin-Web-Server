var express = require('express');
var router = express.Router();

var walletController = require('../controllers/walletController');

router.post('/create', walletController.createWallet);

module.exports = router;