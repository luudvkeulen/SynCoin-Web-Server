const Wallet = require('./../models/wallet');

function findByEmail(email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ 'email': email }, function (error, result) {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject({ message: 'No wallet found with the given e-mail address.' })
                return;
            }
            resolve(result);
        });
    });
}

function create(email, password) {
    //call web3js method for generating wallet
    let newWallet = Wallet({
        email: email,
        encryptedAccount: null
    });

    newWallet.save((err) => {
        return err;
    });
}

module.exports = {
    findByEmail,
    create
};