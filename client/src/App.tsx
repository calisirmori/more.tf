import './App.css'
import Home from './components/page-components/Home'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from './components/page-components/Profile';
import Logs from './components/page-components/Logs';
import Matches from './components/page-components/Matches';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/profile/:id" element={<Profile />}/>
        <Route path="/profile/:id/matches" element={<Matches />}/>
        <Route path="/log/:id" element={<Logs />}/>
      </Routes>
    </Router>
  )
}

export default App
