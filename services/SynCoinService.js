const Web3 = require("web3");

const orderContractAbi = [{ "constant": true, "inputs": [], "name": "active", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_reference", "type": "string" }], "name": "cancel", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "beerPrice", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "toggleActive", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "orderLifetime", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "drain", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_reference", "type": "string" }], "name": "confirm", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_reference", "type": "string" }], "name": "order", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "inputs": [{ "name": "_beerPrice", "type": "uint256" }, { "name": "_orderLifetime", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_reference", "type": "string" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "OrderCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_reference", "type": "string" }], "name": "OrderConfirmed", "type": "event" }];
const orderContractAddress = "0x345b63fcaa8fe182ad94564985edc0235eec0ac4";
const walletContractAbi = [{ "constant": false, "inputs": [{ "name": "receiver", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "send", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "payable": true, "stateMutability": "payable", "type": "constructor" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "sender", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TransactionReceived", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "receiver", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }], "name": "TransactionSent", "type": "event" }];
const walletContractData = "0x6060604052336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610230806100536000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063d0679d34146100b8575b60003411156100b6577fea8894086f544a14fafefe000f478d734be3087de78435eb799669d5191a3acd3334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b005b34156100c357600080fd5b6100f8600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919080359060200190919050506100fa565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561015557600080fd5b8173ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050151561019557600080fd5b7f4970bf8595442008a41b189fc026906b953e2a419e3029e6d0d6ce02a33ba85d8282604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a150505600a165627a7a72305820d14c580b2a20e3b69c7a01dd44a6ac9bff2a789017d2b3e3beec0b837af2bdc50029";
const web3Address = "ws://localhost:8546";

/**
 * @param web3 Web3
 * @param encryptedAccount object
 * @param password string
 * @return string Address to send transactions with.
 */
function addAccountToInMemoryWallet(web3, encryptedAccount, password) {
    let account = web3.eth.accounts.decrypt(encryptedAccount, password);
    web3.eth.accounts.wallet.add(account);

    return account.address;
}

/**
 * Returns a wallet contract with defaults set so functions can be called without specifying any options.
 *
 * @param web3 Web3
 * @param walletAddress string Address of the contract.
 * @param fromAddress string Address used by default to call the contract from. Make sure it is added to in-memory wallet before calling anything.
 * @return Contract
 */
function getWalletContract(web3, walletAddress, fromAddress) {
    return new web3.eth.Contract(walletContractAbi, walletAddress, {
        from: fromAddress,
        gas: 200000,
        gasPrice: 0,
        data: walletContractData
    });
}

/**
 * Ayy, see getWalletContract and replace wallet with order.
 * @return Contract
 */
function getOrderContract(web3, orderAddress, fromAddress) {
    return new web3.eth.Contract(orderContractAbi, orderAddress, {
        from: fromAddress,
        gas: 200000,
        gasPrice: 0,
    });
}

class SynCoinService {
    constructor() {
        this.web3 = new Web3(web3Address);
    }

    /**
     * Creates an account (public-key pair) and a wallet contract from that account.
     *
     * @param password string
     * @returns Promise|{{encryptedAccount: object, walletContract: object}}
     */
    createWallet(password) {
        // Create account
        let encryptedAccount = this.web3.eth.accounts.create().encrypt(password);
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);

        // Create and deploy contract from created account
        let walletContract = getWalletContract(this.web3, null, accountAddress);

        return new Promise((resolve) => {
            walletContract
                .deploy()
                .send()
                // Wait till the contract was mined in a block before returning
                .then((receipt) => {
                    walletContract.options.address = receipt.contractAddress;

                    resolve({
                        encryptedAccount: encryptedAccount,
                        walletContract: walletContract
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

    sendTransaction(walletAddress, encryptedAccount, password, toAddress, amount) {
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let walletContract = getWalletContract(this.web3, walletAddress, accountAddress);

        return new Promise((resolve, reject) => {
            walletContract.methods.send(toAddress, amount).send()
                .on('receipt', (receipt) => {
                    resolve({transactionHash: receipt.transactionHash});
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    getTransactions(walletAddress, encryptedAccount, password){
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let walletContract = getWalletContract(this.web3, walletAddress, accountAddress);

        return new Promise((resolve, reject) => {
            walletContract.getPastEvents('allEvents', {fromBlock: 0, toBlock: 'latest'})
            .then(events => {
                resolve(events);
            });
        });
        
    }

    /**
     * @param orderAddress string
     * @param encryptedAccount object
     * @param password string
     * @param amount Number
     * @param reference string
     * @returns {Promise} Resolves when the order is successfully created.
     */
    createOrder(orderAddress, encryptedAccount, password, amount, reference) {
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let orderContract = getOrderContract(this.web3, orderAddress, accountAddress);

        // TODO: Send from wallet instead of account

        return new Promise((resolve, reject) => {
            orderContract.methods.order(reference)
                .send({value: amount})
                .then((receipt) => {
                    // TODO: Check if true was returned instead of event
                    if (receipt.events.OrderCreated) {
                        resolve();
                    } else {
                        reject(new Error("Transaction was executed, but order was not created."));
                    }
                });
        });
    }

    cancelOrder(orderAddress, encryptedAccount, password, reference) {
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let orderContract = getOrderContract(this.web3, orderAddress, accountAddress);

        // TODO: Send from wallet instead of account
        return new Promise((resolve, reject) => {
            orderContract.methods.cancel(reference)
                .send()
                .then((receipt) => {
                    // TODO: Check if true was returned instead of event
                    if (receipt.events.OrderCanceled) {
                        resolve();
                    } else {
                        reject(new Error("Transaction was executed, but order was not canceled."));
                    }
                });
        });
    }
}

module.exports = SynCoinService;
