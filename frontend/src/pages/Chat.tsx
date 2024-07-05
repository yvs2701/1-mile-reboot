import { useEffect, useState } from "react";
import ChatPanel from "../Components/Chat/ChatPanel";
import { TMessage, SocketEvents } from "../types";
import { Socket } from "socket.io-client";
import { throttle } from "../utils/throttle";
import styles from './chat.module.css'

function ChatPage({ socket }: { socket: Socket }) {
  const [userID, setUserID] = useState<string>('');
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [room, setRoom] = useState<string | null>(null);

  const handleNextClick = throttle(() => {
    if (!socket.connected || userID === '' || room === null)
      return;
    socket.emit(SocketEvents.SKIP_CHAT, { room });
  }, 1000) // can run only after 1s after the last call

  const handleSubmitClick = throttle(() => {
    if (!socket.connected || userID === '' || room === null || messageInput.trim() === '')
      return;

    const data: TMessage = { userID: socket.id!, message: messageInput.trim(), room: room };

    socket.emit(SocketEvents.CHAT_SEND, data);
    setMessages(prev => [...prev, data]);
    setMessageInput('');
  }, 300) // can run only after 0.5s after the last call

  function keyShortcuts(e: KeyboardEvent) {
    console.log('Key Down:', e.key, ' Ctrl key:', e.ctrlKey);
    // FIXME - not working
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmitClick();
    }
    else if (e.key === 'Escape') {
      handleNextClick();
    }
  }

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setUserID(socket.id!);
    }

    function onDisconnect() {
      setMessages([]);
      setRoom(null);
      setUserID('');
      setMessageInput('');
      window.removeEventListener('keydown', keyShortcuts);
    }

    function onChatStart(data: { room: string }) {
      setRoom(data.room);
      setMessages([]);
      setMessageInput('');
      window.addEventListener('keydown', keyShortcuts);
    }

    function onChatEnd() {
      setRoom(null);
      window.removeEventListener('keydown', keyShortcuts);
    }

    function onChatMessage(data: TMessage) {
      setMessages(prev => [...prev, data]);
    }

    socket.on(SocketEvents.CONNECT, onConnect);
    socket.on(SocketEvents.DISCONNECT, onDisconnect);
    socket.on(SocketEvents.CHAT_START, onChatStart);
    socket.on(SocketEvents.CHAT_MESSAGE, onChatMessage);
    socket.on(SocketEvents.CHAT_END, onChatEnd);

    return () => {
      socket.disconnect();
      socket.off(SocketEvents.CONNECT, onConnect);
      socket.off(SocketEvents.DISCONNECT, onDisconnect);
      socket.off(SocketEvents.CHAT_MESSAGE, onChatMessage);
      socket.off(SocketEvents.CHAT_START, onChatStart);
      socket.off(SocketEvents.CHAT_END, onChatEnd);
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
