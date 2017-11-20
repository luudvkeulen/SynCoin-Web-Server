const Web3 = require("web3");

const orderContractAbi = [{ "constant": true, "inputs": [], "name": "active", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_reference", "type": "string" }], "name": "cancel", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "beerPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "toggleActive", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "orderLifetime", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "drain", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_reference", "type": "string" }], "name": "confirm", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_reference", "type": "string" }], "name": "order", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "inputs": [{ "name": "_beerPrice", "type": "uint256" }, { "name": "_orderLifetime", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_reference", "type": "string" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "OrderCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_reference", "type": "string" }], "name": "OrderConfirmed", "type": "event" }];
const orderContractAddress = "0x345b63fcaa8fe182ad94564985edc0235eec0ac4";
const walletContractAbi = [{ "constant": false, "inputs": [{ "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "send", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": true, "stateMutability": "payable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TransactionReceived", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "receiver", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TransactionSent", "type": "event" }];
const walletContractData = "0x6060604052336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610230806100536000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063d0679d34146100b8575b60003411156100b6577fea8894086f544a14fafefe000f478d734be3087de78435eb799669d5191a3acd3334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b005b34156100c357600080fd5b6100f8600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919080359060200190919050506100fa565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561015557600080fd5b8173ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050151561019557600080fd5b7f4970bf8595442008a41b189fc026906b953e2a419e3029e6d0d6ce02a33ba85d8282604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a150505600a165627a7a72305820d14c580b2a20e3b69c7a01dd44a6ac9bff2a789017d2b3e3beec0b837af2bdc50029";
const web3Address = "ws://localhost:8546";

/**
 * @param web3
 * @param encryptedAccount
 * @param password
 * @return string address to send transactions with
 */
function addAccountToInMemoryWallet(web3, encryptedAccount, password) {
    throw Error("Not implemented.");
}

class SynCoinService {
    constructor() {
        this.web3 = new Web3(web3Address);
    }

    /**
     * Creates an account (public-key pair) and a wallet from that account.
     *
     * @param password string
     * @returns Promise|{{encryptedAccount: object, walletContract: object}}
     */
    createWallet(password) {
        // TODO: Enforce password requirements here?

        // Create account
        let account = this.web3.eth.accounts.create();
        let encryptedAccount = account.encrypt(password);

        // Create and deploy contract
        let walletContract = new this.web3.eth.Contract(walletContractAbi);

        let walletCreationData = walletContract.deploy({
            data: walletContractData,
            arguments: []
        }).encodeABI();

        return new Promise((resolve, reject) => {
            // Sign contract deployment transaction with created account
            this.web3.eth.accounts.signTransaction({
                data: walletCreationData,
                gasPrice: 0,
                gas: 200000
            }, account.privateKey).then((signedTransaction) => {
                // Commit the transaction and retrieve its address
                this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                    .on("receipt", (receipt) => {
                        walletContract.options.address = receipt.contractAddress;

                        resolve({
                            encryptedAccount: encryptedAccount,
                            walletContract: walletContract
                        });
                    });
            });
        });
    }

    /**
     * Returns whether the password is valid for the given encrypted account (generated with createWallet())
     *
     * @param encryptedAccount object
     * @param password string
     */
    verifyPassword(encryptedAccount, password) {
        try {
            this.web3.eth.accounts.decrypt(encryptedAccount, password);

            return true;
        } catch (error) {
            if (error.message.toLowerCase().includes("wrong password")) {
                return false
            }

            throw error;
        }
    }

    sendTransaction(walletAddress, password, toAddress, amount) { //todo: dit
        let contract = web3.eth.contract(walletContractAbi).at(walletAddress);
        return new Promise((resolve, reject) => {
            contract.methods.send(toAddress, amount).send({ from: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe' })
                .on("receipt", (receipt) => {

                    resolve({
                        transactionHash: receipt.transactionHash
                    });
                });
        });
    }
}

module.exports = SynCoinService;
