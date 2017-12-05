const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const shopRouter = require('./shop');
const walletRouter = require('./wallet');

router.use(userRouter);
router.use(shopRouter);
router.use(walletRouter);

module.exports = router;