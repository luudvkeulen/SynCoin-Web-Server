const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", function () {
    // Contract creation takes a while (needs to be mined), set a high timeout
    this.timeout(120000);

    let service;

    // This is a pre-funded test account with wallet that can be used for shop calls
    let encryptedAccount =  {"version":3,"id":"799b7612-3fec-468d-aa23-1c20562aa28f","address":"7d2962d453c9aab9c96aa27dd4deaf37f75111af","crypto":{"ciphertext":"2af07b452ec2c846c7a715775eaff239a809ae10fc5f60bca39ce33e9afcf815","cipherparams":{"iv":"493da42f4d3f0371d71fa4ac3b066b5a"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"ea2eeec9ec6080a6428beaef9f68bcc6fd42088b03436ffe3040c02413b1adf9","n":8192,"r":8,"p":1},"mac":"61a330039c49f2fb34fabebca4eb97fc7b5572594878593b898a6b879d99e753"}};
    let walletAddress = "0xEAEddb017Be2F9053c63fa3A5FB53c435a0F4f43";

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
