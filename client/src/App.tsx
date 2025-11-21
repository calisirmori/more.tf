import './App.css';
import Home from './components/page-components/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Profile from './components/page-components/Profile';
import Logs from './components/page-components/Logs';
import Leaderboard from './components/page-components/leaderboard';
import Matches from './components/page-components/Matches';
import UnifiedSeasonSummary from './components/page-components/UnifiedSeasonSummary';
import Calendar from './components/page-components/Calendar';
import Peers from './components/page-components/peers';
import AdminBadge from './components/page-components/AdminBadge';
import MatchList from './components/page-components/MatchList';
import LogError from './components/page-components/LogError';
import Error from './components/page-components/Error';
import AdminLogin from './components/page-components/AdminLogin';
import AdminDashboard from './components/page-components/AdminDashboard';
import SeasonCardManager from './components/page-components/SeasonCardManager';
import CardCollection from './components/page-components/CardCollection';
import SeasonManagement from './components/page-components/SeasonManagement';
import CardInventory from './components/page-components/CardInventory';
import LogV2 from './components/page-components/v2/log';
import ProfileV2 from './components/page-components/v2/profile';
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
      ReactGA.send({
        hitType: 'pageview',
        page: location.pathname + location.search,
      });
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
        <Route path="/v2/profile/:playerId" element={<ProfileV2 />} />
        <Route path="/v2/profile/:playerId/:tab" element={<ProfileV2 />} />
        <Route path="/peers/:id" element={<Peers />} />
        <Route path="/calendar/:id" element={<Calendar />} />
        <Route path="/log/:id" element={<Logs />} />
        <Route path="/log/v2/:id" element={<LogV2 />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/season-summaries" element={<UnifiedSeasonSummary />} />
        {/* Legacy routes for backwards compatibility */}
        <Route path="/season-14-summary" element={<UnifiedSeasonSummary />} />
        <Route path="/season-15-summary" element={<UnifiedSeasonSummary />} />
        <Route path="/season-16-summary" element={<UnifiedSeasonSummary />} />
        <Route path="/season-summary/:id" element={<UnifiedSeasonSummary />} />
        <Route
          path="/season-summary-ozf/:id"
          element={<UnifiedSeasonSummary />}
        />
        <Route path="/admin-badge" element={<AdminBadge />} />
        <Route path="/officials" element={<MatchList />} />
        <Route path="/log/error" element={<LogError />} />
        <Route path="/error" element={<Error />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/season-cards" element={<SeasonCardManager />} />
        <Route path="/admin/season-management" element={<SeasonManagement />} />
        <Route path="/cards/:steamid" element={<CardCollection />} />
        <Route path="/inventory/:steamid" element={<CardInventory />} />
      </Routes>
    </Router>
  );
}

export default App;
