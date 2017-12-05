const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { passport, jwtOptions } = require('./../jwt-config');

const ShopController = require('./../controllers/ShopController');

router.post('/shop/order', passport.authenticate('jwt', { session: false }), ShopController.createOrder);

module.exports = router;