import { Navigate, Outlet } from "react-router-dom"
import { GeolocatedResult } from "react-geolocated"

const LocationProtectedRoutes = ({ geoLoc }: {geoLoc: GeolocatedResult}) => {

  return (
    geoLoc.isGeolocationAvailable && geoLoc.isGeolocationEnabled ? <Outlet /> : <Navigate to="/" />
  )
}

export default LocationProtectedRoutes;