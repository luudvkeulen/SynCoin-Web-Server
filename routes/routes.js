const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const walletRouter = require('./wallet');

router.use(walletRouter);
router.use(userRouter);

module.exports = router;