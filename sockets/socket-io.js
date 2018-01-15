const OrderStatusUpdate = require('./../models/OrderStatusUpdate');

let io;

function initialize({ httpServer }) {
    createServer(httpServer);
}

function isSocketConnectedToNamespace(socket, namespace) {
    return Object.keys(socket.nsp.server.nsps).indexOf(namespace) > -1;
}

/**
 * Binds Socket.IO to a HTTP-server instance so it listens for connections on the same host.
 * @param {*} server
 */
function createServer(server) {
    io = require('socket.io').listen(server);

    // Middleware
    io.use(function (socket, next) {
        var handshakeData = socket.request;
        if (isSocketConnectedToNamespace(socket, '/await-payment')) {
            const token = handshakeData._query['token'];
            if (token && token !== '') {
                next();
            } else {
                next(new Error('Unauthorized'));
            }
        } else {
            next();
        }
    });

    io.of('/await-payment')
        .on('connection', (socket) => {
            console.log('[Await payment] client connected');
            socket.emit('connected', { id: socket.id });
        });
}

function registerPaymentNotification(synCoinService, socketId, reference) {
    const periodicCheck = setInterval(() => {
        synCoinService.getOrderStatusUpdates(reference)
            .then(orderStatusUpdates => {
                // Find a order status update with a status of 'CREATED'.
                const createdOrderStatusUpdate = orderStatusUpdates.find(update => update.status === OrderStatusUpdate.CREATED);
                if (createdOrderStatusUpdate) {
                    console.log('Order payment confirmed');
                    notifyOrderPaymentReceived(socketId);
                    clearInterval(periodicCheck);
                }
            }).catch(error => console.log(error));
    }, 500);
}

/**
 * Notifies connected users with the given e-mail address that an order payment has been received.
 * @param {String} socketId The socketId of the user that is awaiting the payment of an order.
 */
function notifyOrderPaymentReceived(socketId) {
    const userSocket = io.of('/await-payment').connected[socketId];
    if (userSocket) {
        userSocket.emit('payment-received', {});
    } else {
        console.log('User socket not found, couldn\'t notify user');
    }
}

module.exports = {
    initialize,
    registerPaymentNotification
}