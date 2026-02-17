import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WelcomeCreateUser from "./pages/WelcomeCreateUser";
import SelectLevel from "./pages/SelectLevel";
import MainMenu from "./pages/MainMenu";
import DailySession from "./pages/DailySession";
import ReviewSession from "./pages/ReviewSession";
import SessionSummary from "./pages/SessionSummary";
import LevelDiploma from "./pages/LevelDiploma";
import Stats from "./pages/Stats";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/start" replace />} />
        <Route path="/start" element={<WelcomeCreateUser />} />
        <Route path="/level" element={<SelectLevel />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/session" element={<DailySession />} />
        <Route path="/review" element={<ReviewSession />} />
        <Route path="/summary" element={<SessionSummary />} />
        <Route path="/diploma" element={<LevelDiploma />} />
        <Route path="*" element={<Navigate to="/start" replace />} />
        <Route path="/stats" element={<Stats />} />
      </Routes>
    </BrowserRouter>
  );
}
