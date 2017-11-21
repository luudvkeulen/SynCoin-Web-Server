const User = require('./../models/user');

function findByEmail(email) {
    return new Promise((resolve, reject) => {
        User.findOne({ 'email': email }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject({ message: 'No user found with the given token' });
                return;
            }
            resolve(result);
        });
    });
}

module.exports = {
    findByEmail
}