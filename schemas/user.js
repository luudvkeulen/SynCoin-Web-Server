const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    surname: String,
    lastname: String,
    phone: String,
    company: String,
    address: String,
    isAdmin: Boolean
});

const User = mongoose.model('User', userSchema);

module.exports = User;