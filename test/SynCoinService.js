const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", function() {
    // Contract creation takes a while (needs to be mined), set a high timeout
    this.timeout(60000);

    let service;
    let walletData;

    before(() => {
        service = new SynCoinService();
    });

    describe("#createWallet", () => {
        it("should be able to create a wallet", () => {
            console.info("Generating wallet, sit tight...");

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
            assert.ok(!service.verifyPassword(walletData.encryptedAccount, "badPassword"));
        });

        it("should return true when the password is valid", () => {
            assert.ok(service.verifyPassword(walletData.encryptedAccount, "goodPassword"));
        });
    });

    describe("#createOrder", () => {
        let orderId = Math.floor(Math.random() * 1000000);

        it("should create an OrderCreated event when successful", () => {
            let encryptedAccount = {"version":3,"id":"9902e8e7-d146-4186-b2ad-a039133b100f","address":"66974e872deaf3b9ef4a2eaa3689c8fd00bc70fe","crypto":{"ciphertext":"a489cb97717dc186e1baeae2207bdb191e8b9eddd2314db0bd2daa021041ae14","cipherparams":{"iv":"36208b8773412975831275203b64054e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"5f1570e38960471acdafc9d67a15999c543e86fe1fdf44f5d822f1792db96a40","n":8192,"r":8,"p":1},"mac":"d7216171c762e566655e120aa92d8b11aa6b97e57e8f02d365d6a359ebf4f504"}};

            return service.createOrder("0x345b63fcAA8fe182ad94564985edc0235EEC0ac4", encryptedAccount, "goodPassword", 1000, "unitTestOrder" + orderId);
        });
    });

    // TODO: Test create into cancel
    // TODO: Test create into webshop confirm into not being able to cancel
    // TODO: Test create into webshop confirm into customer confirm
});
