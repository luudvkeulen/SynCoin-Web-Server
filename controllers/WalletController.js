const Wallet = require('./../schemas/wallet');
const syncoinService = require("../services/SynCoinService");

exports.verifyPassword = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        return res.status(200).send(req.synCoinService.verifyPassword(encryptedAccount, req.query.password));
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.getBalance = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.getBalance(encryptedAccount.address).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.walletTransactions = function (req, res) {
    req.synCoinService.getWalletTransactions(req.query.address).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.sendTransaction = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, req.synCoinService.sendTransactionRequest(req.query.walletAddress, req.query.encryptedAccount, req.query.password, req.query.transactionRequest)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });

    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.createOrder = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, req.synCoinService.getOrderRequest(req.query.reference, req.query.amount)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.cancelOrder = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, req.synCoinService.getCancelRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.confirmReceived = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, req.synCoinService.getConfirmReceivedRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.confirmDelivering = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, req.synCoinService.getConfirmDeliveringRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => {
        return res.status(500).send(reject)
    });
};

exports.drainOrder = function (req, res) {
    getEncryptedAccount(req.user.email).then((encryptedAccount) => {
        req.synCoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, req.synCoinService.getDrainRequest(req.query.reference)).then(value => {
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
            let newWallet = Wallet({
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

getEncryptedAccount = function (email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({email: email}, (err, wallet) => {
            if (err) reject(err);
            resolve(wallet.encryptedAccount);
        });
    });
};