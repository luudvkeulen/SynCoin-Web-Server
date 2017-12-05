class WalletTransaction {
    /**
     * @param {string} counterAddress
     * @param {Number} amount
     * @param {Number} time
     * @param {string} transactionHash
     */
    constructor(counterAddress, amount, time, transactionHash) {
        this.counterAddress = counterAddress;
        this.amount = amount;
        this.time = time;
        this.transactionHash = transactionHash;
    }
}

module.exports = WalletTransaction;
