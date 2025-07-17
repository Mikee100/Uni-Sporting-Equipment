import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminNavbar from './components/AdminNavbar';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminPenalties from './pages/admin/AdminPenalties';
import AdminReports from './pages/admin/AdminReports';
import AdminReportsAnalytics from './pages/admin/AdminReportsAnalytics';
import Navbar from './components/Navbar';
import Users from './pages/admin/Users';
import Equipment from './pages/admin/Equipment';
import Penalties from './pages/admin/Penalties';
import Reports from './pages/admin/Reports';
import UserNavbar from './components/UserNavbar';
import UserDashboardHome from './pages/user/UserDashboardHome';
import UserBorrowed from './pages/user/UserBorrowed';
import UserPenalties from './pages/user/UserPenalties';
import UserProfile from './pages/user/UserProfile';
import StaffNavbar from './components/StaffNavbar';
import StaffDashboardHome from './pages/staff/StaffDashboardHome';
import StaffPendingRequests from './pages/staff/StaffPendingRequests';
import StaffBorrowed from './pages/staff/StaffBorrowed';
import StaffEquipment from './pages/staff/StaffEquipment';
import StaffUsers from './pages/staff/StaffUsers';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import { FaDumbbell } from 'react-icons/fa';

// Placeholder pages
const Home = () => (
  <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
      <FaDumbbell className="text-5xl text-blue-600 mb-4" />
      <h1 className="text-3xl font-extrabold mb-2 text-gray-800 text-center">Uni Sporting Equipment System</h1>
      <p className="mb-6 text-gray-600 text-center">Welcome! Please login or sign up to manage and borrow sporting equipment easily.</p>
      <div className="flex gap-4 w-full justify-center">
        <a href="/login" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition text-center">Login</a>
        <a href="/signup" className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg shadow transition text-center">Sign Up</a>
      </div>
    </div>
  </div>
);
const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'user') return <Navigate to="/user" />;
  if (user.role === 'staff') return <Navigate to="/staff" />;
  return <div>Unknown role</div>;
};

// Protected route wrapper
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Admin-only route wrapper
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

// User-only route wrapper
const UserRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'user') return <Navigate to="/dashboard" />;
  return children;
};

// Staff-only route wrapper
const StaffRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'staff') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        {/* User routes with top navbar */}
        <Route path="/user/*" element={
          <UserRoute>
            <div>
              <UserNavbar />
              <Routes>
                <Route path="" element={<UserDashboardHome />} />
                <Route path="borrowed" element={<UserBorrowed />} />
                <Route path="penalties" element={<UserPenalties />} />
                <Route path="profile" element={<UserProfile />} />
              </Routes>
            </div>
          </UserRoute>
        } />
        {/* Admin routes with sidebar */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <div>
              <AdminNavbar />
              <Routes>
                <Route path="" element={<AdminDashboardHome />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="equipment" element={<AdminEquipment />} />
                <Route path="penalties" element={<AdminPenalties />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reports-analytics" element={<AdminReportsAnalytics />} />
              </Routes>
            </div>
          </AdminRoute>
        } />
        {/* Staff routes with sidebar */}
        <Route path="/staff/*" element={
          <StaffRoute>
            <div>
              <StaffNavbar />
              <Routes>
                <Route path="" element={<StaffDashboardHome />} />
                <Route path="pending" element={<StaffPendingRequests />} />
                <Route path="borrowed" element={<StaffBorrowed />} />
                <Route path="equipment" element={<StaffEquipment />} />
                <Route path="users" element={<StaffUsers />} />
              </Routes>
            </div>
          </StaffRoute>
        } />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
