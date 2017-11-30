const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const { passport, jwtOptions } = require('./../jwt-config');

const walletController = require('./../controllers/WalletController');
const userController = require('./../controllers/UserController');

router.post('/user/login', (req, res, next) => {
    const synCoinService = req.synCoinService;
    const email = req.body.email;
    const password = req.body.password;
    walletController.findByEmail(email)
        .then(wallet => {
            if (synCoinService.verifyPassword(wallet.encryptedAccount, password)) {
                const payload = { email: email };
                const token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({ token: token });
            } else {
                res.status(400).send({ error: 'Incorrect password' });
            }
        })
        .catch(error => res.status(500).send(error));
});

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

    userController
        .create(
            user.email,
            user.name,
            user.lastname,
            user.phone,
            user.company,
            user.address)
        .then(
            walletController
                .create(user.email, user.password)
                .then(res.sendStatus(200))
                .catch(() => {
                        userController.remove(user.email);
                        res.sendStatus(500)
                    }
                )
        )
        .catch(error => res.sendStatus(500));
});


module.exports = router;