const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const walletRouter = require('./wallet');
const shopRouter = require('./shop');

router.use(walletRouter);
router.use(userRouter);
router.use(shopRouter);

module.exports = router;