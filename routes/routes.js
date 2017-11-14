const express = require('express');
const router = express.Router();

const walletController = require('./../controllers/WalletController');

router.post('/login', (req, res, next) => {
    const synCoinService = req.synCoinService;
    const email = req.body.email;
    const password = req.body.password;
    walletController.findByEmail(email)
        .then(wallet => {
            if (synCoinService.verifyPassword(wallet.encryptedAccount, password)) {
                // generate new JWT, add to document of user with given email, return JWT
            } else {
                res.status(400).send({ error: 'Incorrect password' });
            }
        })
        .catch(error => res.status(500).send(error));
});

module.exports = router;