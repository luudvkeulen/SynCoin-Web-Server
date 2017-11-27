const express = require('express');
const router = express.Router();

const walletRouter = require('./wallet');

router.use(walletRouter);

module.exports = router;