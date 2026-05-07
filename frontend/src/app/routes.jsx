import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "../features/map/pages/HomePage.jsx";
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import SignupPage from "../features/auth/pages/SignupPage.jsx";
import DashboardPage from "../features/auth/pages/DashboardPage.jsx";
import ProtectedRoute from "../shared/components/ProtectedRoute.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}

export default AppRoutes;
