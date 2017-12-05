const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: String,
    id: Number,
    price: Number,
    imageUrl: String
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;