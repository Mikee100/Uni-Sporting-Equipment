import React from 'react';

const StaffDashboardHome = () => (
  <div className="ml-56 p-8 min-h-screen bg-gray-50">
    <h1 className="text-3xl font-bold mb-4 text-blue-700">Staff Dashboard</h1>
    <p className="text-lg text-gray-700 mb-6">Welcome to the staff dashboard! Use the navigation sidebar to manage equipment, view pending requests, and handle user activities efficiently.</p>
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Quick Tips</h2>
      <ul className="list-disc pl-6 text-gray-600">
        <li>Check <b>Pending Requests</b> to approve or reject borrow requests.</li>
        <li>Manage <b>Equipment</b> inventory and status.</li>
        <li>View all <b>Borrowed</b> equipment and their return status.</li>
        <li>Access <b>Users</b> to see student and staff accounts.</li>
      </ul>
    </div>
  </div>
);

export default StaffDashboardHome; 