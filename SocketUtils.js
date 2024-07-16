// Enum for custom socket events
const SocketEvents = Object.freeze({
    CHAT_START: 'chat start', // begins a chat
    CHAT_SEND: 'chat send', // send message from one socket to a room
    CHAT_MESSAGE: 'chat message', // receive message from a room
    CHAT_END: 'chat end', // ends a chat and clear rooms
    SKIP_CHAT: 'skip chat', // leave & clear current room and find another peer
    CONNECT: 'connect', // socket connected
    DISCONNECT: 'disconnect', // socket disconnected
    DISCONNECTING: 'disconnecting', // socket disconnecting
    NO_PEER_AVAILABLE: 'no peers', // no peer available for chat
});


const PEER_QUEUE = [];

const findPeerForLoneSocket = (socket) => {
    if (PEER_QUEUE.indexOf(socket) !== -1) // if socket is in the queue
        return null;
    console.group('Finding peer for ' + socket.id);
    if (PEER_QUEUE.length > 0) {
        const peer = PEER_QUEUE.shift() ?? null;
        console.log(peer.id + ' popped from queue');

        const room = socket.id + '#' + peer.id;

        peer.join(room);
        socket.join(room);

        console.log(socket.id + ' and ' + peer.id + ' joined room ' + room);

        return room;
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
    return null;
};

module.exports = {
    SocketEvents,
    PEER_QUEUE,
    findPeerForLoneSocket,
};