const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const env = process.env.NODE_ENV || 'dev';

require('dotenv').config({ path: env + '.env' });

const PORT = process.env.PORT || 8080;

const { passport } = require('./jwt-config');
const routes = require('./routes/routes');

const SynCoinService = require('./services/SynCoinService');
const serviceInstance = SynCoinService(
    process.env.WEB3_ADDRESS,
    process.env.WALLET_CREATION_KEY,
    process.env.SHOP_CONTRACT_ADDRESS
);

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useMongoClient: true, user: process.env.DB_USER, pass: process.env.DB_PASS })
    .then(() => console.log('MongoDB: connected'),
    error => console.log('MongoDB: error while connecting ', error))

// Middleware
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(bodyParser.json());
app.use(passport.initialize());
app.use((req, res, next) => {
    // Inject SynCoinService instance so the same instance is used in all requests.
    req.synCoinService = serviceInstance;
    next();
});
app.use(routes);

app.get('/', (req, res) => res.send("API is working."));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(PORT, () => console.log(`Server: Listening on port ${PORT}`));
