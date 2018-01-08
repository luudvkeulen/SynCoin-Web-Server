const Product = require('./../schemas/product');
const Order = require('./../schemas/order');

const UserService = require('./../services/UserService');
const OrderService = require('./../services/OrderService');

function findProductById(productId) {
    return new Promise((resolve, reject) => {
        Product.findOne({ id: productId }, (error, result) => {
            if (error) {
                console.log(error);
                reject({ message: `Error finding product with id: ${productId}` })
                return;
            }
            if (!result) {
                reject({ message: `No product found with id: ${productId}` })
                return;
            }
            resolve(result);
        });
    });
}

/**
 * Gets all products with the given id's.
 * @param {number[]} productIds The id's of the products that should be retrieved from the database.
 * @returns {Promise} A promise which should return all product objects.
 */
function getProductsByIds(productIds) {
    const productPromises = productIds.map(productId => findProductById(productId));
    return Promise.all(productPromises);
}

/**
 * Calculates the total price of an order.
 * @param {[Product]} products The products that have been ordered.
 * @returns {number} The total price in tokens.
 */
function calculateTotalPrice(products) {
    return products.reduce((sum, currentProduct) => {
        return sum + currentProduct.price;
    }, 0)
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports.createOrder = async function (req, res) {
    const productIds = req.body.products || [];
    const created = new Date();
    const email = req.user.email;

    try {
        const products = await getProductsByIds(productIds);
        const user = await UserService.findByEmail(email);
        const newOrder = new Order({
            products: products,
            created: created,
            user: user
        });
        const order = await OrderService.saveOrder(newOrder);
        const totalPrice = calculateTotalPrice(products);
        const orderReference = order.reference.toString();
        const orderRequest = req.synCoinService.getOrderRequest(orderReference, totalPrice);
        res.status(200).json({
            address: orderRequest.address,
            amount: orderRequest.amount,
            data: orderRequest.data,
            reference: orderReference
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports.confirmDelivering = async function (req, res) {
    if (!req.user.isAdmin) {
        return res.sendStatus(401);
    }

    let reference = req.body.reference;

    if (!reference || typeof reference !== 'string') {
        return res.status(400)
            .json(new Error('Order reference invalid or not provided.'));
    }

    // Check if the order exists as a quick sanity check
    try {
        console.log(await Order.findOne({reference: reference}));
    } catch (error) {
        return res.status(400)
            .json(new Error('Order with given reference does not exist.'));
    }

    return res.status(200)
        .json(req.synCoinService.getConfirmDeliveringRequest(reference));
};

module.exports.confirmReceived = async function (req, res) {
    if (!req.user) {
        return res.sendStatus(401);
    }

    let reference = req.body.reference;

    if (!reference || typeof reference !== 'string') {
        return res.status(400)
            .json(new Error('Order reference invalid or not provided.'));
    }

    // Check if the order exists as a quick sanity check
    try {
        console.log(await Order.findOne({reference: reference}));
    } catch (error) {
        return res.status(400)
            .json(new Error('Order with given reference does not exist.'));
    }

    return res.status(200)
        .json(req.synCoinService.getConfirmReceivedRequest(reference));
};

module.exports.cancel = async function (req, res) {
    if (!req.user) {
        return res.sendStatus(401);
    }

    let reference = req.body.reference;

    if (!reference || typeof reference !== 'string') {
        return res.status(400)
            .json(new Error('Order reference invalid or not provided.'));
    }

    // Check if the order exists as a quick sanity check
    try {
        console.log(await Order.findOne({reference: reference}));
    } catch (error) {
        return res.status(400)
            .json(new Error('Order with given reference does not exist.'));
    }

    return res.status(200)
        .json(req.synCoinService.getCancelRequest(reference));
};

module.exports.getAllOrders = async function (req, res) {
    const user = req.user;
    if (!user) return res.sendStatus(500);
    if (!user.isAdmin) return res.sendStatus(401);

    Order.find({}, (err, result) => {
        if (err) {
            return res.sendStatus(500);
        }

        let promises = [];

        for (let i = 0; i < result.length; i++) {
            let order = result[i];
            promises.push(req.synCoinService.getOrderStatusUpdates(order._id).then((statusresult) => {
                //Convert from mongoose object to javascript object
                result[i] = result[i].toObject();

                if (!statusresult || statusresult.length === 0) {
                    result[i]["status"] = "-";
                    return result[i];
                }

                result[i]["status"] = capitalizeFirstLetter(statusresult[statusresult.length - 1].status);
                return result[i];
            }));
        }

        Promise.all(promises).then((results) => {
            res.json(results);
        });
    });
};

module.exports.getOrder = async function (req, res) {
    let reference = req.params.reference;
    if (!reference || typeof reference !== 'string') {
        return res.status(400).json({error: 'No or invalid order reference supplied.'});
    }

    try {
        let order = await Order.findById(reference);

        if (!req.user.isAdmin && req.user._id !== order.user._id) {
            return res.status(401).json({error: 'You do not have access to retrieve this order.'});
        }

        return res.json({
            created: order.created,
            id: order._id,
            user: order.user,
            products: order.products,
            statusUpdates: await req.synCoinService.getOrderStatusUpdates(reference)
        });
    } catch (error) {
        return res.status(400).json({error: 'Order does not exist or could not be retrieved.'});
    }
};