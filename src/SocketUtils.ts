import { schedule } from 'node-cron'
import { getDistance } from 'geolib'
import { Server, Socket } from 'socket.io'
import { GeolibInputCoordinates } from 'geolib/es/types'
import { AppDataSource } from './DBUtils.js'
import { SocketController } from './DBControllers.js'

// Enum for custom socket events
export enum SocketEvents {
    CHAT_START = 'chat start', // begins a chat
    CHAT_SEND = 'chat send', // send message from one socket to a room
    CHAT_MESSAGE = 'chat message', // receive message from a room
    CHAT_END = 'chat end', // ends a chat and clear rooms
    SKIP_CHAT = 'skip chat', // leave & clear current room and find another peer
    LOCATION_REPORT = 'loc up', // receive location report from socket
    DISTANCE_UPDATE = 'dist up', // send distance update to socket
    CONNECT = 'connect', // socket connected
    DISCONNECT = 'disconnect', // socket disconnected
    DISCONNECTING = 'disconnecting', // socket disconnecting
    NO_PEER_AVAILABLE = 'no peers', // no peer available for chat
}

const socketCtrl = new SocketController(AppDataSource)

const calcDistance = (coords1: GeolibInputCoordinates, coords2: GeolibInputCoordinates) => {
    return getDistance(coords1, coords2, 10) // in meters
}

export const initSocketData = (socket: Socket) => {
    socket.data = {
        coords: {},
        distanceUpdates: null,
        receivedLocation: false,
    }
}

export const destroySocket = (socket: Socket, io: Server) => {
    // remove socket from the queue
    for (const room of socket.rooms) {
        if (room !== socket.id) {
            socket.broadcast.to(room).emit(SocketEvents.CHAT_END) // broadcast to all other peers in the room except socket
            io.in(room).socketsLeave(room)
            console.log('Cleaned room', room)
        }
    }
    socketCtrl.deleteSocketById(socket.id).then((deletedResults) => {
        console.log('Deleted socket', socket.id, 'Results:', deletedResults)
    }).catch((err) => {
        console.error('Failed to delete socket', socket.id, 'Error:', err)
    })
}

export const updateDistanceCron = (room: string, io: Server) => {
    // update distance to peers in the room every minute
    return schedule('* * * * *', async () => {
        const [socket1, socket2] = await io.in(room).fetchSockets()

        const coords1 = socket1.data.coords
        const coords2 = socket2.data.coords

        if (coords1.latitude !== undefined && coords2.latitude !== undefined && coords1.longitude !== undefined && coords2.longitude !== undefined) {
            const d = calcDistance(coords1, coords2) / 1000 // in km
            io.to(room).volatile.emit(SocketEvents.DISTANCE_UPDATE, { distance: d })
        }
    }, { timezone: 'Asia/Kolkata', })
}


export const stopDistanceUpdates = (socket: Socket) => {
    if (socket.data.distanceUpdates !== null) {
        socket.data.distanceUpdates.stop()
        socket.data.distanceUpdates = null
    }
}

export const updateCoordsInDB = async (socket: Socket) => {
    if (socket.data.coords.latitude === undefined || socket.data.coords.longitude === undefined || await socketCtrl.doesSocketExist(socket.id) === false) {
        return
    }
    const socketEntity = socketCtrl.getSocketEntity(socket)
    await socketCtrl.updateSocket(socketEntity)
}

export const connectPeers = async (socket: Socket, io: Server) => {
    if (socket.data.coords.latitude === undefined || socket.data.coords.longitude === undefined || await socketCtrl.doesSocketExist(socket.id)) {
        return
    }
    console.group('Finding peer for ' + socket.id)

    const socketEntity = socketCtrl.getSocketEntity(socket)

    const peerEntity = await socketCtrl.findPeerWithingRange(socketEntity)
    if (peerEntity !== null) {
        const peer = io.sockets.sockets.get(peerEntity.socket_id)
        await socketCtrl.deleteSocket(peerEntity)
        if (peer !== undefined) {
            const room = socket.id + '#' + peer.id
            peer.join(room)
            socket.join(room)
            console.log(socket.id, 'and', peer.id, 'joined room', room)
            io.to(room).emit(SocketEvents.CHAT_START, { room })
            const d = calcDistance(socket.data.coords, peer.data.coords) / 1000 // in km
            io.to(room).volatile.emit(SocketEvents.DISTANCE_UPDATE, { distance: d })

            const job = updateDistanceCron(room, io)
            socket.data.distanceUpdates = job
            peer.data.distanceUpdates = job

            console.groupEnd()
            return
        }
    }
    socket.emit(SocketEvents.NO_PEER_AVAILABLE)
    await socketCtrl.createSocketFromEntity(socketEntity)
    console.log('No peer found.', socket.id, 'pushed to queue')
    console.groupEnd()
}
