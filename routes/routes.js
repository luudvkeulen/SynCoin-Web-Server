const express = require('express');
const router = express.Router();
const User = require('./../models/user');

const jwt = require('jsonwebtoken');
const {passport, jwtOptions} = require('./../jwt-config');

const walletController = require('./../controllers/WalletController');
const userController = require('./../controllers/UserController');

router.post('/login', (req, res, next) => {
    console.log('next', next);
    const synCoinService = req.synCoinService;
    const email = req.body.email;
    const password = req.body.password;
    walletController.findByEmail(email)
        .then(wallet => {
            if (synCoinService.verifyPassword(wallet.encryptedAccount, password)) {
                const payload = {email: email};
                const token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({token: token});
            } else {
                res.status(400).send({error: 'Incorrect password'});
            }
        })
        .catch(error => res.status(500).send(error));
});

router.get('/jwtTest', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({message: 'Success! You can not see this without a token'});
});

router.post('/register', (req, res) => {
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

    let usererr = userController.create(
        user.email,
        user.name,
        user.lastname,
        user.phone,
        user.company,
        user.company);

    if (usererr) {
        return res.sendStatus(500);
    }

    walleterr = walletController.create(user.email, user.password);

    if(walleterr) {
        userController.remove(user.email);
        return res.sendStatus(500);
    }

    return res.sendStatus(200);
});

module.exports = router;