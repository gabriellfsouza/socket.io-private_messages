var express = require('express'),
    app = express(),
    http = require('http'),
    socketIO = require('socket.io'),
    server, io;

app.use('/',express.static(`${__dirname}/public`));

server = http.Server(app);
server.listen(3000);

io = socketIO(server);

// We will keep a record of all connected sockets
const sockets = {};

io.on('connection', function (socket) {

    // Emit the connected users when a new socket connects
    for (const i in sockets) {
        socket.emit('user.add', {
            username: sockets[i].username,
            id: sockets[i].id
        });
    }

    // Add a new user
    socket.on('username.create', function (data) {
        socket.username = data;
        sockets[socket.id] = socket;
        io.emit('user.add', {
            username: socket.username,
            id: socket.id
        });
    });

    // Send the hug event to only the socket specified
    socket.on('user.hug', function (id) {
        sockets[id].emit('user.hugged', socket.username);
    });

    // Remove disconnected users
    socket.on('disconnect', function () {
        delete sockets[socket.id];
        io.emit('user.remove', socket.id);
    });
});
