class WalletTransaction {
    /**
     * @param counterAddress string
     * @param amount Number
     * @param time Number
     * @param transactionHash string
     */
    constructor(counterAddress, amount, time, transactionHash) {
        this.counterAddress = counterAddress;
        this.amount = amount;
        this.time = time;
        this.transactionHash = transactionHash;
    }
}

module.exports = WalletTransaction;
