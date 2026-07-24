import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard";
import FarmPage from "../pages/farm/Farm";
import IncomePage from "../pages/income/Income";
import ExpensePage from "../pages/expense/Expense";
import ActivityPage from "../pages/activity/Activity";
import Weather from "../pages/weather/Weather";
import Market from "../pages/market/Market";
import ProfilePage from "../pages/profile/Profile";
import BillPage from "../pages/bill/Bill";
import ReportPage from "../pages/report/Report";
import AIAssistant from "../pages/ai/AIAssistant";

import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes (Redirect authenticated users to /dashboard) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes (Redirect unauthenticated users to /login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/farm" element={<FarmPage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/expense" element={<ExpensePage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/market" element={<Market />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/bills" element={<BillPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/ai" element={<AIAssistant />} />
            </Route>
          </Route>

          {/* Catch-all Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;