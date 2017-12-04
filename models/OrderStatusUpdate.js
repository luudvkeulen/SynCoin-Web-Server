class OrderStatusUpdate {
    /**
     * @param reference string
     * @param status string
     * @param amount Number|null Only set when
     * @param time Number
     * @param transactionHash string
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
