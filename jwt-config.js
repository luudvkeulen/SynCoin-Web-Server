const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJWT = require('passport-jwt');

const UserController = require('./controllers/UserController');

const jwtOptions = {
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

const strategy = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    UserController.findByEmail(jwtPayload.email)
        .then(user => {
            next(null, user);
        })
        .catch(error => {
            next(null, false);
        });
});

passport.use(strategy);

module.exports = {
    passport,
    jwtOptions
}