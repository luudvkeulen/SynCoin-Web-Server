const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = require('./product');
const User = require('./user');

const orderSchema = new Schema({
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    reference: Schema.Types.ObjectId,
    created: Date,
    user: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;