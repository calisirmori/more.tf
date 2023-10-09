import './App.css'
import Home from './components/page-components/Home'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from './components/page-components/Profile';
import Logs from './components/page-components/Logs';
import Matches from './components/page-components/Matches';
import SeasonSummary from './components/page-components/SeasonSummary';
import SeasonSummary15 from './components/page-components/SeasonSummary15';
import SeasonSummary16 from './components/page-components/SeasonSummary16';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/profile/:id" element={<Profile />}/>
        <Route path="/profile/:id/matches" element={<Matches />}/>
        <Route path="/log/:id" element={<Logs />}/>
        <Route path="/season-14-summary" element={<SeasonSummary/>}/>
        <Route path="/season-15-summary" element={<SeasonSummary15/>}/>
        <Route path="/season-16-summary" element={<SeasonSummary16/>}/>
      </Routes>
    </Router>
  )
}

export default App
