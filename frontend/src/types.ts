export type TMessage = {
    userID: string
    room: string
    message: string
}

export const message_server_id = '#server#'

export enum SocketEvents {
    CHAT_START = 'chat start', // begins a chat
    CHAT_SEND = 'chat send', // send message from one socket to a room
    CHAT_MESSAGE = 'chat message', // receive message from a room
    CHAT_END = 'chat end', // ends a chat and clear rooms
    SKIP_CHAT = 'skip chat', // leave & clear current room and find another peer
    CONNECT = 'connect', // socket connection established
    DISCONNECT = 'disconnect', // socket connection lost
    NO_PEER_AVAILABLE = 'no peers', // no peer available for chat
}