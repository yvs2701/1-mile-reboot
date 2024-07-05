const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");
const path = require('path');
require('dotenv').config();
const { SocketEvents, PEER_QUEUE, findPeerForLoneSocket } = require('./SocketUtils');

const port = process.env.PORT || 3000;


const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, './frontend/build')));

io.on(SocketEvents.CONNECT, (socket) => {
    console.group('New Socket Connection: ' + socket.id);

    const room = findPeerForLoneSocket(socket);
    if (room !== null)
        io.to(room).emit(SocketEvents.CHAT_START, { room });

    socket.on(SocketEvents.CHAT_SEND, (data) => {
        // broadcast to all other peers in the room except socket
        if (data.hasOwnProperty('room') && data.hasOwnProperty('message'))
            data.message = data.message.trim();
            socket.broadcast.to(data.room).emit(SocketEvents.CHAT_MESSAGE, data);
    });

    socket.on(SocketEvents.SKIP_CHAT, (data) => {
        // FIXME: Not working properly
        if (data.hasOwnProperty('room')) {
            socket.broadcast.to(data.room).emit(SocketEvents.CHAT_END);
            socket.leave(data.room);
            const room = findPeerForLoneSocket(socket);
            if (room !== null)
                io.to(room).emit(SocketEvents.CHAT_START, { room });
        }
    });

    socket.on(SocketEvents.DISCONNECTING, () => {
        console.group(socket.id + ' disconnecting');

        if (PEER_QUEUE.indexOf(socket) !== -1) // if socket is in the queue
            PEER_QUEUE.splice(PEER_QUEUE.indexOf(socket), 1) // block the queue (using mutating array fn) and remove it
        else {
            socket.rooms.forEach((room) => {
                console.log('Clearing room: ' + room);

                socket.broadcast.to(room).emit(SocketEvents.CHAT_END); // broadcast to all other peers in the room except socket
                io.in(room).socketsLeave(room);
            });
        }
    });

    socket.on(SocketEvents.DISCONNECT, () => {
        console.log(socket.id + ' disconnected');
        console.groupEnd();
    });
    console.groupEnd();
});


server.listen(port, () => {
    console.log(`Server listening on  http://localhost:${port}/`);
});