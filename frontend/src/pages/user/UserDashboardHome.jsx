import React from 'react';

const UserDashboardHome = () => (
  <div className="pt-20 p-8 min-h-screen bg-gray-50">
    <h1 className="text-3xl font-bold mb-4 text-blue-700">Welcome to Your Dashboard</h1>
    <p className="text-lg text-gray-700 mb-6">Here you can view your borrowed equipment, penalties, and manage your profile. Use the navigation bar above to get started.</p>
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Quick Tips</h2>
      <ul className="list-disc pl-6 text-gray-600">
        <li>Check <b>Borrowed</b> to see your current and past equipment.</li>
        <li>View <b>Penalties</b> for any outstanding issues.</li>
        <li>Update your <b>Profile</b> information as needed.</li>
      </ul>
    </div>
  </div>
);

export default UserDashboardHome; 