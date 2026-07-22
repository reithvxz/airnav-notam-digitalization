import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotamProvider } from './context/NotamContext';
import { EventReminderProvider } from './context/EventReminderContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CreateNotam from './pages/CreateNotam';
import AccountManagement from './pages/AccountManagement';
import CreateBriefing from './pages/CreateBriefing';
import CreatePostShift from './pages/CreatePostShift';
import ShiftSettings from './pages/ShiftSettings';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole, requireSuperAdmin }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} />;
  }
  
  if (requireSuperAdmin) {
    const isSuperAdmin = ['DY', 'IB', 'YD', 'AY', 'IW'].includes(user.initial);
    if (!isSuperAdmin) {
      return <Navigate to="/admin/dashboard" />;
    }
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-notam" 
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateNotam />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/accounts" 
          element={
            <ProtectedRoute allowedRole="admin" requireSuperAdmin={true}>
              <AccountManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/settings/shift" 
          element={
            <ProtectedRoute allowedRole="admin">
              <ShiftSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-briefing" 
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateBriefing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-postshift" 
          element={
            <ProtectedRoute allowedRole="admin">
              <CreatePostShift />
            </ProtectedRoute>
          } 
        />
        {/* Employee Routes */}
        <Route 
          path="/employee/dashboard" 
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotamProvider>
        <EventReminderProvider>
          <Router>
            <AppRoutes />
          </Router>
        </EventReminderProvider>
      </NotamProvider>
    </AuthProvider>
  );
}

export default App;
