const User = require('./../schemas/user');

module.exports.findByEmail = function(email) {
    return new Promise((resolve, reject) => {
        User.findOne({ 'email': email }, function (error, result) {
            if (error) {
                reject({ message: 'Error getting user from database.' });
                return;
            }
            if (!result) {
                reject({ message: 'No user found with the given e-mail address.' });
                return;
            }
            resolve(result);
        });
    });
}