const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
    email: String,
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