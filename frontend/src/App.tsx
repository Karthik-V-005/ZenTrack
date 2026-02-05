import { BrowserRouter, Routes, Route } from "react-router-dom";

import LaunchPage from "./pages/LaunchPage";
import AuthPage from "./pages/AuthPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PrivateRoute from "./routes/PrivateRoute";
import {Dashboard} from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Recommendations } from "./pages/Recommendations";
import { Settings } from "./pages/Settings";
import { LiveUsage } from "./pages/LiveUsage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LaunchPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />

        <Route
          path="/recommendations"
          element={
            <PrivateRoute>
              <Recommendations />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/live-usage"
          element={
            <PrivateRoute>
              <LiveUsage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
