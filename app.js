const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
mongoose.createConnection('mongodb://localhost:27017/SynCoin');

const routes = require('./routes/routes');
const SynCoinService = require('./services/SynCoinService');
const serviceInstance = new SynCoinService();

const PORT = process.env.port || 8080;

app.use(bodyParser.json());
app.use((req, res, next) => {
    // Inject SynCoinService instance so the same instance is used in all requests.
    req.synCoinService = serviceInstance;
    next();
});
app.use(routes);

app.get('/', (req, res) => res.send("Hello"));

app.listen(PORT, () => console.log('Listening on port ', PORT));