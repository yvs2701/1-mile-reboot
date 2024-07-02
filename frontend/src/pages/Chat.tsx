import { useEffect, useState } from "react";
import { socket } from "../utils/socket";

function ChatPage() {
  const [isConnected, setIsConnected] = useState(false);

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
    </>
  )
}

export default ChatPage;
