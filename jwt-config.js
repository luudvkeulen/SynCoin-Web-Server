const jwt = require('jsonwebtoken');

const passport = require('passport');
const passportJWT = require('passport-jwt');

const userService = require('./services/UserService');

const jwtOptions = {
    jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

const strategy = new passportJWT.Strategy(jwtOptions, (jwtPayload, next) => {
    userService.findByEmail(jwtPayload.email)
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