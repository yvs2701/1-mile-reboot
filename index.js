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

const findPeerForLoneSocket = (socket) => {
    console.group('Finding peer for ' + socket.id);
    if (QUEUE.length > 0) {
        const peer = QUEUE.shift() ?? null;
        console.log(peer.id + ' popped from queue');

        const room = socket.id + '#' + peer.id;

        peer.join(room);
        socket.join(room);

        io.to(room).emit('chat start', { room });

        console.log(socket.id + ' and ' + peer.id + ' joined room ' + room);
    } else {
        QUEUE.push(socket);
        console.log('No peer found. ' + socket.id + ' pushed to queue\n');
    }
    console.groupEnd();

    // log queue
    console.group('Queue: ');
    if (QUEUE.length === 0) {
        console.log('Queue empty');
    } else {
        QUEUE.forEach((socket) => {
            console.log(socket.id + ' ');
        });
    }
    console.groupEnd();
};


app.use(express.static(path.join(__dirname, './frontend/build')));


io.on('connection', (socket) => {
    console.group('New Socket Connection: ' + socket.id);
    findPeerForLoneSocket(socket);


    socket.on('disconnecting', () => {
        console.group(socket.id + ' disconnecting');
        if (QUEUE.indexOf(socket) !== -1) // if in the queue
            QUEUE.splice(QUEUE.indexOf(socket), 1) // blocks the queue and removes the socket from the queue
        else {
            socket.rooms.forEach((room) => {
                console.log('Clearing room: ' + room);
                socket.to(room).emit('chat end');
                io.in(room).socketsLeave(room);
            });
        }
    })

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        console.groupEnd();
    });
    console.groupEnd();
});


server.listen(port, () => {
    console.log(`Server listening on  http://localhost:${port}/`);
});