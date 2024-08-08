import { schedule } from 'node-cron';
import { getDistance } from 'geolib';

// Enum for custom socket events
export const SocketEvents = Object.freeze({
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


export const PEER_QUEUE = [];
const ONE_MILE = 1609.34; // 1.6 km
const FIVE_MILES = 8046.72; // 8km

export const initSocketData = (socket) => {
    /* from 'react-geolocated' lib:
    coords: { latitude, longitude, altitude, accuracy, altitudeAccuracy, heading, speed } */
    socket.data = {
        coords: {},
        distanceUpdates: null,
        receivedLocation: false,
    };
}

export const destroySocket = (socket, io) => {
    // remove socket from the queue
    const idx = PEER_QUEUE.indexOf(socket);
    if (idx !== -1)
        PEER_QUEUE.splice(idx, 1);
    else {
        for (const room of socket.rooms) {
            if (room !== socket.id) {
                socket.broadcast.to(room).emit(SocketEvents.CHAT_END); // broadcast to all other peers in the room except socket
                io.in(room).socketsLeave(room);
                console.log('Cleaned room', room);
            }
        }
    }
}

const calcDistance = (coords1, coords2) => {
    return getDistance(coords1, coords2, 10); // in meters
}

export const updateDistanceCron = (room, io) => {
    // update distance to peers in the room every minute
    return schedule('* * * * *', async () => {
        const [socket1, socket2] = await io.in(room).fetchSockets();

        const coords1 = socket1.data.coords;
        const coords2 = socket2.data.coords;

        if (coords1.latitude !== undefined && coords2.latitude !== undefined && coords1.longitude !== undefined && coords2.longitude !== undefined) {
            const d = calcDistance(coords1, coords2) / 1000; // in km
            io.to(room).emit(SocketEvents.DISTANCE_UPDATE, { distance: d });
            console.log('Distance between peers in room:', room, 'is', d);
        }
    }, { timezone: 'Asia/Kolkata',  });
}


export const stopDistanceUpdates = (socket) => {
    if (socket.data.distanceUpdates !== null) {
        socket.data.distanceUpdates.stop();
        socket.data.distanceUpdates = null;
    }
}

export const connectPeers = (socket, io) => {
    console.log('socket id:', socket.id, 'data:', socket.data);
    if (socket.data.coords.latitude === undefined || socket.data.coords.longitude === undefined) {
        return;
    }
    console.group('Finding peer for ' + socket.id);
    const peer = findPeerForLoneSocket(socket);
    if (peer !== null) {
        const room = socket.id + '#' + peer.id;
        peer.join(room);
        socket.join(room);
        console.log(socket.id, 'and', peer.id, 'joined room', room);
        io.to(room).emit(SocketEvents.CHAT_START, { room });

        const job = updateDistanceCron(room, io);
        socket.data.distanceUpdates = job;
        peer.data.distanceUpdates = job;
    }
    else {
        socket.emit(SocketEvents.NO_PEER_AVAILABLE);
        console.log('No peer found.', socket.id, 'pushed to queue');
    }
    console.groupEnd();
}

const withinRange = (socket, peer) => {
    const coords = socket.data.coords;
    const peerCoords = peer.data.coords;
    const d = calcDistance(coords, peerCoords);
    return d <= FIVE_MILES && d >= ONE_MILE;
}

//TODO - instead of a peer queue use MongoDB to store { socket.id, socket.data.coords }
export const findPeerForLoneSocket = (socket) => {
    if (PEER_QUEUE.indexOf(socket) === -1) {
        const matched_peer_idx = PEER_QUEUE.findIndex(peer => withinRange(socket, peer));
        if (matched_peer_idx !== -1) {
            return PEER_QUEUE.splice(matched_peer_idx, 1)[0];
        }
        PEER_QUEUE.push(socket);
    }

    // log queue
    console.group('Queue: ');
    if (PEER_QUEUE.length === 0) {
        console.log('Queue empty');
    } else {
        PEER_QUEUE.forEach((socket) => {
            console.log(socket.id);
        });
    }
    console.groupEnd();
    return null;
};
