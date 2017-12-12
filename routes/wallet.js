const express = require('express');
const router = express.Router();
const walletController = require('../controllers/WalletController');

const jwt = require('jsonwebtoken');
const {passport} = require('./../jwt-config');

const prefix = '/wallet';

router.post(prefix + '/tx', passport.authenticate('jwt', {session: false}), walletController.sendTransaction);

router.get(prefix + '/balance', passport.authenticate('jwt', {session: false}), walletController.getBalance);

router.get(prefix + '/tx', passport.authenticate('jwt', { session: false }), walletController.walletTransactions);

router.get(prefix + '/verifypassword', passport.authenticate('jwt', { session: false }), walletController.verifyPassword);

module.exports = router;