const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const shopRouter = require('./shop');

router.use(userRouter);
router.use(shopRouter);

module.exports = router;