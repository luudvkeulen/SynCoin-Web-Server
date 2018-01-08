const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const {passport, jwtOptions} = require('./../jwt-config');

const ShopController = require('./../controllers/ShopController');

router.post('/shop/order', passport.authenticate('jwt', {session: false}), ShopController.createOrder);

router.post('/shop/confirm-delivering', passport.authenticate('jwt', {session: false}), ShopController.confirmDelivering);

router.post('/shop/confirm-received', passport.authenticate('jwt', {session: false}), ShopController.confirmReceived);

router.get('/shop/orders', passport.authenticate('jwt', {session: false}), ShopController.getAllOrders);

router.get('/shop/userorders', passport.authenticate('jwt', {session: false}), ShopController.getUserOrders);

router.get('/shop/order/:reference', passport.authenticate('jwt', {session: false}), ShopController.getOrder);

module.exports = router;