const Web3 = require("web3");

const shopContractAbi = [{"constant":true,"inputs":[],"name":"active","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_reference","type":"string"}],"name":"cancel","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"toggleActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"orderLifetime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_reference","type":"string"}],"name":"confirmDelivering","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"drain","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_reference","type":"string"}],"name":"confirmReceived","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_reference","type":"string"}],"name":"order","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"_orderLifetime","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_reference","type":"string"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"OrderCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_reference","type":"string"}],"name":"OrderConfirmedDelivering","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_reference","type":"string"}],"name":"OrderConfirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_reference","type":"string"}],"name":"OrderCanceled","type":"event"}];
const shopContractAddress = "0xF9efE38267041Fd5d13Bc0ACE74152D8A28dB578";
const walletContractAbi = [{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"},{"name":"data","type":"bytes"}],"name":"send","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"TransactionReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"TransactionSent","type":"event"}];
const walletContractData = "0x60606040526040516020806102e283398101604052808051906020019091905050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050610272806100706000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680639bd9bbc6146100b8575b60003411156100b6577fea8894086f544a14fafefe000f478d734be3087de78435eb799669d5191a3acd3334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b005b34156100c357600080fd5b61010c600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919080359060200190919080359060200190820180359060200191909192905050610126565b604051808215151515815260200191505060405180910390f35b6000806000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561018457600080fd5b8573ffffffffffffffffffffffffffffffffffffffff168585856040518083838082843782019150509250505060006040518083038185876187965a03f1925050509050801561023a577f4970bf8595442008a41b189fc026906b953e2a419e3029e6d0d6ce02a33ba85d8686604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b809150509493505050505600a165627a7a723058206fca565b2fb7a33bc99a4537a3833604455265c8c16fe1131780799a0c468c910029";
const web3Address = "ws://localhost:8546";

/**
 * @param web3 Web3
 * @param account object
 * @param password string
 * @return string Address to send transactions with.
 */
function addAccountToInMemoryWallet(web3, account, password) {
    // Decrypt encrypted account first
    if (!account.privateKey) {
        account = web3.eth.accounts.decrypt(account, password);
    }

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
        gas: 1000000,
        gasPrice: 100000,
        data: walletContractData
    });
}

/**
 * Ayy, see getWalletContract and replace wallet with shop.
 * @return Contract
 */
function getShopContract(web3, fromAddress) {
    return new web3.eth.Contract(shopContractAbi, shopContractAddress, {
        from: fromAddress,
        gas: 1000000,
        gasPrice: 100000,
    });
}

class SynCoinService {
    /**
     * @param walletCreationAccount {{address: string, privateKey: string}} Unencrypted account with funds to be used for customer wallet creation.
     */
    constructor(walletCreationAccount) {
        this.web3 = new Web3(web3Address);
        this.walletCreationAccount = walletCreationAccount;
    }

    /**
     * Creates an account (public-key pair) and a wallet contract owned by that account.
     * Funds the account with some dough to perform transactions.
     *
     * @param password string
     * @returns Promise|{{encryptedAccount: object, walletContract: object}}
     */
    createWallet(password) {
        // Create account to own the wallet
        console.info("Generating account...");
        let encryptedAccount = this.web3.eth.accounts.create().encrypt(password);
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let walletCreationAddress = addAccountToInMemoryWallet(this.web3, this.walletCreationAccount);

        return new Promise((resolve, reject) => {
            console.info("Funding account with some dough...");
            this.web3.eth.sendTransaction({
                from: walletCreationAddress,
                to: accountAddress,
                value: this.web3.utils.toWei("1", "ether"),
                gas: 1000000,
                gasPrice: 100000
            })
                .then(() => {
                    console.info("Deploying wallet contract...");
                    // Create and deploy contract from the wallet creation account
                    let walletContract = getWalletContract(this.web3, null, walletCreationAddress);
                    walletContract
                        .deploy({
                            arguments: [walletCreationAddress]
                        })
                        .send()
                        .then((receipt) => {
                            // After the contract is mined, return with an account and contract called from that account
                            walletContract.options.address = receipt.contractAddress;
                            walletContract.options.from = encryptedAccount.address;

                            resolve({
                                encryptedAccount: encryptedAccount,
                                walletContract: walletContract
                            });
                        })
                        .catch(reject);
                })
                .catch(reject);
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

    /**
     * @param walletAddress string
     * @param encryptedAccount object Owner of the wallet.
     * @param password string
     * @param toAddress string
     * @param amount Number
     * @param data string
     * @returns {Promise} Resolves when the tx is broadcasted to blockchain.
     */
    sendTransaction(walletAddress, encryptedAccount, password, toAddress, amount, data) {
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let walletContract = getWalletContract(this.web3, walletAddress, accountAddress);

        if (!data) {
            data = "0x";
        }

        let sendMethod = walletContract.methods.send(toAddress, amount, data);

        return new Promise((resolve, reject) => {
            // TODO: Remove if call can successfully decode result
            let result = true;
            // sendMethod.call().then((result) => {
                if (result) {
                    sendMethod.send()
                        .then((receipt) => {
                            console.log("Receipt: ", receipt);
                            resolve(receipt.transactionHash);
                        })
                        .catch(reject);
                } else {
                    reject(new Error("Could not send transaction (simulated call returned false)."));
                }
            // })
        });
    }

    /**
     * @param walletAddress string
     * @param encryptedAccount object
     * @param password string
     * @returns {Promise} Resolves when events are received.
     */
    getTransactions(walletAddress, encryptedAccount, password){
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let walletContract = getWalletContract(this.web3, walletAddress, accountAddress);

        return new Promise((resolve, reject) => {
            walletContract.getPastEvents('allEvents', {fromBlock: 0, toBlock: 'latest'})
            .then(events => {
                console.log(events);
                resolve(events);
            }, error => {
                reject(error);
            });
        });
    }

    /**
     * @param address string
     * @returns {Promise} Resolves when the balance is received.
     */
    getBalance(address) {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(address)
                .then(balance => {
                    resolve(balance);
                })
                .catch(reject);
        });
    }

    /**
     * @param walletAddress
     * @param encryptedAccount object
     * @param password string
     * @param amount Number
     * @param reference string
     * @returns {Promise} Resolves when the order is successfully created.
     */
    createOrder(walletAddress, encryptedAccount, password, amount, reference) {
        let shopContract = getShopContract(this.web3, walletAddress);
        let orderMethod = shopContract.methods.order(reference);

        return new Promise((resolve, reject) => {
            // TODO: Remove if call can successfully decode result
            let result = true;
            // orderMethod.call({value: amount}).then((result) => {

                if (result) {
                    console.info("Creating order...");

                    resolve(this.sendTransaction(walletAddress, encryptedAccount, password, shopContract.address, amount, orderMethod.encodeABI()));
                } else {
                    reject(new Error("Could not create order (simulated call returned false)."));
                }
            // });
        });
    }

    cancelOrder(encryptedAccount, password, reference) {
        let accountAddress = addAccountToInMemoryWallet(this.web3, encryptedAccount, password);
        let orderContract = getShopContract(this.web3, accountAddress);

        // TODO: Send from wallet instead of account
        return new Promise((resolve, reject) => {
            let method = orderContract.methods.cancel(reference);

            // TODO: Remove if call can successfully decode result
            let result = true;
            // method.call().then((result) => {
                if (result) {
                    console.info("Cancelling order...");
                    method.send()
                        .then((receipt) => {
                            if (receipt.events.OrderCanceled) {
                                resolve();
                            } else {
                                reject(new Error("Transaction was executed, but order was not canceled."));
                            }
                        })
                        .catch(reject);
                } else {
                    reject("Order can not be canceled (simulated call returned false).");
                }
            // });
        });
    }
}

module.exports = SynCoinService;
