import { GeolocatedResult } from "react-geolocated";
import { Link } from "react-router-dom";

function Landing({ geoLoc }: { geoLoc: GeolocatedResult }) {
  if (!geoLoc.isGeolocationAvailable) {
    return (
      <>
        <h1>Geolocation is not available!</h1>
        <p>Geolocation is not available on this browser.</p>
      </>
    )
  }

  if (!geoLoc.isGeolocationEnabled) {
    return (
      <>
        <h1>Geolocation is not enabled!</h1>
        <p>Please click on the below button to allow geolocation.</p>
        <button onClick={() => geoLoc.getPosition()}>Allow</button>
      </>
    )
  }

  return (
    <>
      <h1>Welcome to Chat App!</h1>
      <p>Click on the below button to start chatting.</p>
      {
        (
          geoLoc.coords !== undefined && geoLoc.coords.latitude !== undefined && geoLoc.coords.longitude !== undefined &&
          <Link to={'/chat'}>Start Chatting</Link>
        ) || (
          <p>Fetching location...</p>
        )
      }
    </>
  )
}

export default Landing;
