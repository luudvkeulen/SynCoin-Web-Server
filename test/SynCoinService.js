const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", function () {
    // Contract creation takes a while (needs to be mined), set a high timeout
    this.timeout(120000);

    let service;
    let walletData;

    before(() => {
        service = new SynCoinService({
            "address": "0x66974E872deaf3B9eF4a2EAa3689c8Fd00bC70FE",
            "privateKey": "0x80a302d42612a1b0767472e165a7230da7a06e0e75f94a6885565bf46d97e65f"
        });
    });

    describe("#createWallet", () => {
        it("should be able to create a wallet", () => {
            return service.createWallet("goodPassword").then((data) => {
                walletData = data;

                assert.ok(walletData.encryptedAccount.address);
                assert.ok(walletData.encryptedAccount.crypto);
                assert.ok(walletData.walletContract.options.address);

                console.info("Account address: 0x" + walletData.encryptedAccount.address);
                console.info("Wallet address: " + walletData.walletContract.options.address);
            });
        });
    });

    describe("#verifyPassword", () => {
        it("should return false when the password is invalid", () => {
            assert(!service.verifyPassword(walletData.encryptedAccount, "badPassword"));
        });

        it("should return true when the password is valid", () => {
            assert(service.verifyPassword(walletData.encryptedAccount, "goodPassword"));
        });
    });

    let orderReference = "unitTestOrder" + Math.floor(Math.random() * 1000000);
    let encryptedAccount = {"version":3,"id":"9902e8e7-d146-4186-b2ad-a039133b100f","address":"66974e872deaf3b9ef4a2eaa3689c8fd00bc70fe","crypto":{"ciphertext":"a489cb97717dc186e1baeae2207bdb191e8b9eddd2314db0bd2daa021041ae14","cipherparams":{"iv":"36208b8773412975831275203b64054e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"5f1570e38960471acdafc9d67a15999c543e86fe1fdf44f5d822f1792db96a40","n":8192,"r":8,"p":1},"mac":"d7216171c762e566655e120aa92d8b11aa6b97e57e8f02d365d6a359ebf4f504"}};

    describe("#createOrder", () => {
        it("should successfully create an order", () => {
            return service.createOrder(encryptedAccount, "goodPassword", 1000, orderReference);
        });

        it("should fail to create an order with the same reference twice", () => {
            return service.createOrder(encryptedAccount, "goodPassword", 1000, orderReference)
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
            service.sendTransaction(walletData.walletContract.options.address, walletData.encryptedAccount, "goodPassword", toAddress, amount).then(obj => {

                console.info("Transaction: " + obj);
                assert.ok(obj);
            });
        });
    });

    describe("#getTransactions", () => {
        it("should be able to retrieve all transactions from a wallet", () => {

        });
    });

    describe("#getBalance", () => {
        it("should be able to get balance of an address", () => {
            service.getBalance("0x0C01824635711e785D850244979F3b7C1161266F").then(balance => {
                console.info("Balance: " + balance);
                assert.ok(balance);
            });
        });
    });

    // TODO: Test create into webshop confirm into not being able to cancel
    // TODO: Test create into webshop confirm into customer confirm
});
