const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const Wallet = require('./../models/wallet');

router.post('/login', (req, res) => {
    // email, password --> get encrypted account --> call api endpoint with (encryptedAccount, password)
    const synCoinService = req.synCoinService;
    const emailaddress = req.body.emailaddress;
    const password = req.body.password;
    const encryptedAccount = {};
    // Wallet.findByEmailaddress().EncryptedAccount
    synCoinService.verifyPassword(encryptedAccount, password);


    res.sendStatus(200);
});

router.post('/api/user/register', (req, res) => {
    let user = req.body;
    console.log(user);

    let newUser = User({
        email: user.email,
        surname: user.surname,
        lastname: user.lastname,
        phone: user.phone,
        company: user.company,
        address: user.address
    });

    newUser.save((err) => {
        if(err) {
            res.sendStatus(500);
            throw err;
        }
        return res.sendStatus(200);
    });
});

module.exports = router;