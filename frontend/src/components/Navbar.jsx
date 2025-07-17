import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow mb-6">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-700">UniSport</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          {user && user.role === 'admin' && <Link to="/admin" className="hover:underline">Admin</Link>}
          {user && <Link to="/dashboard" className="hover:underline">Dashboard</Link>}
          {!user && <Link to="/login" className="hover:underline">Login</Link>}
          {!user && <Link to="/signup" className="hover:underline">Sign Up</Link>}
          {user && <button onClick={handleLogout} className="ml-2 text-red-600 hover:underline">Logout</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 