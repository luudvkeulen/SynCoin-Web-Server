const Wallet = require('./../schemas/wallet');
const syncoinService = require("../services/SynCoinService");

exports.createWallet = function (req, res) {
    syncoinService.createWallet(req.query.password).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.verifyPassword = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        return res.status(200).send(syncoinService.verifyPassword(req.query.encryptedAccount, req.query.password));
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.getBalance = function (req, res) {
    syncoinService.getBalance(req.query.address).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.walletTransactions = function (req, res) {
    syncoinService.getWalletTransactions(req.query.address).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.sendTransaction = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        syncoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, syncoinService.sendTransactionRequest(req.query.walletAddress, req.query.encryptedAccount, req.query.password, req.query.transactionRequest)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
        
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.createOrder = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        syncoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, syncoinService.getOrderRequest(req.query.reference, req.query.amount)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });    
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.cancelOrder = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        syncoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, syncoinService.getCancelRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.confirmReceived = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        syncoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, syncoinService.getConfirmReceivedRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.confirmDelivering = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        syncoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, syncoinService.getConfirmDeliveringRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

exports.drainOrder = function (req, res) {
    getEncryptedAccount(req.query.email).then((encryptedAccount) => {
        syncoinService.sendTransaction(req.query.walletAddress, encryptedAccount, req.query.password, syncoinService.getDrainRequest(req.query.reference)).then(value => {
            return res.status(200).send(value);
        }, error => {
            return res.status(500).send(error);
        });
    }).catch((reject) => { return res.status(500).send(reject) });
};

getEncryptedAccount = function (email) {
    return new Promise((resolve, reject) => {
        Wallet.findOne({ email: email }, (err, wallet) => {
            if (err) reject(err);
            resolve(wallet.encryptedAccount);
        });
    });
}