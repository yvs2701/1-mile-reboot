require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require("socket.io");
const path = require('path');
const {
    PEER_QUEUE,
    SocketEvents,
    initSocketData,
    connectPeers,
    stopDistanceUpdates,
} = require('./SocketUtils');
const port = process.env.PORT || 3000;


const app = express();
const server = createServer(app);
const io = new Server(server);

io.on(SocketEvents.CONNECT, (socket) => {
    console.group('New Socket Connection: ' + socket.id);

    initSocketData(socket);
    connectPeers(socket, io);

    socket.on(SocketEvents.LOCATION_REPORT, (data) => {
        if (data.hasOwnProperty('latitude') && data.hasOwnProperty('longitude')) {
            socket.data.coords = { latitude: data['latitude'], longitude: data['longitude'] };
        } else {
            socket.data.coords = {};
        }
    });


    socket.on(SocketEvents.CHAT_SEND, (data) => {
        // broadcast to all other peers in the room except socket
        if (data.hasOwnProperty('room') && data.hasOwnProperty('message'))
            data.message = data.message.trim();
        socket.broadcast.to(data.room).emit(SocketEvents.CHAT_MESSAGE, data);
    });

    socket.on(SocketEvents.SKIP_CHAT, (data) => {
        stopDistanceUpdates(socket);

        if (data.hasOwnProperty('room')) {
            if (data.room !== null) {
                socket.leave(data.room);
                socket.broadcast.to(data.room).emit(SocketEvents.CHAT_END);
            }
            connectPeers(socket, io);
        }
    });

    socket.on(SocketEvents.CHAT_END, () => {
        stopDistanceUpdates(socket);
    });

    socket.on(SocketEvents.DISCONNECTING, () => {
        console.group(socket.id + ' disconnecting');
        stopDistanceUpdates(socket);

        if (PEER_QUEUE.indexOf(socket) !== -1) // if socket is in the queue
            PEER_QUEUE.splice(PEER_QUEUE.indexOf(socket), 1) // block the queue (using mutating array fn) and remove it
        else {
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    console.log('Clearing room: ' + room);

                    socket.broadcast.to(room).emit(SocketEvents.CHAT_END); // broadcast to all other peers in the room except socket
                    io.in(room).socketsLeave(room);
                }
            }
        }
    });

    socket.on(SocketEvents.DISCONNECT, () => {
        console.log(socket.id + ' disconnected');
        console.groupEnd();
    });
    console.groupEnd();
});

app.use(express.static(path.join(__dirname, './frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './frontend/build', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server listening on  http://localhost:${port}/`);
});