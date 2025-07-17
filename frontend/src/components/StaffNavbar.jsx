import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList, FaCheckCircle, FaDumbbell, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/staff', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { to: '/staff/pending', label: 'Pending Requests', icon: <FaClipboardList /> },
  { to: '/staff/borrowed', label: 'Borrowed', icon: <FaCheckCircle /> },
  { to: '/staff/equipment', label: 'Equipment', icon: <FaDumbbell /> },
  { to: '/staff/users', label: 'Users', icon: <FaUsers /> },
];

const StaffNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="h-screen w-56 bg-white shadow-lg flex flex-col py-6 px-4 fixed top-0 left-0 z-40">
      <div className="mb-8 text-2xl font-bold text-blue-700 text-center tracking-wide">Staff Panel</div>
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
                isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'
              }`
            }
            end
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        <a href="/staff/assign" className="block px-4 py-2 hover:bg-blue-100 rounded transition">Assign Equipment</a>
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 mt-8 rounded-lg text-red-600 font-semibold hover:bg-red-50 transition-colors duration-150"
      >
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
};

export default StaffNavbar; 