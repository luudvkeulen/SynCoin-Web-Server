const Wallet = require('./../schemas/wallet');
const syncoinService = require("../services/SynCoinService");
const walletService = require('../services/WalletService');

exports.verifyPassword = function (req, res) {
    find(req.user.email).then((wallet) => {
        return res.status(200).send(req.synCoinService.verifyPassword(wallet.encryptedAccount, req.query.password));
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.getBalance = function (req, res) {
    find(req.user.email).then(wallet => {
        req.synCoinService.getBalance(wallet.walletAddress).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { 
        return res.status(500).send(reject)
    });
};

exports.walletTransactions = function (req, res) {
    req.synCoinService.findTransactions(req.query.address).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.sendTransaction = function (req, res) {
    find(req.user.email).then((wallet) => {
        req.synCoinService.sendTransaction(wallet.walletAddress, wallet.encryptedAccount, req.body.password, req.body.address, req.body.amount, req.body.data).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });

    }).catch((error) => { 
        return res.status(500).send(error) 
    });
};

exports.createOrder = function (req, res) {
    find(req.user.email).then((wallet) => {
        req.synCoinService.sendTransaction(wallet.walletAddress, wallet.encryptedAccount, req.query.password, req.synCoinService.getOrderRequest(req.query.reference, req.query.amount)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.cancelOrder = function (req, res) {
    find(req.user.email).then((wallet) => {
        req.synCoinService.sendTransaction(wallet.walletAddress, wallet.encryptedAccount, req.query.password, req.synCoinService.getCancelRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.confirmReceived = function (req, res) {
    find(req.user.email).then((wallet) => {
        req.synCoinService.sendTransaction(wallet.walletAddress, wallet.encryptedAccount, req.query.password, req.synCoinService.getConfirmReceivedRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.confirmDelivering = function (req, res) {
    find(req.user.email).then((wallet) => {
        req.synCoinService.sendTransaction(wallet.walletAddress, wallet.encryptedAccount, req.query.password, req.synCoinService.getConfirmDeliveringRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.drainOrder = function (req, res) {
    find(req.user.email).then((wallet) => {
        req.synCoinService.sendTransaction(wallet.walletAddress, wallet.encryptedAccount, req.query.password, req.synCoinService.getDrainRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => {
        return res.status(500).send(reject);
    });
};

exports.createWallet = function (email, password, synCoinService) {
    return new Promise((resolve, reject) => {
        synCoinService.createWallet(password).then((result) => {
            const newWallet = new Wallet({
                email: email,
                walletAddress: result.walletAddress,
                encryptedAccount: result.encryptedAccount
            });

            newWallet.save((err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        }).catch(err => reject(err));
    });
};

exports.getWalletAddress = function (req, res) {
    find(req.user.email).then((wallet) => {
        return res.status(200).send({address: wallet.walletAddress});
    }).catch((reject) => {
        return res.status(500).send(reject);
    });
};

find = function (email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ email: email }, (err, wallet) => {
            if (err) reject(err);
            resolve(wallet);
        });
    });
}