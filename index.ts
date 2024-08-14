import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { SocketEvents, initSocketData, destroySocket, connectPeers, stopDistanceUpdates, updateCoordsInDB } from './src/SocketUtils.js';
import { connect } from './src/DBUtils.js';

const port = process.env.PORT || 3000

connect().then(() => {
    const app = express()
    const server = http.createServer(app)
    const io = new Server(server)

    io.on(SocketEvents.CONNECT, (socket) => {
        console.group('New Socket Connection: ' + socket.id)

        initSocketData(socket)

        socket.on(SocketEvents.LOCATION_REPORT, async (data, cb) => {
            if (data.hasOwnProperty('latitude') && data.hasOwnProperty('longitude')) {
                socket.data.coords = { latitude: data['latitude'], longitude: data['longitude'] }
                if (socket.data.receivedLocation === false) {
                    socket.data.receivedLocation = true
                    await connectPeers(socket, io)
                } else {
                    await updateCoordsInDB(socket)
                }
            } else {
                socket.data.coords = {}
            }
            cb({ ack: true })
        })

        socket.on(SocketEvents.CHAT_SEND, (data) => {
            // broadcast to all other peers in the room except socket
            if (data.hasOwnProperty('room') && data.hasOwnProperty('message'))
                data.message = data.message.trim()
            socket.broadcast.to(data.room).emit(SocketEvents.CHAT_MESSAGE, data)
        })

        socket.on(SocketEvents.SKIP_CHAT, async (data) => {
            stopDistanceUpdates(socket)

            if (data.hasOwnProperty('room')) {
                if (data.room !== null) {
                    socket.leave(data.room)
                    socket.broadcast.to(data.room).emit(SocketEvents.CHAT_END)
                }
                await connectPeers(socket, io)
            }
        })

        socket.on(SocketEvents.CHAT_END, () => {
            stopDistanceUpdates(socket)
        })

        socket.on(SocketEvents.DISCONNECTING, () => {
            console.group(socket.id, 'disconnecting')
            stopDistanceUpdates(socket)
            destroySocket(socket, io)
            console.log(socket.id, 'disconnected')
            console.groupEnd()
        })
        console.groupEnd()
    })

    app.use(express.static(path.join(__dirname, './frontend/build')))

    app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, './frontend/build', 'index.html'))
    })

    server.listen(port, () => {
        console.log(`Server listening on  http://localhost:${port}/`)
    })

}).catch(err => {
    console.error('Failed to connect to database:', err)
    throw err
})

process.on('uncaughtException', function (err) {
    console.error(err.stack)
    process.exit(1)
})
