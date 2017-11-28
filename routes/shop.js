const express = require('express');
const router = express.Router();

router.post('/shop/order', (req, res) => {
    let email = req.body.email;
    let productId = req.body.productId;
    if(!email || !productId) {
        return res.sendStatus(500);
    }

    let dateTime = new Date().toLocaleString();
    console.log(dateTime + " " + user + " " + orderProduct);
    res.sendStatus(200);
});

module.exports = router;