import { LazyLoadImage } from 'react-lazy-load-image-component';
import logo from '../../assets/logo.png'

function Navbar({ isConnected }: { isConnected: boolean }) {

  return (
    <nav className={'navbar'}>
      <div className={'navbar-left'}>
        <LazyLoadImage effect='blur' src={logo} alt='logo' width={50} height={50} className={'navbar-logo'} />
        <h3 className={'navbar-brand'}>1-mile</h3>
      </div>
      <div className={'navbar-right'}>
        <p>Socket status: {isConnected ? 'connected' : 'not connected'}</p>
      </div>
    </nav>
  )
}

export default Navbar