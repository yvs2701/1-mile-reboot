export type TMessage = {
    userID: string
    room: string
    message: string
}

export const message_server_id = '#server#'

export enum ServerMessages {
    NEW_CHAT = 'New Chat',
    CHAT_ENDED = 'Chat ended. Click next to find strangers.',
    NO_PEER_AVAILABLE = 'No peers available. You can wait for peers to arrive or come back later.',
}

export enum SkipBtnStates { NEXT, SURE, WAIT }

export enum SocketEvents {
    CHAT_START = 'chat start', // begins a chat
    CHAT_SEND = 'chat send', // send message from one socket to a room
    CHAT_MESSAGE = 'chat message', // receive message from a room
    CHAT_END = 'chat end', // ends a chat and clear rooms
    SKIP_CHAT = 'skip chat', // leave & clear current room and find another peer
    LOCATION_REPORT = 'loc up', // send location report to server
    DISTANCE_UPDATE = 'dist up', // receive distance update from server
    CONNECT = 'connect', // socket connection established
    DISCONNECT = 'disconnect', // socket connection lost
    NO_PEER_AVAILABLE = 'no peers', // no peer available for chat
}