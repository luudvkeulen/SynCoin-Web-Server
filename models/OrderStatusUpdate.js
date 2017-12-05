class OrderStatusUpdate {
    /**
     * @param {string} reference
     * @param {string} status
     * @param {Number} amount Set to 0 when only calling a transaction.
     * @param {Number} time Block number.
     * @param {string} transactionHash
     */
    constructor(reference, status, amount, time, transactionHash) {
        this.reference = reference;
        this.status = status;
        this.amount = amount;
        this.time = time;
        this.transactionHash = transactionHash;
    }
}

OrderStatusUpdate.CREATED = 'created';
OrderStatusUpdate.RECEIVED = 'received';
OrderStatusUpdate.DELIVERING = 'delivering';
OrderStatusUpdate.CANCELED = 'canceled';
OrderStatusUpdate.UNKNOWN = 'unknown';

module.exports = OrderStatusUpdate;
