var express = require('express');
var router = express.Router();

const { passport, jwtOptions } = require('./../jwt-config');

var walletController = require('../controllers/WalletController');

router.post('/tx',  passport.authenticate('jwt', { session: false }), walletController.sendTransaction);

router.get('/tx', passport.authenticate('jwt', { session: false }), walletController.walletTransactions);

router.get('/balance', passport.authenticate('jwt', { session: false }), walletController.getBalance);

router.get('/verifypassword', passport.authenticate('jwt', { session: false }), walletController.verifyPassword);

module.exports = router;