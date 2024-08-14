import { LazyLoadImage } from 'react-lazy-load-image-component'
import styles from './navbar.module.css'
import logo from '../../assets/logo.png'

function Navbar({ isConnected, peerDistance }: { isConnected: boolean, peerDistance: string | number | null }) {

  return (
    <nav className={styles['navbar']}>
      <div className={styles['navbar-left']}>
        <LazyLoadImage effect='blur' src={logo} alt='logo' width={50} height={50} className={styles['navbar-logo']} />
        <h3 className={styles['navbar-brand']}>1-mile</h3>
      </div>
      <div className={styles['navbar-right']}>
        <span>
          Socket: {isConnected ? 'connected' : 'not connected'}
          {' '}
          Distance: {peerDistance !== null ? peerDistance : '--'}km
        </span>
      </div>
    </nav>
  )
}

export default Navbar