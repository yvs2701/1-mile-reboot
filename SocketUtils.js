const cron = require('node-cron');

// Enum for custom socket events
const SocketEvents = Object.freeze({
    CHAT_START: 'chat start', // begins a chat
    CHAT_SEND: 'chat send', // send message from one socket to a room
    CHAT_MESSAGE: 'chat message', // receive message from a room
    CHAT_END: 'chat end', // ends a chat and clear rooms
    SKIP_CHAT: 'skip chat', // leave & clear current room and find another peer
    LOCATION_REPORT: 'loc up', // receive location report from socket
    DISTANCE_UPDATE: 'dist up', // send distance update to socket
    CONNECT: 'connect', // socket connected
    DISCONNECT: 'disconnect', // socket disconnected
    DISCONNECTING: 'disconnecting', // socket disconnecting
    NO_PEER_AVAILABLE: 'no peers', // no peer available for chat
});


const PEER_QUEUE = [];

const haversineDistance = (coords1, coords2) => {
    const toRad = (degrees) => degrees * Math.PI / 180;
    const R = 6371; // Radius of the earth in km
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.latitude)) * Math.cos(toRad(coords2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

const initSocketData = (socket) => {
    /* from 'react-geolocated' lib:
    coords: { latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed } */
    socket.data = {
        coords: {},
        distanceUpdates: null,
    };
}

const updateDistanceCron = (room, io) => {
    // update distance to peers in the room every minute
    const job = cron.schedule('* * * * *', async () => {
        const [socket1, socket2] = await io.in(room).fetchSockets();
        console.log('Socket1 coords:', socket1.data.coords, 'Socket2 coords:',socket2.data.coords);

        const coords1 = socket1.data.coords;
        const coords2 = socket2.data.coords;

        if (coords1.latitude !== undefined && coords2.latitude !== undefined && coords1.longitude !== undefined && coords2.longitude !== undefined) {
            const distance = haversineDistance(coords1, coords2);
            console.log('Distance update for room:', room, 'distance', distance);
            io.to(room).emit(SocketEvents.DISTANCE_UPDATE, { distance: distance });
        }
    }, { timezone: 'Asia/Kolkata' });

    return job;
}


const stopDistanceUpdates = (socket) => {
    if (socket.data.distanceUpdates !== null) {
        socket.data.distanceUpdates.stop();
        socket.data.distanceUpdates = null;
    }
}

const connectPeers = (socket, io) => {
    const { room, peer } = findPeerForLoneSocket(socket);
    if (room !== null) {
        peer.join(room);
        socket.join(room);
        console.log(socket.id + ' and ' + peer.id + ' joined room ' + room);
        io.to(room).emit(SocketEvents.CHAT_START, { room });

        const job = updateDistanceCron(room, io);
        socket.data.distanceUpdates = job;
        peer.data.distanceUpdates = job;
    }
    else {
        socket.emit(SocketEvents.NO_PEER_AVAILABLE);
    }
}

const findPeerForLoneSocket = (socket) => {
    if (PEER_QUEUE.indexOf(socket) !== -1) // if socket is in the queue
        return { room: null, peer: null };
    console.group('Finding peer for ' + socket.id);
    if (PEER_QUEUE.length > 0) {
        const peer = PEER_QUEUE.shift() ?? null;
        console.log(peer.id + ' popped from queue');

        const room = socket.id + '#' + peer.id;

        return { room, peer };
    } else {
        PEER_QUEUE.push(socket);
        console.log('No peer found. ' + socket.id + ' pushed to queue\n');
    }
    console.groupEnd();

    // log queue
    console.group('Queue: ');
    if (PEER_QUEUE.length === 0) {
        console.log('Queue empty');
    } else {
        PEER_QUEUE.forEach((socket) => {
            console.log(socket.id + ' ');
        });
    }
    console.groupEnd();
    return { room: null, peer: null };
};

module.exports = {
    SocketEvents,
    PEER_QUEUE,
    initSocketData,
    findPeerForLoneSocket,
    haversineDistance,
    connectPeers,
    stopDistanceUpdates,
    updateDistanceCron,
};