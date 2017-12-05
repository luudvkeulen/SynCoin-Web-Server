const User = require('./../schemas/user');

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
    User.remove({ email: email });
}

function login(req, res) {
    const synCoinService = req.synCoinService;
    const email = req.body.email;
    const password = req.body.password;
    findByEmail(email)
        .then(wallet => {
            if (synCoinService.verifyPassword(wallet.encryptedAccount, password)) {
                const payload = { email: email };
                const token = jwt.sign(payload, jwtOptions.secretOrKey);
                res.json({ token: token });
            } else {
                res.status(400).send({ error: 'Incorrect password' });
            }
        })
        .catch(error => res.status(500).send(error));
}

module.exports = {
    findByEmail,
    create,
    remove,
    login
};