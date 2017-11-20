const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", function () {
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


    describe("#getTransactions", () => {
        it("should be able to get all transactions of a contract", () => {
            password = "urpassword";

            service.createWallet(password).then((walletData) => {
                toAddress = "0xD6eB2D0F2bD06e4cfbAE75215B36971CB723D875";
                amount = 999999;

                service.sendTransaction(walletData.walletContract.options.address, walletData.encryptedAccount, password, toAddress, amount).then(() => {

                    return service.getTransactions(walletData.walletContract.options.address, walletData.encryptedAccount, password).then((data) => {

                        assert.ok(data);
                        console.info("Transactions: " + data);
                    });
                });
            });
        });
    });

});
