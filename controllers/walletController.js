const Web3 = require("web3");
const web3 = new Web3("ws://localhost:8546");

exports.createWallet = function (req, res) {
    return res.status(200).send("wallet enzo");
};

exports.getTransactions = function (req, res) {
    
};

exports.getBalance = function (req, res) {
    
};

exports.sendTransaction = function (req, res) {
    
};

exports.createOrder = function (req, res) {
    
};

exports.cancelOrder = function (req, res) {
    
};

exports.confirmOrder = function (req, res) {
    
};

exports.drainOrder = function (req, res) {
    
};