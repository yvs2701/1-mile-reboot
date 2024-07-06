import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import Login from './pages/Login'
import ChatPage from './pages/Chat'
import Navbar from './Components/Navbar/Navbar'
import { socket } from "./utils/socket";
import { useEffect, useState } from 'react';
import { SocketEvents } from './types';

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      console.log('Connected socket');
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log('Disconnected socket');
      setIsConnected(false);
    }

    socket.on(SocketEvents.CONNECT, onConnect);
    socket.on(SocketEvents.DISCONNECT, onDisconnect);

    return () => {
      socket.off(SocketEvents.CONNECT, onConnect);
      socket.off(SocketEvents.DISCONNECT, onDisconnect);
    }
  }, [])

  return (
    <>
      <Navbar isConnected={isConnected} />
      <div id='app'>
        <Router>
          <Routes>
            <Route path='/chat' element={<ChatPage socket={socket} />} />
            <Route path='/' element={<Login />} />
          </Routes>
        </Router >
      </div>
    </>
  )
}

export default App
