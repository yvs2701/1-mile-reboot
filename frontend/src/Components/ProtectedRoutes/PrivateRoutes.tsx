import { Navigate, Outlet } from "react-router-dom"
import { GeolocatedResult } from "react-geolocated"

const LocationProtectedRoutes = ({ geoLoc }: { geoLoc: GeolocatedResult }) => {

  return (
    geoLoc.isGeolocationAvailable && geoLoc.isGeolocationEnabled && geoLoc.coords !== undefined &&
      geoLoc.coords.latitude !== undefined && geoLoc.coords.longitude !== undefined ? <Outlet /> : <Navigate to="/" />
  )
}

export default LocationProtectedRoutes;