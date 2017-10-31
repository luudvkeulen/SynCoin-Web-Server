const Web3 = require("web3");

var address = "0x30d93b122444912bea9a16da3bbec6e89686f24f";

const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

web3.eth.getBalance(address)
    .then(function (balance) {
        console.log("Balance: " + balance);
    })
    .catch(console.error);
