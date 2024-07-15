import { useCallback, useEffect, useState } from "react";
import ChatPanel from "../Components/Chat/ChatPanel";
import { TMessage, SocketEvents, message_server_id } from "../types";
import { Socket } from "socket.io-client";
import { throttle } from "../utils/throttle";
import styles from './chat.module.css'

function ChatPage({ socket }: { socket: Socket }) {
  // TODO: add loading spinner
  // TODO: add an emoji picker
  // TODO: connect peers withing a given distance

  const [userID, setUserID] = useState<string>('');
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [room, setRoom] = useState<string | null>(null);

  const handleNextClick = throttle(() => {
    // TODO: ask for confirmation before skipping
    if (!socket.connected || userID === '')
      return;

    socket.emit(SocketEvents.SKIP_CHAT, { room });
  }, 1000) // can run only after 1s after the last call

  const handleSubmitClick = throttle(() => {
    if (!socket.connected || userID === '' || room === null || messageInput.trim() === '')
      return;

    const mssg: TMessage = { userID: socket.id!, message: messageInput.trim(), room: room };

    socket.emit(SocketEvents.CHAT_SEND, mssg);
    setMessages(prev => [...prev, mssg]);
    setMessageInput('');
  }, 400) // can run only after 0.4s after the last call

  const keyShortcuts = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmitClick();
    }
    else if (e.key === 'Escape') {
      handleNextClick();
    }
    return;
  }, [userID, room, messageInput]);

  useEffect(() => {
    window.addEventListener('keydown', keyShortcuts);
    return () => window.removeEventListener('keydown', keyShortcuts);
  }, [keyShortcuts]);

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setUserID(socket.id!);
    }

    function onDisconnect() {
      setRoom(null);
      setMessageInput('');
    }

    function onChatStart(data: { room: string }) {
      setRoom(data.room);
      setMessages([]);
      setMessageInput('');
    }

    function onChatEnd() {
      const server_mssg: TMessage = { userID: message_server_id, message: 'Chat ended', room: room! };
      setMessages(prev => [...prev, server_mssg]);
      setRoom(null);
    }

    function onChatMessage(data: TMessage) {
      setMessages(prev => [...prev, data]);
    }

    socket
      .on(SocketEvents.CONNECT, onConnect)
      .on(SocketEvents.DISCONNECT, onDisconnect)
      .on(SocketEvents.CHAT_START, onChatStart)
      .on(SocketEvents.CHAT_MESSAGE, onChatMessage)
      .on(SocketEvents.CHAT_END, onChatEnd)

    return () => {
      socket.disconnect()
        .off(SocketEvents.CONNECT, onConnect)
        .off(SocketEvents.DISCONNECT, onDisconnect)
        .off(SocketEvents.CHAT_MESSAGE, onChatMessage)
        .off(SocketEvents.CHAT_START, onChatStart)
        .off(SocketEvents.CHAT_END, onChatEnd)
    };
  }, []);

  return (
    <section className={styles['chat-section']}>
      <ChatPanel user={userID} disabled={room === null}
        messages={messages} messageInput={messageInput} setMessageInput={setMessageInput}
        handleNextClick={handleNextClick} handleSubmitClick={handleSubmitClick}
      />
    </section>
  )
}

export default ChatPage;
