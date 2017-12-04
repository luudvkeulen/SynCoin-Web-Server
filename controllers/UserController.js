const User = require('./../schemas/user');

const jwt = require('jsonwebtoken');
const { passport, jwtOptions } = require('./../jwt-config');

const walletController = require('../controllers/WalletController');

exports.login = function (req, res) {
    const synCoinService = req.synCoinService;
    const email = req.body.email;
    const password = req.body.password;
    walletController.findByEmail(email)
        .then(wallet => {
            if (synCoinService.verifyPassword(wallet.encryptedAccount, password)) {
                const payload = { email: email };
                const token = jwt.sign(payload, jwtOptions.secretOrKey);
                return res.json({ token: token });
            } else {
                return res.status(400).send({ error: 'Incorrect password' });
            }
        })
        .catch(error => {return res.status(500).send(error)});
};

exports.jwtTest = function (req, res) {
    return res.json({ message: 'Success! You can not see this without a token' });
};

exports.register = function (req, res) {
    let user = req.body;
    if (!user.email
        || !user.name
        || !user.lastname
        || !user.phone
        || !user.company
        || !user.address
        || !user.password) {
        return res.sendStatus(500);
    }

    create(
            user.email,
            user.name,
            user.lastname,
            user.phone,
            user.company,
            user.address)
        .then(
            walletController
                .create(user.email, user.password)
                .then(res.sendStatus(200))
                .catch(() => {
                        userController.remove(user.email);
                        return res.sendStatus(500)
                    }
                )
        )
        .catch(error => { return res.sendStatus(500)});
};

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