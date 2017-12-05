const express = require('express');
const router = express.Router();
const walletController = require('../controllers/WalletController');

const jwt = require('jsonwebtoken');
const {passport} = require('./../jwt-config');

const prefix = '/wallet';

router.post(prefix + '/create', walletController.createWallet);

router.post(prefix + '/tx', walletController.sendTransaction);

router.get(prefix + '/tx', walletController.getTransactions);

router.get(prefix + '/balance', passport.authenticate('jwt', {session: false}), walletController.getBalance);

router.post('/tx',  passport.authenticate('jwt', { session: false }), walletController.sendTransaction);

router.get('/tx', passport.authenticate('jwt', { session: false }), walletController.walletTransactions);

router.get('/balance', passport.authenticate('jwt', { session: false }), walletController.getBalance);

router.get('/verifypassword', passport.authenticate('jwt', { session: false }), walletController.verifyPassword);

module.exports = router;