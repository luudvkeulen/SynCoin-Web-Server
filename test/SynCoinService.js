const assert = require("assert");
const SynCoinService = require("../services/SynCoinService");

describe("SynCoinService", () => {
    let service;

    before(() => {
        service = new SynCoinService();
    });

    describe("#createWallet", () => {
        it("should be able to create a wallet", () => {
            service.createWallet("password");
        })
    });

    describe("#verifyPassword", () => {
        let encryptedAccount;

        before(() => {
            encryptedAccount = service.createWallet("password").encryptedAccount;
        });

        it("should return false when the password is invalid", () => {
            assert.ok(!service.verifyPassword(encryptedAccount, "badPassword"));
        });

        it("should return true when the password is valid", () => {
            assert.ok(service.verifyPassword(encryptedAccount, "password"));
        });
    });
});
