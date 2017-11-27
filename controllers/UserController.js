const User = require('./../models/user');

function findByEmail(email) {
    return new Promise((resolve, reject) => {
        User.findOne({'email': email}, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject({message: 'No user found with the given token'});
                return;
            }
            resolve(result);
        });
    });
}

function create(email, name, lastname, phone, company, address) {
    let newUser = User({
        email: email,
        surname: name,
        lastname: lastname,
        phone: phone,
        company: company,
        address: address
    });

    return new Promise((reject, resolve) => {
        newUser.save((err) => {
            err ? reject(err) : resolve();
        });
    });
}

function remove(email) {
    User.remove({email: email});
}

module.exports = {
    findByEmail,
    create,
    remove
};