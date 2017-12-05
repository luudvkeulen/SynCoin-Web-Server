const express = require('express');
const router = express.Router();

const { passport, jwtOptions } = require('./../jwt-config');

const userController = require('../controllers/UserController');

router.post('/user/login', userController.login);

router.get('/jwtTest', passport.authenticate('jwt', { session: false }), userController.jwtTest);

router.post('/user/register', userController.register);

module.exports = router;