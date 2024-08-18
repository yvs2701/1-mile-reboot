import { io } from 'socket.io-client';
import { GeolocatedConfig } from "react-geolocated"

export const socket = import.meta.env.VITE_SOCKET_URL !== undefined ?
  io(import.meta.env.VITE_SOCKET_URL, { autoConnect: false }) : io({ autoConnect: false });

export const geolocatedOptions: GeolocatedConfig = {
  positionOptions: {
    enableHighAccuracy: true,
  },
  userDecisionTimeout: 10000, // In Firefox, declining location doesn't throw error. Fallback to error state on timeout if it receives no response
  watchPosition: true,
  watchLocationPermissionChange: true,
  suppressLocationOnMount: false,
  isOptimisticGeolocationEnabled: false,
}