const Web3 = require("web3");

function SynCoinApi(web3Address, orderContractAddress) {
    this.web3 = new Web3(web3Address);
    this.orderContractAddress = orderContractAddress;

    this.orderContractAbi = "";
    this.walletContractAbi = "";
}

function decryptAccount(web3, encryptedAccount, password) {
    return web3.eth.accounts.decrypt(encryptedAccount, password);
}

SynCoinApi.prototype.createWallet = function(password) {
    // TODO: Enforce password requirements?

    console.info("Generating encrypted wallet...");

    var encryptedAccount = this.web3.eth.accounts.create().encrypt(password);
    console.info("Account: ");
    console.info(encryptedAccount);

    return encryptedAccount;
};

//console.log(decryptAccount(this.web3, encryptedAccount, password));

module.exports = SynCoinApi;
