class TransactionRequest {
    /**
     * @param {string} address
     * @param {Number} amount
     * @param {string} data 0x...
     */
    constructor(address, amount, data) {
        this.address = address;
        this.amount = amount;
        this.data = data ? data : '0x';
    }
}

module.exports = TransactionRequest;
