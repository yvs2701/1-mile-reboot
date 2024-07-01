import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom'
import './App.css'
import Login from './pages/Login'

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' Component={Login} />
        </Routes>
      </Router>
    </>
  )
}

export default App
