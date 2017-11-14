const express = require('express');
const router = express.Router();

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

module.exports = router;