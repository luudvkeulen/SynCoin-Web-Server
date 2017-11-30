const Wallet = require('./../schemas/wallet');

function findByEmail(email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ 'email': email }, function (error, result) {
            if (error) {
                reject({ message: 'Error getting wallet from database.' });
                return;
            }
            if (!result) {
                reject({ message: 'No wallet found with the given e-mail address.' });
                return;
            }
            resolve(result);
        });
    });
}

function create(email, password) {
    //TODO: call web3js method for generating wallet here
    let newWallet = Wallet({
        email: email,
        encryptedAccount: null
    });

    return new Promise((resolve, reject) => {
        newWallet.save((err) => {
            err ? reject(err) : resolve();
        });
    });
}

module.exports = {
    findByEmail,
    create
};