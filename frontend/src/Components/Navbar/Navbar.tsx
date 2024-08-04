import { LazyLoadImage } from 'react-lazy-load-image-component'
import styles from './navbar.module.css'
import logo from '../../assets/logo.png'
import { GeolocatedResult } from 'react-geolocated'

function Navbar({ isConnected, geoLoc }: { isConnected: boolean, geoLoc: GeolocatedResult }) {

  return (
    <nav className={styles['navbar']}>
      <div className={styles['navbar-left']}>
        <LazyLoadImage effect='blur' src={logo} alt='logo' width={50} height={50} className={styles['navbar-logo']} />
        <h3 className={styles['navbar-brand']}>1-mile</h3>
      </div>
      <div className={styles['navbar-right']}>
        <span>Socket : {isConnected ? 'connected' : 'not connected'}</span>
        <span>{geoLoc.coords?.latitude}, {geoLoc.coords?.longitude}</span>
      </div>
    </nav>
  )
}

export default Navbar