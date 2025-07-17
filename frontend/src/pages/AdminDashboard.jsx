import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaUsers, FaDumbbell, FaExclamationTriangle, FaChartBar, FaUserShield } from 'react-icons/fa';
import { getPendingBorrowRequests, approveBorrowRequest, rejectBorrowRequest, getEquipmentMap } from '../api/equipment';
import { getAllUsers } from '../api/users';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, eqMap, users] = await Promise.all([
        getPendingBorrowRequests(),
        getEquipmentMap(),
        getAllUsers(),
      ]);
      setPending(pendingRes);
      setEquipmentMap(eqMap);
      const uMap = {};
      users.forEach(u => { uMap[u.id] = u; });
      setUserMap(uMap);
      setError('');
    } catch (err) {
      setError('Failed to fetch pending requests.');
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    setSuccess('');
    try {
      await approveBorrowRequest(id);
      setSuccess('Request approved.');
      fetchData();
    } catch (err) {
      setError('Failed to approve request.');
    }
    setActionId(null);
  };

  const handleReject = async (id) => {
    setActionId(id);
    setSuccess('');
    try {
      await rejectBorrowRequest(id);
      setSuccess('Request rejected.');
      fetchData();
    } catch (err) {
      setError('Failed to reject request.');
    }
    setActionId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaUserShield className="text-4xl text-blue-600" />
          <h1 className="text-3xl font-extrabold">Welcome, {user?.name || 'Admin'}!</h1>
        </div>
        <p className="mb-8 text-gray-600 text-lg">Your admin dashboard. Manage the system using the sections below.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <Link to="/admin/users" className="group block bg-white hover:bg-blue-50 transition p-6 rounded-xl shadow flex items-center gap-4">
            <FaUsers className="text-3xl text-blue-500 group-hover:text-blue-700 transition" />
            <span className="font-semibold text-lg">Manage Users</span>
          </Link>
          <Link to="/admin/equipment" className="group block bg-white hover:bg-green-50 transition p-6 rounded-xl shadow flex items-center gap-4">
            <FaDumbbell className="text-3xl text-green-500 group-hover:text-green-700 transition" />
            <span className="font-semibold text-lg">Manage Equipment</span>
          </Link>
          <Link to="/admin/penalties" className="group block bg-white hover:bg-yellow-50 transition p-6 rounded-xl shadow flex items-center gap-4">
            <FaExclamationTriangle className="text-3xl text-yellow-500 group-hover:text-yellow-700 transition" />
            <span className="font-semibold text-lg">Manage Penalties</span>
          </Link>
          <Link to="/admin/reports" className="group block bg-white hover:bg-purple-50 transition p-6 rounded-xl shadow flex items-center gap-4">
            <FaChartBar className="text-3xl text-purple-500 group-hover:text-purple-700 transition" />
            <span className="font-semibold text-lg">View Reports</span>
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-2">Pending Borrow Requests</h2>
          {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-center font-medium">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2 text-center font-medium">{success}</div>}
          {loading ? <div>Loading...</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Student</th>
                    <th className="py-2 px-4 border-b">Equipment</th>
                    <th className="py-2 px-4 border-b">Due Date</th>
                    <th className="py-2 px-4 border-b">Notes</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-gray-500 text-center">No pending requests.</td></tr>
                  )}
                  {pending.map(req => (
                    <tr key={req.id} className="text-center">
                      <td className="py-2 px-4 border-b">{userMap[req.user_id]?.name || req.user_id}</td>
                      <td className="py-2 px-4 border-b">{equipmentMap[req.equipment_id]?.name || req.equipment_id}</td>
                      <td className="py-2 px-4 border-b">{req.due_date ? new Date(req.due_date).toLocaleDateString() : '-'}</td>
                      <td className="py-2 px-4 border-b">{req.notes}</td>
                      <td className="py-2 px-4 border-b flex gap-2 justify-center">
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
                          disabled={actionId === req.id}
                          onClick={() => handleApprove(req.id)}
                        >
                          {actionId === req.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
                          disabled={actionId === req.id}
                          onClick={() => handleReject(req.id)}
                        >
                          {actionId === req.id ? 'Processing...' : 'Reject'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-2">Quick Stats</h2>
          <div className="text-gray-400">(Stats coming soon...)</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 