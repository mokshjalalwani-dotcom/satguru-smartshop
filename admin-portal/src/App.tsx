import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import ExecutiveLayout from "./layout/ExecutiveLayout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DashboardProvider } from "./context/DashboardContext";
import SmartAlertSystem from "./components/SmartAlertSystem";

// Auth & Shared
import Login from "./pages/Login";

// Admin Strategic Modules
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import InventoryIntelligence from "./pages/admin/InventoryIntelligence";
import SalesAnalytics from "./pages/admin/SalesAnalytics";
import TaskScheduler from "./pages/admin/TaskScheduler";
import CalendarIntegration from "./pages/admin/CalendarIntegration";
import FestivalAlerts from "./pages/admin/FestivalAlerts";
import TeamManagement from "./pages/admin/TeamManagement";
import TargetManagement from "./pages/admin/TargetManagement";
import StoreSettings from "./pages/admin/StoreSettings";

// Executive Operational Modules
import SalesProcessing from "./pages/executive/SalesProcessing";
import InventoryUpdates from "./pages/executive/InventoryUpdates";
import TaskExecution from "./pages/executive/TaskExecution";
import AlertNotifications from "./pages/executive/AlertNotifications";
import MyTargets from "./pages/executive/MyTargets";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) return <Login />;

  return (
    <>
      <SmartAlertSystem />
      <Routes>
        {/* Admin Strategic Portal */}
        {user?.role === 'Admin' && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<InventoryIntelligence />} />
            <Route path="analytics" element={<SalesAnalytics />} />
            <Route path="tasks" element={<TaskScheduler />} />
            <Route path="calendar" element={<CalendarIntegration />} />
            <Route path="festivals" element={<FestivalAlerts />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="targets" element={<TargetManagement />} />
            <Route path="settings" element={<StoreSettings />} />
            <Route path="users" element={<Users />} />
          </Route>
        )}

        {/* Executive Operational Portal */}
        {(user?.role === 'Executive' || user?.role === 'Admin') && (
          <Route path="/executive" element={<ExecutiveLayout />}>
            <Route index element={<Navigate to="sales" replace />} />
            <Route path="sales" element={<SalesProcessing />} />
            <Route path="inventory" element={<InventoryUpdates />} />
            <Route path="tasks" element={<TaskExecution />} />
            <Route path="alerts" element={<AlertNotifications />} />
            <Route path="targets" element={<MyTargets />} />
          </Route>
        )}

        {/* Global Fallback Redirects */}
        <Route path="/" element={<Navigate to={user?.role === 'Admin' ? "/admin" : "/executive"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <AppRoutes />
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
