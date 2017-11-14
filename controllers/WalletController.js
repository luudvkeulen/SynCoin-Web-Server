const Wallet = require('./../models/wallet');

function findByEmail(email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ 'email': email }, function (error, result) {
            if (error) {
                reject(error);
                return;
            }
            resolve(result);
        });
    });
}

module.exports = {
    findByEmail: findByEmail
}