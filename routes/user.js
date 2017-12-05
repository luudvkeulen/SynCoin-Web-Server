const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { passport, jwtOptions } = require('./../jwt-config');

const WalletController = require('./../controllers/WalletController');
const UserController = require('./../controllers/UserController');

router.post('/user/login', UserController.login)

router.get('/jwtTest', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'Success! You can not see this without a token' });
});

router.post('/user/register', (req, res) => {
    let user = req.body;
    if (!user.email
        || !user.name
        || !user.lastname
        || !user.phone
        || !user.company
        || !user.address
        || !user.password) {
        return res.sendStatus(500);
    }

    UserController
        .create(
            user.email,
            user.name,
            user.lastname,
            user.phone,
            user.company,
            user.address)
        .then(
            WalletController
                .create(user.email, user.password)
                .then(res.sendStatus(200))
                .catch(() => {
                        UserController.remove(user.email);
                        res.sendStatus(500)
                    }
                )
        )
        .catch(error => res.sendStatus(500));
});


module.exports = router;