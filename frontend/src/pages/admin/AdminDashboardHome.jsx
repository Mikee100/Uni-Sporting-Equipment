import React from 'react';

const AdminDashboardHome = () => (
  <div className="ml-56 p-8 min-h-screen bg-gray-50">
    <h1 className="text-3xl font-bold mb-4 text-blue-700">Admin Dashboard</h1>
    <p className="text-lg text-gray-700 mb-6">Welcome to the admin dashboard! Use the navigation sidebar to manage users, equipment, penalties, and view reports and analytics.</p>
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Quick Tips</h2>
      <ul className="list-disc pl-6 text-gray-600">
        <li>Manage <b>Users</b> and their roles.</li>
        <li>Oversee <b>Equipment</b> inventory and status.</li>
        <li>Handle <b>Penalties</b> for overdue or lost items.</li>
        <li>Access <b>Reports</b> and <b>Analytics</b> for insights.</li>
      </ul>
    </div>
  </div>
);

export default AdminDashboardHome; 