import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import ChatPage from './pages/Chat'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/chat' Component={ChatPage} />
          <Route path='/' Component={Login} />
        </Routes>
      </Router>
    </>
  )
}

export default App
