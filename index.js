const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");
const path = require('path');

require('dotenv').config();
const port = process.env.PORT || 3000;


const app = express();
const server = createServer(app);
const io = new Server(server);

const QUEUE = [];

const findPeerForLoneSocket = function (socket) {
    if (QUEUE.length > 0) {
        const peer = QUEUE.shift() ?? null;
        console.log(peer.id + ' was popped from queue\n');

        const room = socket.id + '#' + peer.id;

        peer.join(room);
        socket.join(room);
        console.log(socket.id + ' and ' + peer.id + ' joined room ' + room);

        peer.emit('chat start', { 'name': socket.id, 'room': room });
        socket.emit('chat start', { 'name': peer.id, 'room': room });
    } else {
        QUEUE.push(socket);
        console.log(socket.id + ' was pushed to queue\n');
        log(QUEUE);
    }
};

app.use(express.static(path.join(__dirname, './frontend/build')));


io.on('connection', (socket) => {
    console.log(socket.id + ' connected');
    findPeerForLoneSocket(socket);

    io.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
    });
});


server.listen(port, () => {
    console.log(`Server listening on  http://localhost:${port}/`);
});