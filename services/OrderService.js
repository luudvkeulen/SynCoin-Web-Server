const Order = require('../schemas/order');

/**
 * Saves an order in the database.
 * @param {Order} order The order which should be saved.
 */
module.exports.saveOrder = function (order) {
    return new Promise((resolve, reject) => {
        order.save((error, result) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(result);
            return;
        })
    });
}