import { useEffect, useState } from "react";
import ChatPanel from "../Components/Chat/ChatPanel";
import { TMessage, SocketEvents } from "../types";
import { Socket } from "socket.io-client";

function ChatPage({ socket }: { socket: Socket }) {
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [room, setRoom] = useState<string | null>(null);

  const handleNextClick = async () => {
    if (room === null)
      return;
    socket.emit(SocketEvents.SKIP_CHAT, { room });
  }

  const handleSubmitClick = async () => {
    if (room === null)
      return;
    if (messageInput) {
      const data: TMessage = { userID: socket.id!, message: messageInput, room: room };
      socket.emit(SocketEvents.CHAT_SEND, data);
      setMessages(prev => [...prev, data]);
      setMessageInput('');
    }
  }

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onChatStart(data: { room: string }) {
      setRoom(data.room);
      setMessages([]);
      setMessageInput('');
    }

    function onChatEnd() {
      setRoom(null);
    }

    function onChatMessage(data: TMessage) {
      setMessages(prev => [...prev, data]);
    }

    socket.on(SocketEvents.CHAT_START, onChatStart);
    socket.on(SocketEvents.CHAT_MESSAGE, onChatMessage);
    socket.on(SocketEvents.CHAT_END, onChatEnd);

    return () => {
      socket.disconnect();
      socket.off(SocketEvents.CHAT_MESSAGE, onChatMessage);
      socket.off(SocketEvents.CHAT_START, onChatStart);
      socket.off(SocketEvents.CHAT_END, onChatEnd);
    };
  }, []);

  return (
    <>
      {room &&
        <ChatPanel user={socket.id!} messages={messages} messageInput={messageInput}
          setMessageInput={setMessageInput} handleNextClick={handleNextClick} handleSubmitClick={handleSubmitClick}
        />
      }
    </>
  )
}

export default ChatPage;
