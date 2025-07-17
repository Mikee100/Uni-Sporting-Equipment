import React from 'react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="pt-20 max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">My Profile</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Name</label>
          <div className="px-3 py-2 border rounded bg-gray-50">{user?.name || '-'}</div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Email</label>
          <div className="px-3 py-2 border rounded bg-gray-50">{user?.email || '-'}</div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 font-semibold mb-1">Role</label>
          <div className="px-3 py-2 border rounded bg-gray-50 capitalize">{user?.role || '-'}</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6 text-gray-500 text-center">
        Profile editing functionality coming soon.
      </div>
    </div>
  );
};

export default UserProfile; 