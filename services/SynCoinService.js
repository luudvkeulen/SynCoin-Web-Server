const Web3 = require('web3');
const TransactionRequest = require('../models/TransactionRequest');
const WalletTransaction = require('../models/WalletTransaction');
const OrderStatusUpdate = require('../models/OrderStatusUpdate');

const shopContractAbi = [{"constant":true,"inputs":[],"name":"active","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reference","type":"string"}],"name":"cancel","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"toggleActive","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"orderLifetime","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"reference","type":"string"}],"name":"confirmDelivering","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"drain","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reference","type":"string"}],"name":"confirmReceived","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"reference","type":"string"}],"name":"order","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"_owner","type":"address"},{"name":"_orderLifetime","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reference","type":"string"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"OrderCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reference","type":"string"}],"name":"OrderConfirmedDelivering","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reference","type":"string"}],"name":"OrderConfirmedReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"reference","type":"string"}],"name":"OrderCanceled","type":"event"}];
const shopContractData = "0x606060405260018060006101000a81548160ff0219169083151502179055506000600355341561002e57600080fd5b604051604080610b7a83398101604052808051906020019091908051906020019091905050816001806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550806000819055505050610acf806100ab6000396000f30060606040526004361061008e576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806302fb0c5e146100935780630b4f3f3d146100c057806329c68dc1146101065780639305dbfb14610133578063973051e71461015c5780639890220b146101a2578063e3ca9013146101cf578063f87f4a0a14610215575b600080fd5b341561009e57600080fd5b6100a6610250565b604051808215151515815260200191505060405180910390f35b34156100cb57600080fd5b6100ec60048080359060200190820180359060200191909192905050610263565b604051808215151515815260200191505060405180910390f35b341561011157600080fd5b610119610455565b604051808215151515815260200191505060405180910390f35b341561013e57600080fd5b6101466104e3565b6040518082815260200191505060405180910390f35b341561016757600080fd5b610188600480803590602001908201803590602001919091929050506104e9565b604051808215151515815260200191505060405180910390f35b34156101ad57600080fd5b6101b5610650565b604051808215151515815260200191505060405180910390f35b34156101da57600080fd5b6101fb60048080359060200190820180359060200191909192905050610716565b604051808215151515815260200191505060405180910390f35b610236600480803590602001908201803590602001919091929050506108d9565b604051808215151515815260200191505060405180910390f35b600160009054906101000a900460ff1681565b6000806002848460405180838380828437820191505092505050908152602001604051809103902090508060030160019054906101000a900460ff1680156102fa57503373ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16145b80156103235750806002015442118061032257508060030160009054906101000a900460ff16155b5b151561032e57600080fd5b60028484604051808383808284378201915050925050509081526020016040518091039020600080820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055600182016000905560028201600090556003820160006101000a81549060ff02191690556003820160016101000a81549060ff021916905550503373ffffffffffffffffffffffffffffffffffffffff166108fc82600101549081150290604051600060405180830381858888f1935050505015156103f957600080fd5b7ff5adc3e725c515c95698d481a1ad428b0305e928eb61dee6d481a6b9fa83179a8484604051808060200182810382528484828181526020019250808284378201915050935050505060405180910390a1600191505092915050565b60006001809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156104b257600080fd5b600160009054906101000a900460ff1615600160006101000a81548160ff0219169083151502179055506001905090565b60005481565b6000806002848460405180838380828437820191505092505050908152602001604051809103902090506001809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614801561057d57508060030160019054906101000a900460ff165b801561058d575080600201544211155b80156105a857508060030160009054906101000a900460ff16155b15156105b357600080fd5b60016002858560405180838380828437820191505092505050908152602001604051809103902060030160006101000a81548160ff0219169083151502179055507fae208c74212868fa86b064783f30e0866cfafb18a57f688850671a5f1ac42bf88484604051808060200182810382528484828181526020019250808284378201915050935050505060405180910390a1600191505092915050565b6000806001809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156106ae57600080fd5b600354905060008114156106c55760019150610712565b60006003819055503373ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050151561070d57600080fd5b600191505b5090565b6000806002848460405180838380828437820191505092505050908152602001604051809103902090508060030160019054906101000a900460ff1680156107ad57503373ffffffffffffffffffffffffffffffffffffffff168160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16145b80156107bd575080600201544211155b80156107d757508060030160009054906101000a900460ff165b15156107e257600080fd5b806001015460036000828254019250508190555060028484604051808383808284378201915050925050509081526020016040518091039020600080820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055600182016000905560028201600090556003820160006101000a81549060ff02191690556003820160016101000a81549060ff021916905550507f804ec65f98430f82f51deb8d6b2f42e5a3aa276cc83327abbd5cd69b0f0ba82e8484604051808060200182810382528484828181526020019250808284378201915050935050505060405180910390a1600191505092915050565b6000600160009054906101000a900460ff16801561092a57506002838360405180838380828437820191505092505050908152602001604051809103902060030160019054906101000a900460ff16155b151561093557600080fd5b60a0604051908101604052803373ffffffffffffffffffffffffffffffffffffffff16815260200134815260200160005442018152602001600015158152602001600115158152506002848460405180838380828437820191505092505050908152602001604051809103902060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550602082015181600101556040820151816002015560608201518160030160006101000a81548160ff02191690831515021790555060808201518160030160016101000a81548160ff0219169083151502179055509050507f1a72d6383b1fc1b015bedc584a040a3cba7b0a5e33b00a43a1693b852be2382e83833460405180806020018381526020018281038252858582818152602001925080828437820191505094505050505060405180910390a160019050929150505600a165627a7a723058208e1d2cf331da5b64963e286603d20b232556699324dce292373caf6b85fc48170029";
const walletContractAbi = [{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"},{"name":"data","type":"bytes"}],"name":"send","outputs":[{"name":"result","type":"uint8"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_owner","type":"address"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"sender","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"TransactionReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"receiver","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"TransactionSent","type":"event"}];
const walletContractData = "0x60606040526040516020806102ee83398101604052808051906020019091905050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505061027e806100706000396000f300606060405260043610610041576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff1680639bd9bbc6146100b8575b60003411156100b6577fea8894086f544a14fafefe000f478d734be3087de78435eb799669d5191a3acd3334604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a15b005b34156100c357600080fd5b61010c600480803573ffffffffffffffffffffffffffffffffffffffff169060200190919080359060200190919080359060200190820180359060200191909192905050610128565b604051808260ff1660ff16815260200191505060405180910390f35b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610189576002905061024a565b8473ffffffffffffffffffffffffffffffffffffffff168484846040518083838082843782019150509250505060006040518083038185876187965a03f19250505015156101da576003905061024a565b7f4970bf8595442008a41b189fc026906b953e2a419e3029e6d0d6ce02a33ba85d8585604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1600190505b9493505050505600a165627a7a72305820e728185600b628153476d160dc5cf813228ca92503e429956d7ac50f532c77290029";

/**
 * @param web3Address string Address of the web3-enabled node.
 * @param walletCreationAccount string|{{address: string, privateKey: string}} Unencrypted account or private key with funds to be used for customer wallet creation.
 * @param shopContractAddress Address of the deployed shop contract.
 */
module.exports = function SynCoinService(web3Address, walletCreationAccount, shopContractAddress) {
    let web3 = new Web3(web3Address);

    let noncesBlockHash = 0;
    let nonces = {};

    /**
     * Returns the nonce to be used for a transaction from a specific address.
     *
     * This is to counteract a bug in Web3 that has een here for ages which practically disallows sending multiple transactions in one block from the same address.
     * https://github.com/ethereum/go-ethereum/issues/2880
     *
     * Updates to the current blockchain state when a new block is mined so it is kept as up-to-date as possible.
     * Be wary that even if you do not use the obtained nonce it will still increment, making future transactions within the same block impossible.
     *
     * @param {string} address
     * @returns {Promise|Number}
     */
    async function getNonce(address) {
        let blockHash = (await web3.eth.getBlock('latest', false)).hash;

        if (blockHash != noncesBlockHash) {
            // Clear in-memory nonces
            nonces = {};
            noncesBlockHash = blockHash;
        }

        let nonce;

        // Return the incremented existing nonce or a freshly obtained one
        if (nonces.hasOwnProperty(address)) {
            nonce = nonces[address] + 1;
        } else {
            nonce = await web3.eth.getTransactionCount(address, 'pending');
        }

        nonces[address] = nonce;

        return nonce;
    }

    /**
     * Creates an account (public-key pair) and a wallet contract owned by that account.
     * Funds the account with some dough to perform transactions.
     *
     * @param {string} password
     * @returns {Promise|{encryptedAccount: Account, walletAddress: string}}
     */
    async function createWallet(password) {
        // Create account to own the wallet
        let encryptedAccount = web3.eth.accounts.create().encrypt(password);
        let accountAddress = addAccountToInMemoryWallet(encryptedAccount, password);
        let walletCreationAddress = addAccountToInMemoryWallet(walletCreationAccount);

        let fundTransaction = {
            from: walletCreationAddress,
            to: accountAddress,
            value: web3.utils.toWei('0.1', 'ether'),
            gas: 1000000,
            gasPrice: 100000,
            nonce: await getNonce(walletCreationAddress)
        };

        // Fund the account with money for transactions (non-blocking)
        await web3.eth.call(fundTransaction);
        web3.eth.sendTransaction(fundTransaction);

        // Create and deploy contract from the wallet creation account (blocking)
        let receipt = await getWalletContract(null, walletCreationAddress)
            .deploy({
                arguments: [
                    accountAddress // owner
                ]
            })
            .send({
                nonce: await getNonce(walletCreationAddress)
            });

        return {
            encryptedAccount: encryptedAccount,
            walletAddress: receipt.contractAddress
        };
    }

    /**
     * Returns whether the password is valid for the given encrypted account (generated with createWallet())
     *
     * @param {object} encryptedAccount
     * @param {string} password
     * @return {boolean}
     */
    function verifyPassword(encryptedAccount, password) {
        try {
            web3.eth.accounts.decrypt(encryptedAccount, password);

            return true;
        } catch (error) {
            if (error.message.toLowerCase().includes('wrong password')) {
                return false
            }

            throw error;
        }
    }

    /**
     * Performs a transaction on the blockchain network.
     * Will first simulate the call to check if it can succeed, and returns before it is actually mined.
     * Use getConfirmations afterwards to check if it actually has been mined.
     *
     * @param {string} walletAddress Address of the wallet to send the transaction from.
     * @param {Account} encryptedAccount Owning account of the wallet.
     * @param {string} password
     * @param {string} toAddress
     * @param {Number} amount In Wei.
     * @param {string} [data] Binary data of the transaction, if any.
     * @returns {Promise|string} Promise that resolves with a transaction hash as soon as the transaction is broadcast on the network.
     */
    async function sendTransaction(walletAddress, encryptedAccount, password, toAddress, amount, data) {
        let accountAddress = addAccountToInMemoryWallet(encryptedAccount, password);
        let walletContract = getWalletContract(walletAddress, accountAddress);

        if (!data) {
            data = '0x';
        }

        let sendMethod = walletContract.methods.send(toAddress, amount, data);
        let transactionArguments = {
            nonce: await getNonce(accountAddress)
        };

        // Simulate the transaction and check the result
        let callResult = Number(await sendMethod.call(transactionArguments));

        if (callResult !== 1) {
            switch (callResult) {
                case 2:
                    throw new Error('Transaction could not be performed because the sending account is not the wallet\'s owner');

                case 3:
                    throw new Error('Transaction failed to execute due to insufficient wallet funds or a failed contract call.');

                default:
                    throw new Error(`Transaction could not be performed due to an unexpected exception. (${callResult})`);
            }
        }

        // Actually perform the transaction and resolve as soon as the transactionHash is known
        return new Promise((resolve, reject) => {
            sendMethod.send(transactionArguments)
                .on("transactionHash", resolve)
                .catch(reject);
        });
    }

    /**
     * Creates a transaction from a request and tests whether it can be performed in the current blockchain state.
     *
     * @param {string} walletAddress Address of the wallet to send the transaction from.
     * @param {Account} encryptedAccount Owning account of the wallet.
     * @param {string} password
     * @param {TransactionRequest} transactionRequest The transaction request to perform.
     * @returns {Promise|Transaction} Promise that resolves with a Transaction object if the transaction can be performed.
     */
    function sendTransactionRequest(walletAddress, encryptedAccount, password, transactionRequest) {
        return sendTransaction(
            walletAddress, encryptedAccount, password, transactionRequest.address, transactionRequest.amount,
            transactionRequest.data
        );
    }

    /**
     * Returns the amount of confirmations a transaction has.
     *
     * @param {string} transactionHash
     * @returns {Number} Amount of confirmations, 0 if it hasn't been included in a block or doesn't exist.
     */
    async function getConfirmations(transactionHash) {
        try {
            let transaction = await web3.eth.getTransaction(transactionHash);
            return transaction.blockNumber ? transaction.blockNumber : 0;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Returns a promise that will resolve as soon as the transaction with the given hash is mined.
     *
     * @param {string} transactionHash
     * @returns {Promise}
     */
    async function waitForConfirmation(transactionHash) {
        // If transaction is already mined, resolve immediately
        let initialConfirmations = await getConfirmations(transactionHash);

        if (initialConfirmations > 0) {
            return;
        }

        // Subscribe to block updates and resolve as soon as there are confirmations
        let subscription = web3.eth.subscribe('newBlockHeaders');

        return new Promise((resolve, reject) => {
            subscription
                .on('data', async () => {
                    let confirmations = await getConfirmations(transactionHash);

                    if (confirmations > 0) {
                        subscription.unsubscribe();

                        resolve();
                    }
                })
                .on('error', reject);
        });
    }

    /**
     * Returns the transactions of a wallet.
     *
     * @param {string} walletAddress
     * @returns {Promise|WalletTransaction[]}
     */
    async function getWalletTransactions(walletAddress) {
        let walletContract = getWalletContract(walletAddress);

        let events = await walletContract.getPastEvents('allEvents', {fromBlock: 0});

        // Map the obtained events into WalletTransaction objects
        return events.map((event) => {
            let sent = (event.event == 'TransactionSent');

            return new WalletTransaction(
                (sent ? event.returnValues.receiver : event.returnValues.sender),
                (sent ? -event.returnValues.amount : event.returnValues.amount),
                event.blockNumber, // TODO: eth.getBlock(blockNumber) -> time
                event.transactionHash
            );
        });
    }

    /**
     * @param {string} address
     * @returns {Promise|Number} Resolves when the balance is received.
     */
    async function getBalance(address) {
        return web3.eth.getBalance(address);
    }

    /**
     * @param {string} reference
     * @param {Number} amount
     * @returns {TransactionRequest}
     */
    function getOrderRequest(reference, amount) {
        let shopContract = getShopContract();
        let method = shopContract.methods.order(reference);

        return new TransactionRequest(shopContract.options.address, amount, method.encodeABI());
    }

    /**
     * @param {string} reference
     * @returns {TransactionRequest}
     */
    function getCancelRequest(reference) {
        let shopContract = getShopContract();
        let method = shopContract.methods.cancel(reference);

        return new TransactionRequest(shopContract.options.address, 0, method.encodeABI());
    }

    /**
     * @param {string} reference
     * @returns {TransactionRequest}
     */
    function getConfirmDeliveringRequest(reference) {
        let shopContract = getShopContract();
        let method = shopContract.methods.confirmDelivering(reference);

        return new TransactionRequest(shopContract.options.address, 0, method.encodeABI());
    }

    /**
     * @param {string} reference
     * @returns {TransactionRequest}
     */
    function getConfirmReceivedRequest(reference) {
        let shopContract = getShopContract();
        let method = shopContract.methods.confirmReceived(reference);

        return new TransactionRequest(shopContract.options.address, 0, method.encodeABI());
    }

    /**
     * @returns {TransactionRequest}
     */
    function getDrainRequest() {
        let shopContract = getShopContract();
        let method = shopContract.methods.drain();

        return new TransactionRequest(shopContract.options.address, 0, method.encodeABI());
    }

    /**
     * Show all order status updates for all orders.
     *
     * @param {string} [reference] Optional single order reference to show statuses of.
     * @return {Promise|OrderStatusUpdate}
     */
    async function getOrderStatusUpdates(reference) {
        let shopContract = getShopContract();

        let events = await shopContract.getPastEvents('allEvents', {
            fromBlock: 0
        });

        // Filter and map the obtained events into OrderStatuses
        return events
            .filter((event) => !reference || event.returnValues.reference == reference)
            .map((event) => {
                let status = OrderStatusUpdate.UNKNOWN;

                switch (event.event) {
                    case 'OrderCreated':
                        status = OrderStatusUpdate.CREATED;
                        break;

                    case 'OrderConfirmedDelivering':
                        status = OrderStatusUpdate.DELIVERING;
                        break;

                    case 'OrderConfirmedReceived':
                        status = OrderStatusUpdate.RECEIVED;
                        break;

                    case 'OrderCanceled':
                        status = OrderStatusUpdate.CANCELED;
                        break;
                }

                return new OrderStatusUpdate(
                    event.returnValues.reference,
                    status,
                    event.returnValues.amount ? event.returnValues.amount : null,
                    event.blockNumber, // TODO: eth.getBlock(blockNumber) -> time
                    event.transactionHash
                );
            });
    }

    /**
     * Accounts must be added to the in-memory wallet before transactions can be sent from their addresses.
     *
     * @param {object|string} account A private key or account (encrypted or unencrypted).
     * @param {string} [password] Supply a password if account is encrypted.
     * @return {string} Address to send transactions with.
     */
    function addAccountToInMemoryWallet(account, password) {
        // Decrypt encrypted account first
        if (typeof account !== 'string' && !account.privateKey) {
            account = web3.eth.accounts.decrypt(account, password);
        }

        let addedAcount = web3.eth.accounts.wallet.add(account);

        return addedAcount.address;
    }

    /**
     * Returns a wallet contract with defaults set so functions can be called without specifying any options.
     *
     * @param {string} walletAddress Address of the contract.
     * @param {string} fromAddress Address used by default to call the contract from. Make sure it is added to in-memory wallet before calling anything.
     * @return {Contract}
     */
    function getWalletContract(walletAddress, fromAddress) {
        return new web3.eth.Contract(walletContractAbi, walletAddress, {
            from: fromAddress,
            gas: 1000000,
            gasPrice: 100000,
            data: walletContractData
        });
    }

    /**
     * Ayy, see getWalletContract and replace wallet with shop.
     *
     * @return {Contract}
     */
    function getShopContract(fromAddress) {
        return new web3.eth.Contract(shopContractAbi, shopContractAddress, {
            from: fromAddress,
            gas: 1000000,
            gasPrice: 100000,
            data: shopContractData
        });
    }

    /**
     * Deploys a shop contract with the given address as the owner.
     * WalletCreationAccount will be used to deploy the contract.
     *
     * @param {string} ownerAddress
     * @param {Number} orderLifetime In seconds.
     * @return {Promise|string}
     */
    async function deployShopContract(ownerAddress, orderLifetime) {
        let walletCreationAddress = addAccountToInMemoryWallet(walletCreationAccount);
        let shopContract = getShopContract(walletCreationAddress);

        let receipt = await shopContract
            .deploy({
                arguments: [
                    ownerAddress,
                    orderLifetime
                ]
            })
            .send();

        return receipt.contractAddress;
    }

    return {
        createWallet,
        verifyPassword,
        sendTransaction,
        sendTransactionRequest,
        getWalletTransactions,
        getBalance,
        getOrderRequest,
        getCancelRequest,
        getConfirmDeliveringRequest,
        getConfirmReceivedRequest,
        getDrainRequest,
        getOrderStatusUpdates,
        deployShopContract,
        getConfirmations,
        waitForConfirmation
    };
};
