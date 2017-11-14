const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const routes = require('./routes/routes');
const SynCoinService = require('./services/SynCoinService');
const serviceInstance = new SynCoinService();

const env = process.env.NODE_ENV || 'dev';
const PORT = process.env.port || 8080;

require('dotenv').config({path: env + '.env'});

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useMongoClient: true, user: process.env.DB_USER, pass: process.env.DB_PASS})
    .then(() => console.log('MongoDB: connected'))
    .catch(error => console.log('MongoDB: error while connecting ', error));

app.use(bodyParser.json());
app.use((req, res, next) => {
    // Inject SynCoinService instance so the same instance is used in all requests.
    req.synCoinService = serviceInstance;
    next();
});
app.use(routes);

app.get('/', (req, res) => res.send("Hello"));

app.listen(PORT, () => console.log('Listening on port ', PORT));