const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const walletRouter = require('./wallet');

router.use(userRouter);
router.use(walletRouter);

module.exports = router;