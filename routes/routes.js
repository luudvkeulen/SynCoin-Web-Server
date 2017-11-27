const express = require('express');
const router = express.Router();
const User = require('./../models/user');

const walletRouter = require('./wallet');

router.use(walletRouter);

module.exports = router;