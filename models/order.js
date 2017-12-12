const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    created: String,
    user: {
        email: String,
        company: String,
        address: String,
        name: String,
        lastname: String,
        phoneNumber: String
    },
    orderProduct: {
        product: {
            name: String,
            price: Number,
            id: Number
        },
        amount: Number
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;