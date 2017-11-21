const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    encryptedAccount: {
        version: Number,
        id: String,
        address: String,
        crypto: {
            ciphertext: String,
            cipherparams: {
                iv: String
            },
            cipher: String,
            kdf: String,
            kdfparams: {
                dklen: Number,
                salt: String,
                n: Number,
                r: Number,
                p: Number
            },
            mac: String
        }
    }
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;