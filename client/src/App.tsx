import './App.css'
import Home from './components/page-components/Home'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from './components/page-components/Profile';
import Logs from './components/page-components/Logs';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/log/:id" element={<Logs />}/>
      </Routes>
    </Router>
  )
}

export default App
