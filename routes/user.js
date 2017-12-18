const express = require('express');
const router = express.Router();

const { passport } = require('./../jwt-config');

const userController = require('../controllers/UserController');

router.post('/user/login', userController.login);

router.get('/jwtTest', passport.authenticate('jwt', { session: false }), userController.jwtTest);

router.post('/user/register', userController.register);

router.get('/user', passport.authenticate('jwt', { session: false }), userController.getUserData);

module.exports = router;