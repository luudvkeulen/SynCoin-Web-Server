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
}