import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import Landing from './pages/Landing'
import ChatPage from './pages/ChatPage'
import Navbar from './Components/Navbar/Navbar'
import { useEffect, useRef, useState } from 'react';
import { SocketEvents } from './utils/types';
import LocationProtectedRoutes from './Components/ProtectedRoutes/PrivateRoutes';
import { GeolocatedResult, useGeolocated } from 'react-geolocated';
import { socket, geolocatedOptions } from './utils/configs';

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [peerDistance, setPeerDistance] = useState<string | number | null>(null);
  const lastLocationUpdate = useRef<number>(0);
  const locationUpdateTimeout = useRef<NodeJS.Timeout | undefined>();

  // FIXME - Firefox has empty coords object
  const geoLoc = useGeolocated({
    ...geolocatedOptions,
    onError: (error) => {
      console.error('Error getting location', error);
    },
  }) as GeolocatedResult & { error: string | null };

  useEffect(() => { // location report
    const locationUpdate = () => {
      if (socket.connected && geoLoc.isGeolocationAvailable && geoLoc.isGeolocationEnabled &&
        geoLoc.coords !== undefined && geoLoc.coords.latitude !== undefined && geoLoc.coords.longitude !== undefined) {

        const now = new Date().getTime();
        if (now - lastLocationUpdate.current < 60000) {
          // throttled fn - will not run if called within 1 minute
          return;
        }

        socket.volatile.emit(SocketEvents.LOCATION_REPORT, { latitude: geoLoc.coords.latitude, longitude: geoLoc.coords.longitude }, (res: any) => {
          lastLocationUpdate.current = now; // only throttle if the server acknowledges the location report
          console.log('Location reported', geoLoc.coords, 'Server Ack:', res.ack);
        });

        locationUpdateTimeout.current = setTimeout(locationUpdate, 60000);
      }
    }
    locationUpdate();

    return () => {
      clearTimeout(locationUpdateTimeout.current);
    }
  }, [geoLoc.coords, geoLoc.isGeolocationAvailable, geoLoc.isGeolocationEnabled])

  useEffect(() => {
    //FIXME - Error check for data coming from the server everywhere in the app
    function onConnect() {
      console.log('Connected socket');
      setIsConnected(true);
    }

    function onDistanceUpdate(data: { distance: number }) {
      const dist = data.distance; //NOTE - in KiloMeters
      setPeerDistance(dist.toFixed(2));
    }

    function onChatEnd() {
      setPeerDistance(null);
    }

    function onDisconnect() {
      console.log('Disconnected socket');
      setIsConnected(false);
    }

    socket
      .on(SocketEvents.CONNECT, onConnect)
      .on(SocketEvents.DISTANCE_UPDATE, onDistanceUpdate)
      .on(SocketEvents.CHAT_END, onChatEnd)
      .on(SocketEvents.DISCONNECT, onDisconnect)

    return () => {
      socket.disconnect()
        .off(SocketEvents.CONNECT, onConnect)
        .off(SocketEvents.DISTANCE_UPDATE, onDistanceUpdate)
        .off(SocketEvents.CHAT_END, onChatEnd)
        .off(SocketEvents.DISCONNECT, onDisconnect)
    }
  }, [])

  return (
    <>
      <Navbar isConnected={isConnected} peerDistance={peerDistance} />
      <div id='app'>
        <Router>
          <Routes>
            <Route element={<LocationProtectedRoutes geoLoc={geoLoc} />}>
              <Route path='/chat' element={<ChatPage socket={socket} />} />
            </Route>
            <Route path='/' element={<Landing geoLoc={geoLoc} />} />
          </Routes>
        </Router >
      </div>
    </>
  )
}

export default App
