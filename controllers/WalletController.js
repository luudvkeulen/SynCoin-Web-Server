const syncoinService = require("../services/SynCoinService");

exports.createWallet = function (req, res) {
    return res.status(200).send("wallet enzo");
};

exports.getTransactions = function (req, res) {
    syncoinService.getTransactions(req.query.walletAddress, req.query.encryptedAccount, req.query.password).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.getBalance = function (req, res) {
    syncoinService.getBalance(req.query.address).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.sendTransaction = function (req, res) {
    syncoinService.sendTransaction(req.query.walletAddress, req.query.encryptedAccount, req.query.password, req.query.toAddress, req.query.amount).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.createOrder = function (req, res) {
    syncoinService.createOrder(req.query.orderAddress, req.query.encryptedAccount, req.query.password, req.query.amount, req.query.reference).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.cancelOrder = function (req, res) {
    syncoinService.cancelOrder(req.query.orderAddress, req.query.encryptedAccount, req.query.password, req.query.reference).then(value => {
        return res.status(200).send(value);
    }, error => {
        return res.status(500).send(error);
    });
};

exports.confirmOrder = function (req, res) {

};

exports.drainOrder = function (req, res) {

};
