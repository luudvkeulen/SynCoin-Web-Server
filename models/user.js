const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    company: String,
    address: String,
    name: String,
    phone: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;