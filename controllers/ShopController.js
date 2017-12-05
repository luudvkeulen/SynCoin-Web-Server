const Product = require('./../schemas/product');

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

function getProducts(productIds) {
    const productPromises = productIds.map(productId => findProductById(productId));
    return Promise.all(productPromises);
}

module.exports.createOrder = async function (req, res) {
    const productIds = req.body.products || [];
    const created = new Date();
    const email = req.user.email;

    try {
        const products = await getProducts(productIds);
        res.status(200).json(products);
    } catch (error) {
        console.log(error)
        res.status(500).json(error);
    }
}