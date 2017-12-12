const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

require('dotenv').config({ path: 'dev.env' });

// Set to true to log additional output
const logging = false;
function log() {
    if (logging) {
        console.log.apply({}, arguments);
    }
}

describe("SynCoinService", function () {
    // Waiting for confirmations takes a while: set a high timeout
    this.timeout(120000);

    let service;

    // This is a pre-funded test account with an also pre-funded wallet that can be used for shop calls
    let encryptedUserAccount = {"version":3,"id":"e7252871-7d70-4d9d-99a1-7b9b41f7d99a","address":"b343b203ca3b194cdf41b8c7a06eb261f1720bcd","crypto":{"ciphertext":"08d68f901e294b5581292ec13f1c489b3b80adab0d8fcb2832e0f43fd581a392","cipherparams":{"iv":"545f55bf52f8520cd46953766872623b"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"fee64129bfdde0bcad168f8eb0b5ced55bd200e0d762908bcdd1316bd9073ec7","n":8192,"r":8,"p":1},"mac":"9cd6237d7ad3eb2d2a5c253b9f6b8c50174fd74078bec8fe2646503bd23dfb7d"}};
    let userWalletAddress = "0x866cc9651e8C932225414F622E087ED7A0847eC0";

    let encryptedShopAccount = {"version":3,"id":"fa306b2c-56e7-4b1a-a4c6-bb1aceec5ad1","address":"7e6c2e15511d0467bc23cc5215bd621ba1c9b97a","crypto":{"ciphertext":"89868751b99924cbc221c16a1c62757213035c1a0c853a29300f31cf3c396da3","cipherparams":{"iv":"3c575145eab693d4a333aad712e90164"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"79ea766fdbdc8ab547e24179b9e4289fabbff03471fa8e9672ddaf9d4b2a559d","n":8192,"r":8,"p":1},"mac":"eabf8c9f5538ee8b0ad7a570e1b4b0c9b33d6591257d28ee804d2801c7072466"}};
    let shopWalletAddress = "0x4Bb3dC8729cA3230E716C0D44E60470Dd0Dc6839";

    before(() => {
        service = SynCoinService(
            process.env.WEB3_ADDRESS,
            process.env.WALLET_CREATION_KEY,
            process.env.SHOP_CONTRACT_ADDRESS
        );
    });

    describe("Wallet creation", () => {
        let createWalletResult;

        describe("#createWallet", () => {
            it("should be able to create a wallet", async () => {
                let result = await service.createWallet("goodPassword");

                assert.ok(result.encryptedAccount.address);
                assert.ok(result.encryptedAccount.crypto);
                assert.ok(result.walletAddress);

                log("Wallet address: " + result.walletAddress);
                log("Encrypted account: " + JSON.stringify(result.encryptedAccount));

                createWalletResult = result;
            });

            it("should fund the account with transaction money", async () => {
                let balance = await service.getBalance(createWalletResult.encryptedAccount.address)
                assert(balance > 0);
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
    });

    describe("Basic blockchain interaction", () => {
        let sendTransactionHash;

        describe("#sendTransaction", () => {
            it("should be able to send a transaction to a wallet", async () => {
                log("Sending transaction...");
                let transactionHash = await service.sendTransaction(userWalletAddress, encryptedUserAccount,
                    "goodPassword", shopWalletAddress, 999);

                assert(transactionHash);
                log("TransactionHash: " + transactionHash);
            });

            it("should be able to send a transaction from the shop wallet", async () => {
                log("Sending transaction...");
                let transactionHash = await service.sendTransaction(shopWalletAddress, encryptedShopAccount,
                    "goodPassword", userWalletAddress, 999);

                assert(transactionHash);

                log("TransactionHash: " + transactionHash);

                sendTransactionHash = transactionHash;
            });
        });

        describe("#getConfirmations", () => {
            it("should not return the previous transaction as being confirmed", async () => {
                let confirmations = await service.getConfirmations(sendTransactionHash);
                assert(confirmations === 0);
            });

            it("should return zero for an invalid transaction hash", async () => {
                let confirmations = await service.getConfirmations("0xeeeeeeeeeeeeeeeeee");
                assert(confirmations === 0);
            })
        });

        describe("#waitForConfirmation", () => {
            it("should wait for the previous transaction to be confirmed", async () => {
                await service.waitForConfirmation(sendTransactionHash);

                let confirmations = await service.getConfirmations(sendTransactionHash);
                assert(confirmations > 0);
            });

            it("should not hang in waiting when it is already confirmed", async () => {
                await service.waitForConfirmation(sendTransactionHash);
            });
        });

        describe("#getWalletTransactions", () => {
            it("should be able to retrieve all transactions from a wallet", async () => {
                let transactions = await service.getWalletTransactions(userWalletAddress);

                assert(transactions.length > 0);

                log("First transaction:", transactions[0]);

                assert(transactions[0].counterAddress);
            });
        });

        describe("#getBalance", () => {
            it("should be able to get balance of the user account", async () => {
                let balance = await service.getBalance(encryptedUserAccount.address);

                log("User account balance:", balance);
                assert(balance > 0);
            });

            it("should be able to get balance of the shop account", async () => {
                let balance = await service.getBalance(encryptedShopAccount.address);

                log("Shop account balance:", balance);
                assert(balance > 0);
            });

            it("should be able to get balance of the user wallet", async () => {
                let balance = await service.getBalance(userWalletAddress);
                log("User wallet balance:", balance);
                assert(balance > 0);
            });

            it("should be able to get balance of the shop wallet", async () => {
                let balance = await service.getBalance(userWalletAddress)
                log("Shop wallet balance:", balance);
                assert(balance > 0);
            });
        });
    });

    describe("Shop interaction", () => {
        let orderReference1 = "unitTestOrder1-" + Math.floor(Math.random() * 1000000);
        let orderReference2 = "unitTestOrder2-" + Math.floor(Math.random() * 1000000);

        let order1TransactionHash;
        let order2TransactionHash;

        describe("#order", () => {
            log("Test order references: ", orderReference1, orderReference2);

            let orderRequest1;

            it("should successfully create an order", async () => {
                // Two orders, so that one can be canceled where the other can still be completed
                orderRequest1 = service.getOrderRequest(orderReference1, 10);
                order1TransactionHash = await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", orderRequest1);

                let orderRequest2 = service.getOrderRequest(orderReference2, 10);
                order2TransactionHash = await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", orderRequest2);
            });

            it("should fail to create an order with the same reference twice", async () => {
                try {
                    await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", orderRequest1);
                } catch (error) {
                }
            });
        });

        describe("#cancelOrder", () => {
            let cancel2TransactionHash;
            let walletBalanceBeforeCancel;

            it("wait for order 2 transaction to be mined and get balance", async () => {
                await service.waitForConfirmation(order2TransactionHash);

                walletBalanceBeforeCancel = await service.getBalance(userWalletAddress);
            });

            it("should be able to cancel the order immediately after creating it", async () => {
                let request = service.getCancelRequest(orderReference2);
                cancel2TransactionHash = await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", request);
            });

            it("should refund the spent currency", async () => {
                log("Waiting for order 2 cancel transaction to confirm...");
                await service.waitForConfirmation(cancel2TransactionHash);

                let balance = await service.getBalance(userWalletAddress);

                log("Balance before cancel:", walletBalanceBeforeCancel);
                log("Balance after cancel:", balance);

                assert(balance > walletBalanceBeforeCancel);
            });
        });

        let confirmDeliveringTransactionHash;

        describe("#confirmDelivering", () => {
            it("wait for order 1 creation transaction to be mined...", async () => {
                await service.waitForConfirmation(order1TransactionHash);
            });

            it("should not be able to confirm received before delivering", async () => {
                let request = service.getConfirmReceivedRequest(orderReference1);
                try {
                    await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", request);
                    assert.fail();
                } catch (error) {
                }
            });

            it("should not be able to confirm delivering from the customer", async () => {
                let request = service.getConfirmDeliveringRequest(orderReference1);
                try {
                    await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", request);
                    assert.fail();
                } catch (error) {
                }
            });

            it("should not be able to confirm delivering after it has been canceled", async () => {
                let request = service.getConfirmDeliveringRequest(orderReference2);
                try {
                    await service.sendTransactionRequest(shopWalletAddress, encryptedShopAccount, "goodPassword", request);
                    assert.fail();
                } catch (error) {
                }
            });

            it("should be able to confirm delivering as the shop owner", async () => {
                let request = service.getConfirmDeliveringRequest(orderReference1);
                confirmDeliveringTransactionHash = await service.sendTransactionRequest(shopWalletAddress, encryptedShopAccount, "goodPassword", request);
            });
        });

        describe("#confirmReceived", () => {
            it("wait for confirmDelivering transaction to be mined...", async () => {
                await service.waitForConfirmation(confirmDeliveringTransactionHash);
            });

            it("should successfully confirm received after being confirmed delivering", async () => {
                let request = service.getConfirmReceivedRequest(orderReference1);
                await service.sendTransactionRequest(userWalletAddress, encryptedUserAccount, "goodPassword", request);
            });
        });

        describe("#getOrderStatusUpdates", () => {
            it("should be able to find some global order status updates", async () => {
                let updates = await service.getOrderStatusUpdates();
                assert(updates.length > 0);
                log("Earliest update:", updates[0]);
            });

            it("should be able to find order status updates for the created unit test order", async () => {
                let updates = await service.getOrderStatusUpdates(orderReference1);
                assert(updates.length > 0);
                log("Earliest unit test update:", updates[0]);
            });
        });

        describe("#drain", () => {
            it("should be able to drain the shop", async () => {
                let balanceBefore = await service.getBalance(shopWalletAddress);

                log("Balance before drain:", balanceBefore);

                let request = service.getDrainRequest();
                await service.sendTransactionRequest(shopWalletAddress, encryptedShopAccount, "goodPassword", request);

                let balanceAfter = await service.getBalance(shopWalletAddress);

                log("Balance after drain:", balanceAfter);
                assert(balanceBefore < balanceAfter);
            })
        });
    });

    describe("#deployShopContract", () => {
        it("should be able to deploy a shop contract for a wallet", async () => {
            let shopContractAddress = await service.deployShopContract(shopWalletAddress, 604800);
            assert(shopContractAddress);
            log("Shop contract address:", shopContractAddress);
        });
    });
});

// TODO: Test that shop should not be able to call confirmReceived or cancel (stretch)
