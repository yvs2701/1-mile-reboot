import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import Landing from './pages/Landing'
import ChatPage from './pages/ChatPage'
import Navbar from './Components/Navbar/Navbar'
import { socket } from "./utils/socket";
import { useEffect, useRef, useState } from 'react';
import { SocketEvents } from './types';
import LocationProtectedRoutes from './Components/ProtectedRoutes/PrivateRoutes';
import { GeolocatedResult, useGeolocated } from 'react-geolocated';
import { geolocatedOptions } from './utils/configs';

function App() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [peerDistance, setPeerDistance] = useState<string | number | null>(null);
  const locReportTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const geoLoc = useGeolocated({
    ...geolocatedOptions,
    onError: (error) => {
      console.group('Geolocation error');
      console.error('Error getting location', error);
      console.groupEnd();
    },
    onSuccess: (position) => {
      console.group('Geolocation position fetched successfully');
      console.error('Error getting location', position.coords);
      console.groupEnd();
    },
  }) as GeolocatedResult & { error: string | null };

  useEffect(() => {
    // FIXME - Firefox is has empty coords object
    if (geoLoc.isGeolocationAvailable && geoLoc.isGeolocationEnabled) {
      console.log('Coords: ', geoLoc.coords);
    }

    const locationReport = () => {
      if (geoLoc.isGeolocationAvailable && geoLoc.isGeolocationEnabled && geoLoc.coords !== undefined &&
        geoLoc.coords.latitude !== undefined && geoLoc.coords.longitude !== undefined) {
        socket.emit(SocketEvents.LOCATION_REPORT, { latitude: geoLoc.coords.latitude, longitude: geoLoc.coords.longitude });
      }

      locReportTimer.current = setTimeout(locationReport, 60000); // report location every minute(= 60000 ms)
    }

    function onChatStart() {
      locationReport();
    }

    function onSkipChat() {
      setPeerDistance(null);
      clearTimeout(locReportTimer.current);
    }
    function onChatEnd() {
      setPeerDistance(null);
      clearTimeout(locReportTimer.current);
    }

    socket
      .on(SocketEvents.CHAT_START, onChatStart)
      .on(SocketEvents.SKIP_CHAT, onSkipChat)
      .on(SocketEvents.CHAT_END, onChatEnd)
    return () => {
      clearTimeout(locReportTimer.current)
      socket
        .off(SocketEvents.CHAT_START, onChatStart)
        .off(SocketEvents.SKIP_CHAT, onSkipChat)
        .off(SocketEvents.CHAT_END, onChatEnd)
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

    function onDisconnect() {
      console.log('Disconnected socket');
      setIsConnected(false);
    }

    socket
      .on(SocketEvents.CONNECT, onConnect)
      .on(SocketEvents.DISTANCE_UPDATE, onDistanceUpdate)
      .on(SocketEvents.DISCONNECT, onDisconnect)

    return () => {
      socket.disconnect()
        .off(SocketEvents.CONNECT, onConnect)
        .off(SocketEvents.DISTANCE_UPDATE, onDistanceUpdate)
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
