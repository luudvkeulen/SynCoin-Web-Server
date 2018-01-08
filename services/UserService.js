const User = require('./../schemas/user');

exports.findByEmail = function(email) {
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

exports.getAccountData = function(email) {
    return new Promise((resolve, reject) => {
        exports.findByEmail(email)
            .then(user => {
                resolve({
                    id: user._id,
                    email: user.email,
                    name: user.surname,
                    lastname: user.lastname,
                    phone: user.phone,
                    company: user.company,
                    address: user.address,
                    isAdmin: user.isAdmin
                });
            })
            .catch(error => {
                reject(error);
            })
    });
}

exports.updateUserData = function(user) {
    return new Promise((resolve, reject) => {
        User.findByIdAndUpdate(user.id, {
            email: user.email,
            surname: user.name,
            lastname: user.lastname,
            phone: user.phone,
            company: user.company,
            address: user.address
        }, (error, result) => {
            if (error) {
                console.log(error);
                reject({ 'error': 'Error updating account information'});
                return;
            }
            resolve();
        })
    });
}