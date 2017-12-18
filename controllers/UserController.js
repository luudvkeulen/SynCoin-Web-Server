const User = require('./../schemas/user');

const jwt = require('jsonwebtoken');
const { passport, jwtOptions } = require('./../jwt-config');

const walletController = require('../controllers/WalletController');
const userService = require('../services/UserService');
const walletService = require('../services/WalletService');

exports.login = function (req, res) {
    const synCoinService = req.synCoinService;
    const email = req.body.email;
    const password = req.body.password;
    walletService.getEncryptedAccountByEmail(email)
        .then(encryptedAccount => {
            if (synCoinService.verifyPassword(encryptedAccount, password)) {
                const payload = { email: email };
                const token = jwt.sign(payload, jwtOptions.secretOrKey);
                return res.status(200).json({ token: token });
            } else {
                console.log('incorrect password');
                return res.status(400).send({ error: 'Incorrect password' });
            }
        })
        .catch(error => res.status(500).send(error));
};

exports.jwtTest = function (req, res) {
    return res.json({ message: 'Success! You can not see this without a token' });
};

exports.register = function (req, res) {
    const user = req.body;
    if (!user.email || !user.password) {
        return res.sendStatus(500);
    }

    create(
        user.email,
        user.name,
        user.lastname,
        user.phone,
        user.company,
        user.address)
        .then(() => {
            walletController
                .createWallet(user.email, user.password, req.synCoinService)
                .then(() => res.sendStatus(200))
                .catch((err) => {
                    return res.status(500).send(err);
                });
        }).catch(error => {
            console.log("create user error " + error);
            return res.status(500).send(error)
        });
};

exports.findByEmail = function (email) {
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

function create(email, name = '', lastname = '', phone = '', company = '', address = '') {
    let newUser = new User({
        email: email,
        surname: name,
        lastname: lastname,
        phone: phone,
        company: company,
        address: address
    });

    return new Promise((resolve, reject) => {
        newUser.save((err) => {
            if (err) {
                console.log("Create user error in promise: " + err);
                reject(err);
                return;
            }

            resolve();
        });
    });
}

function remove(email) {
    User.remove({ email: email });
}

exports.getUserData = function(req, res) {
    console.log(req.user);
    res.sendStatus(200);
}