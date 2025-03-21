import './App.css';
import Home from './components/page-components/Home';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Profile from './components/page-components/Profile';
import Logs from './components/page-components/Logs';
import Leaderboard from './components/page-components/leaderboard';
import Matches from './components/page-components/Matches';
import SeasonSummary from './components/page-components/SeasonSummary';
import SeasonSummary15 from './components/page-components/SeasonSummary15';
import SeasonSummary16 from './components/page-components/SeasonSummary16';
import Calendar from './components/page-components/calendar';
import Peers from './components/page-components/peers';
import AdminBadge from './components/page-components/AdminBadge';
import MatchList from './components/page-components/MatchList';
import SeasonSummaryOzf from './components/page-components/SeasonSummaryOzf';
import LogError from './components/page-components/LogError';
import Error from './components/page-components/Error';
import ReactGA from 'react-ga4';
import { useEffect } from 'react';

const trackingId = import.meta.env.VITE_GA_TRACKING_ID;

// Initialize Google Analytics if the tracking ID is available
if (trackingId) {
  ReactGA.initialize(trackingId);
}

const TrackPageView = () => {
  const location = useLocation();

  useEffect(() => {
    if (trackingId) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }
  }, [location]);

  return null;
};

function App() {
  return (
    <Router>
      <TrackPageView />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:id/matches" element={<Matches />} />
        <Route path="/peers/:id" element={<Peers />} />
        <Route path="/calendar/:id" element={<Calendar />} />
        <Route path="/log/:id" element={<Logs />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/season-14-summary" element={<SeasonSummary />} />
        <Route path="/season-15-summary" element={<SeasonSummary15 />} />
        <Route path="/season-16-summary" element={<SeasonSummary16 />} />
        <Route path="/season-summary/:id" element={<SeasonSummary16 />} />
        <Route path="/season-summary-ozf/:id" element={<SeasonSummaryOzf />} />
        <Route path="/admin-badge" element={<AdminBadge />} />
        <Route path="/officials" element={<MatchList />} />
        <Route path="/log/error" element={<LogError />} />
        <Route path="/error" element={<Error />} />
      </Routes>
    </Router>
  );
}

export default App;
