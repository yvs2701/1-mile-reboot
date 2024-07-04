import { useEffect, useState } from "react";
import { socket } from "../utils/socket";
import ChatPanel from "../Components/Chat/ChatPanel";

type TMessage = {
  userID: string
  message: string
}

function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<TMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const handleNextClick = async () => {
    socket.emit('skip chat');
  }

  const handleSubmitClick = async () => {
    if (messageInput) {
      const data: TMessage = { userID: socket.id!, message: messageInput };
      socket.emit('chat message', data);
      setMessages([...messages, data]);
      setMessageInput('');
    }
  }

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('Disconnected socket');
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.disconnect();
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <p>Socket connection status: {isConnected ? 'connected' : 'not connected'}</p>
      {isConnected &&
        <ChatPanel user={socket.id!} messages={messages} messageInput={messageInput}
          setMessageInput={setMessageInput} handleNextClick={handleNextClick} handleSubmitClick={handleSubmitClick}
        />
      }
    </>
  )
}

export default ChatPage;
