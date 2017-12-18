const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true
    },
    surname: String,
    lastname: String,
    phone: String,
    company: String,
    address: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;