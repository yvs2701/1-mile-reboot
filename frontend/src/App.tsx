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
import { GeolocatedResult, useGeolocated } from 'react-geolocated';
import { geolocatedOptions } from './utils/configs';

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [peerDistance, updateDistance] = useState<number | null>(null);
  //FIXME - Firefox has all the parameters in coords as undefined
  const geoLoc = useGeolocated({
    ...geolocatedOptions,
    onError: (error) => {
      console.group('Geolocation error');
      console.error('Error getting location', error);
      console.groupEnd();
    }
  }) as GeolocatedResult & { error: string | null };

  useEffect(() => {
    //FIXME - Error check for data coming from the server everywhere in the app
    function onConnect() {
      console.log('Connected socket');
      setIsConnected(true);
    }

    function onDistanceUpdate(data: { squaredEuclideanDistance: number }) {
      const peerDistance = Math.sqrt(data.squaredEuclideanDistance);
      console.log('Distance updated', peerDistance);
      updateDistance(peerDistance);
    }

    function onDisconnect() {
      console.log('Disconnected socket');
      setIsConnected(false);
    }

    function onSkipChat() {
      updateDistance(null);
    }
    function onChatEnd() {
      updateDistance(null);
    }

    socket
      .on(SocketEvents.CONNECT, onConnect)
      .on(SocketEvents.DISTANCE_UPDATE, onDistanceUpdate)
      .on(SocketEvents.SKIP_CHAT, onSkipChat)
      .on(SocketEvents.CHAT_END, onChatEnd)
      .on(SocketEvents.DISCONNECT, onDisconnect)

    return () => {
      socket.disconnect()
        .off(SocketEvents.CONNECT, onConnect)
        .off(SocketEvents.DISTANCE_UPDATE, onDistanceUpdate)
        .off(SocketEvents.SKIP_CHAT, onSkipChat)
        .off(SocketEvents.CHAT_END, onChatEnd)
        .off(SocketEvents.DISCONNECT, onDisconnect)
    }
  }, [])

  // FIXME - Reloading router should not redirect it back to the landing page (unless not needed)
  return (
    <>
      <Navbar isConnected={isConnected} geoLoc={geoLoc} peerDistance={peerDistance} />
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
