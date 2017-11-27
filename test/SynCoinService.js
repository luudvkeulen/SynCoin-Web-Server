const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", function () {
    // Contract creation takes a while (needs to be mined), set a high timeout
    this.timeout(120000);

    let service;

    // This is a pre-funded test account with wallet that can be used for shop calls
    let encryptedAccount = {"version":3,"id":"eaf093b8-9faf-4526-9b7c-b5270389ab8e","address":"ef65d012cdd9e1ee33a6c311205eb9bacde01b1b","crypto":{"ciphertext":"b09fec0571b1426efcef34047ef750a6dca5c9f4390cd2eeac74a31579b9249d","cipherparams":{"iv":"335b85cf8e24ecc07a4c80afb26d69c2"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"611e67cac7cfdf4153b20fa72d769ab910b851670856c1354fedb36fe12e8ca3","n":8192,"r":8,"p":1},"mac":"7bc8cae8978dd16f2e820ed75ca5df6f28393a709b138511bd0da1f1285ea29f"}};
    let walletAddress = "0x4CA635e8050EAB8a20a0684BEa7C4Af61f5cD152";

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

    let orderReference = "unitTestOrder" + Math.floor(Math.random() * 1000000);
    console.info("Test order reference: " + orderReference);

    describe("#createOrder", () => {
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
