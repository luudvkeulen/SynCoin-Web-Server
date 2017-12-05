const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.post('/shop/order', (req, res) => {
    let email = req.body.email;
    let productId = req.body.productId;
    if (!email || !productId) {
        return res.sendStatus(500);
    }

    userController.findByEmail(email);

    let dateTime = new Date().toLocaleString();
    console.log(dateTime + " " + email + " " + productId);
    res.sendStatus(200);
});

router.get('/shop/products', (req, res) => {
    res.sendStatus(200);
});

module.exports = router;