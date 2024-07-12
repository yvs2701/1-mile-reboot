import { LazyLoadImage } from 'react-lazy-load-image-component'
import styles from './navbar.module.css'
import logo from '../../assets/logo.png'

function Navbar({ isConnected }: { isConnected: boolean }) {

  return (
    <nav className={styles['navbar']}>
      <div className={styles['navbar-left']}>
        <LazyLoadImage effect='blur' src={logo} alt='logo' width={50} height={50} className={styles['navbar-logo']} />
        <h3 className={styles['navbar-brand']}>1-mile</h3>
      </div>
      <div className={styles['navbar-right']}>
        <p>Socket status: {isConnected ? 'connected' : 'not connected'}</p>
      </div>
    </nav>
  )
}

export default Navbar