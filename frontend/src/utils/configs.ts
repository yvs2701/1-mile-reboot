import { GeolocatedConfig } from "react-geolocated"

export const geolocatedOptions: GeolocatedConfig = {
  positionOptions: {
    enableHighAccuracy: true,
  },
  userDecisionTimeout: 10000, // In Firefox, declining location doesn't throw error. Fallback to error state on timeout if it receives no response
  watchPosition: true,
  watchLocationPermissionChange: true,
  suppressLocationOnMount: false,
  isOptimisticGeolocationEnabled: false,
  onError: (error) => {
    console.group('Location Error')
    console.error(error)
    console.groupEnd()
  }
}