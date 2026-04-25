import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import WelcomeCreateUser from "./pages/WelcomeCreateUser";
import SelectLevel from "./pages/SelectLevel";
import MainMenu from "./pages/MainMenu";
import DailySession from "./pages/DailySession";
import ReviewSession from "./pages/ReviewSession";
import SessionSummary from "./pages/SessionSummary";
import Stats from "./pages/Stats";
import LevelDiploma from "./pages/LevelDiploma";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pantallas públicas */}
        <Route path="/" element={<WelcomeCreateUser />} />
        <Route path="/start" element={<WelcomeCreateUser />} />

        {/* Solo requiere usuario */}
        <Route
          path="/level"
          element={
            <ProtectedRoute requireUser>
              <SelectLevel />
            </ProtectedRoute>
          }
        />

        {/* Requieren usuario + nivel */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute requireUser requireLevel>
              <MainMenu />
            </ProtectedRoute>
          }
        />

        <Route
          path="/session"
          element={
            <ProtectedRoute requireUser requireLevel>
              <DailySession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/review"
          element={
            <ProtectedRoute requireUser requireLevel>
              <ReviewSession />
            </ProtectedRoute>
          }
        />

        <Route
          path="/summary"
          element={
            <ProtectedRoute requireUser requireLevel>
              <SessionSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stats"
          element={
            <ProtectedRoute requireUser requireLevel>
              <Stats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diploma"
          element={
            <ProtectedRoute requireUser requireLevel>
              <LevelDiploma />
            </ProtectedRoute>
          }
        />

        {/* Ruta fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;