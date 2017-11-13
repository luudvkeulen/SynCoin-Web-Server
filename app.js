const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const port = process.env.port || 8080;

app.use(bodyParser.json());

app.get('/', (req, res) => res.send("Hello"));

app.listen(port, () => console.log('Listening on port ', port));