const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

require('dotenv').config({ path: 'dev.env' });

describe("SynCoinService", function () {
    // Contract creation takes a while (needs to be mined), set a high timeout
    this.timeout(120000);

    let service;

    // This is a pre-funded test account with an also pre-funded wallet that can be used for shop calls
    let encryptedAccount = {"version":3,"id":"e7252871-7d70-4d9d-99a1-7b9b41f7d99a","address":"b343b203ca3b194cdf41b8c7a06eb261f1720bcd","crypto":{"ciphertext":"08d68f901e294b5581292ec13f1c489b3b80adab0d8fcb2832e0f43fd581a392","cipherparams":{"iv":"545f55bf52f8520cd46953766872623b"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"fee64129bfdde0bcad168f8eb0b5ced55bd200e0d762908bcdd1316bd9073ec7","n":8192,"r":8,"p":1},"mac":"9cd6237d7ad3eb2d2a5c253b9f6b8c50174fd74078bec8fe2646503bd23dfb7d"}};
    let walletAddress = "0x866cc9651e8C932225414F622E087ED7A0847eC0";

    before(() => {
        service = SynCoinService(
            process.env.WEB3_ADDRESS,
            process.env.WALLET_CREATION_KEY,
            process.env.SHOP_CONTRACT_ADDRESS
        );
    });

    let createWalletResult;

    describe("#createWallet", () => {
        it("should be able to create a wallet", () => {
            return service.createWallet("goodPassword").then((result) => {
                assert.ok(result.encryptedAccount.address);
                assert.ok(result.encryptedAccount.crypto);
                assert.ok(result.walletContract.options.address);

                console.info("Wallet address: " + result.walletContract.options.address);
                console.log("Encrypted account: " + JSON.stringify(result.encryptedAccount));

                createWalletResult = result;
            });
        });
    });

    describe("#verifyPassword", () => {
        it("should return false when the password is invalid", () => {
            assert(!service.verifyPassword(createWalletResult.encryptedAccount, "badPassword"));
        });

        it("should return true when the password is valid", () => {
            assert(service.verifyPassword(createWalletResult.encryptedAccount, "goodPassword"));
        });
    });

    // Interaction with wallet
    describe("#sendTransaction", () => {
        it("should be able to send a transaction to a wallet", () => {
            console.info("Sending transaction...");
            return service.sendTransaction(walletAddress, encryptedAccount, "goodPassword",
                "0x226e820f59bB205e14b57803F8D0105e50325a8C", 999)
                .then((transactionHash) => {
                    assert.ok(transactionHash);

                    console.info("TransactionHash: " + transactionHash);
                });
        });
    });

    describe("#getWalletTransactions", () => {
        it("should be able to retrieve all transactions from a wallet", () => {
            return service.getWalletTransactions(walletAddress)
                .then((transactions) => {
                    assert(transactions.length > 0);

                    console.info("First transaction:", transactions[0]);

                    assert.ok(transactions[0].counterAddress);
                });
        });
    });

    let walletStartBalance;

    describe("#getBalance", () => {
        it("should be able to get balance of an account", () => {
            return service.getBalance(encryptedAccount.address)
                .then(balance => {
                    console.info("Account balance:", balance);
                    assert(balance > 0);
                });
        });

        it("should be able to get balance of a wallet", () => {
            return service.getBalance(walletAddress)
                .then(balance => {
                    console.info("Wallet balance:", balance);
                    assert(balance > 0);

                    walletStartBalance = balance;
                });
        });
    });

    // Interaction with shop
    let orderReference = "unitTestOrder" + Math.floor(Math.random() * 1000000);

    describe("#createOrder", () => {
        console.info("Test order reference: " + orderReference);

        let orderRequest;

        it("should successfully create order transaction request", () => {
            orderRequest = service.getOrderRequest(orderReference, 10);
            console.info("Order transaction request:", orderRequest);

            assert(orderRequest.address);
            assert(orderRequest.amount == 10);
            assert(orderRequest.data);
        });

        it("should successfully create an order", () => {
            return service.sendTransactionRequest(walletAddress, encryptedAccount, "goodPassword", orderRequest);
        });

        it("should fail to create an order with the same reference twice", () => {
            return service.sendTransactionRequest(walletAddress, encryptedAccount, "goodPassword", orderRequest)
                .then(() => assert.fail())
                .catch(() => true);
        });
    });

    describe("#cancelOrder", () => {
        it("should be able to cancel the order immediately after creating it", () => {
            let request = service.getCancelRequest(orderReference);
            return service.sendTransactionRequest(walletAddress, encryptedAccount, "goodPassword", request);
        });

        it("should refund the spent currency", () => {
            assert(walletStartBalance < service.getBalance(walletAddress));
        });
    });

    describe("#confirmDelivering", () => {
        it("should not be able to confirm received before delivering", () => {
            let request = service.getConfirmReceivedRequest(orderReference);
            return service.sendTransactionRequest(walletAddress, encryptedAccount, "goodPassword", request)
                .then(assert.fail)
                .catch(() => true);
        });

        it("should not be able to confirm delivering from the customer", () => {
            let request = service.getConfirmDeliveringRequest(orderReference);
            return service.sendTransactionRequest(walletAddress, encryptedAccount, "goodPassword", request)
                .then(assert.fail)
                .catch(() => true);
        });

        it.skip("should be able to confirm delivering as the shop owner", () => {
            // TODO: Hard code shop owner in tests?
        });
    });

    describe("#confirmReceived", () => {
        it("should successfully confirm received after being confirmed delivering", () => {
            let request = service.getConfirmReceivedRequest(orderReference);
            return service.sendTransactionRequest(walletAddress, encryptedAccount, "goodPassword", request);
        });
    });

    describe("#getOrderStatusUpdates", () => {
        it("should be able to find some global order status updates", () => {
            return service.getOrderStatusUpdates()
                .then((updates) => {
                    assert(updates.length > 0);

                    console.info("Earliest update:", updates[0]);

                    return true;
                });
        });

        it("should be able to find order status updates for the created unit test order", () => {
            return service.getOrderStatusUpdates(orderReference)
                .then((updates) => {
                    console.log(updates);

                    assert(updates.length > 0);

                    return true;
                });
        });
    });
});
