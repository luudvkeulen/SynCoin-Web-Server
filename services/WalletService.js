const Wallet = require('./../schemas/wallet');

exports.getEncryptedAccountByEmail = function (email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ email: email }, (err, wallet) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(wallet.encryptedAccount);
        });
    });
}

exports.getWalletByEmail=  function (email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ email: email }, (err, wallet) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(wallet);
        });
    });
}