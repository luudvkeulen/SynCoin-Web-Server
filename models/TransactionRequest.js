class TransactionRequest {
    /**
     * @param address string
     * @param amount Number
     * @param data string
     */
    constructor(address, amount, data) {
        this.address = address;
        this.amount = amount;
        this.data = data;
    }
}

module.exports = TransactionRequest;
