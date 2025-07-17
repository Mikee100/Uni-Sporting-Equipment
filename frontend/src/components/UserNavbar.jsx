import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaClipboardList, FaExclamationTriangle, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/user', label: 'Dashboard', icon: <FaHome /> },
  { to: '/user/borrowed', label: 'Borrowed', icon: <FaClipboardList /> },
  { to: '/user/penalties', label: 'Penalties', icon: <FaExclamationTriangle /> },
  { to: '/user/profile', label: 'Profile', icon: <FaUser /> },
];

const UserNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white shadow flex items-center px-6 py-3 gap-6 fixed top-0 left-0 z-30">
      <div className="text-xl font-bold text-blue-700 mr-8">User Panel</div>
      <div className="flex gap-4 flex-1">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors duration-150 ${
                isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
            end
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors duration-150"
      >
        <FaSignOutAlt /> Logout
      </button>
    </nav>
  );
};

export default UserNavbar; 