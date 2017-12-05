const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = require('./product');
const User = require('./user');

const orderSchema = new Schema({
    products: [Product.schema],
    created: Date,
    user: User.schema
});

// Defining 'reference' as a virtual field enables you to get the _id of an order by calling order.reference.
orderSchema.virtual('reference').get(function () {
    return this._id;
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;