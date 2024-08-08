import { config } from 'dotenv';
config();
import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { SocketEvents, initSocketData, destroySocket, connectPeers, stopDistanceUpdates } from './SocketUtils.js';
const port = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

io.on(SocketEvents.CONNECT, (socket) => {
    console.group('New Socket Connection: ' + socket.id);

    initSocketData(socket);

    socket.on(SocketEvents.LOCATION_REPORT, (data) => {
        if (data.hasOwnProperty('latitude') && data.hasOwnProperty('longitude')) {
            socket.data.coords = { latitude: data['latitude'], longitude: data['longitude'] };
            if (socket.data.receivedLocation === false) {
                socket.data.receivedLocation = true;
                connectPeers(socket, io);
            }
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
        console.group(socket.id, 'disconnecting');
        stopDistanceUpdates(socket);
        destroySocket(socket, io);
    });

    socket.on(SocketEvents.DISCONNECT, () => {
        console.log(socket.id, 'disconnected');
        console.groupEnd();
    });
    console.groupEnd();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, './frontend/build')));

app.get('*', (req, res) => {
    res.sendFile(join(__dirname, './frontend/build', 'index.html'));
});

server.listen(port, () => {
    console.log(`Server listening on  http://localhost:${port}/`);
});

process.on('uncaughtException', function (err) {
    console.error(err.stack);
});
