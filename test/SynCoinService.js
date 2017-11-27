const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", function () {
    // Contract creation takes a while (needs to be mined), set a high timeout
    this.timeout(120000);

    let service;

    // This is a pre-funded test account with wallet that can be used for shop calls
    let encryptedAccount =  {"version":3,"id":"7f35cc97-720d-43d4-b0bf-89d5236b5eae","address":"056761859f9f572dee69038ae72a4fb010e4d1e6","crypto":{"ciphertext":"d43d7f691ea12204114f37ff261694ec3ac6af8d898ff09f28c98c1a450a6bd7","cipherparams":{"iv":"68f7fa33ccdb25f43d6fa00bc5642ce2"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"72d4a450fe05cb057e560b9390172dcb140ce9d766d834ec2e9bc3fe230c0dba","n":8192,"r":8,"p":1},"mac":"61989f26f5a500195a8ee9b7d26a29c9633fc68ef9111e68d49e702bb7b58acc"}};
    let walletAddress = "0x524C87330eF6E27F88d054DD01be184B32b8B171";

    before(() => {
        service = new SynCoinService({
            "address": "0x66974E872deaf3B9eF4a2EAa3689c8Fd00bC70FE",
            "privateKey": "0x80a302d42612a1b0767472e165a7230da7a06e0e75f94a6885565bf46d97e65f"
        });
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
            let toAddress = "0xD6eB2D0F2bD06e4cfbAE75215B36971CB723D875";
            let amount = 999;

            console.info("Sending transaction...");
            return service.sendTransaction(walletAddress, encryptedAccount, "goodPassword", toAddress, amount).then(obj => {
                console.info("Transaction: " + obj);
                assert.ok(obj);
            });
        });
    });

    // Interaction with shop
    let orderReference = "unitTestOrder" + Math.floor(Math.random() * 1000000);

    describe("#createOrder", () => {
        console.info("Test order reference: " + orderReference);

        it("should successfully create an order", () => {
            return service.createOrder(walletAddress, encryptedAccount, "goodPassword", 1000, orderReference);
        });

        it("should fail to create an order with the same reference twice", () => {
            return service.createOrder(walletAddress, encryptedAccount, "goodPassword", 1000, orderReference)
                .then(() => {
                    assert(false);
                })
                .catch(() => {
                    assert(true);
                });
        });
    });

    describe("#cancelOrder", () => {
        it("should be able to cancel the order immediately after creating it", () => {
            return service.cancelOrder(encryptedAccount, "goodPassword", orderReference);

            // TODO: Verify that balance has been refunded?
        });
    });

    describe("#getTransactions", () => {
        it("should be able to retrieve all transactions from a wallet", () => {
           
            return service.getTransactions(walletData.walletContract.options.address, walletData.encryptedAccount, "goodPassword").then(obj2 => {
                
                console.info("Transactions: " + obj2);
                assert.ok(obj2);
            }, error => {
                console.info("error: " + error);
            });
            
        });
    });

    describe("#getBalance", () => {
        it("should be able to get balance of an address", () => {
            return service.getBalance(walletAddress).then(balance => {
                console.info("Balance: " + balance);
                assert.ok(balance);
            });
        });
    });

    // TODO: Test create into webshop confirm into not being able to cancel
    // TODO: Test create into webshop confirm into customer confirm
});
