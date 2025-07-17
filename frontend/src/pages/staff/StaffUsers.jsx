import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FaUsers } from 'react-icons/fa';

const StaffUsers = () => {
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/users?role=user');
        setUsers(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch users');
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="ml-56 p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaUsers className="text-blue-600" /> User Management</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-2 flex justify-end">
        <input
          type="text"
          placeholder="Search users..."
          className="border px-2 py-1 rounded"
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(user =>
              user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
              user.email.toLowerCase().includes(userSearch.toLowerCase())
            ).map(user => (
              <tr key={user.id} className="text-center">
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b capitalize">{user.role}</td>
              </tr>
            ))}
            {users.filter(user =>
              user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
              user.email.toLowerCase().includes(userSearch.toLowerCase())
            ).length === 0 && (
              <tr><td colSpan={3} className="py-4 text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffUsers; 