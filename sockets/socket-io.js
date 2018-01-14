let io;

function isSocketConnectedToNamespace(socket, namespace) {
    return Object.keys(socket.nsp.server.nsps).indexOf(namespace) > -1;
}


/**
 * Binds Socket.IO to a HTTP-server instance so it listens for connections on the same host.
 * @param {*} server
 */
function createServer(server) {
    io = require('socket.io').listen(server);

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
            // Send back Socket ID:
            socket.emit('connected', { id: socket.id });
        });
}

/**
 * Notifies connected users with the given e-mail address that an order payment has been received.
 * @param {String} socketId The socketId of the user that is awaiting the payment of an order.
 */
function notifyOrderPaymentReceived(socketId) {
    const userSocket = io.of('/await-payment')
        .connected[socketId]
    if (userSocket) {
        userSocket.emit('payment-received', {});
    } else {
        console.log('User socket not found, couldn\'t notify user');
    }
}

module.exports = {
    createServer,
    notifyOrderPaymentReceived
}