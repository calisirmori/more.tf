import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LogsPage from "./pages/LogsPage";
import InvalidPage from "./pages/InvalidPage";
import SeasonSummaryPage from "./pages/SeasonSummaryPage";
import PlayerProfilePage from "./pages/PlayerProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bad-id" element={<InvalidPage />} />
        <Route path="/log/:matchId" element={<LogsPage />} />
        <Route path="/season-summary" element={<SeasonSummaryPage />} />
        <Route path="/player" element={<PlayerProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
