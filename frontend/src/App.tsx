import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import Landing from './pages/Landing'
import ChatPage from './pages/ChatPage'
import Navbar from './Components/Navbar/Navbar'
import { socket } from "./utils/socket";
import { useEffect, useState } from 'react';
import { SocketEvents } from './types';
import LocationProtectedRoutes from './Components/ProtectedRoutes/PrivateRoutes';
import { useGeolocated } from 'react-geolocated';
import { geolocatedOptions } from './utils/configs';

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const geoLoc = useGeolocated(geolocatedOptions);

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

  // FIXME - Reloading router should not redirect it back to the landing page (unless not needed)
  return (
    <>
      <Navbar isConnected={isConnected} geoLoc={geoLoc} />
      <div id='app'>
        <Router>
          <Routes>
            <Route element={<LocationProtectedRoutes geoLoc={geoLoc} />}>
              <Route path='/chat' element={<ChatPage socket={socket} geoLoc={geoLoc} />} />
            </Route>
            <Route path='/' element={<Landing geoLoc={geoLoc} />} />
          </Routes>
        </Router >
      </div>
    </>
  )
}

export default App
