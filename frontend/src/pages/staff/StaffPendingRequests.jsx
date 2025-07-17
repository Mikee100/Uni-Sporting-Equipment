import React, { useEffect, useState } from 'react';
import { fetchPendingBorrowRequests, approveBorrowRequest, rejectBorrowRequest, getEquipmentMap } from '../../api/equipment';
import { getAllUsers } from '../../api/users';

const StaffPendingRequests = () => {
  const [pending, setPending] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [pendingError, setPendingError] = useState('');
  const [pendingSuccess, setPendingSuccess] = useState('');

  const fetchPending = async () => {
    setPendingLoading(true);
    try {
      const [pending, eqMap, users] = await Promise.all([
        fetchPendingBorrowRequests(),
        getEquipmentMap(),
        getAllUsers(),
      ]);
      setPending(pending);
      setEquipmentMap(eqMap);
      const uMap = {};
      users.forEach(u => { uMap[u.id] = u; });
      setUserMap(uMap);
      setPendingError('');
    } catch (err) {
      setPendingError('Failed to fetch pending requests.');
    }
    setPendingLoading(false);
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (id) => {
    setPendingActionId(id);
    setPendingSuccess('');
    try {
      await approveBorrowRequest(id);
      setPendingSuccess('Request approved.');
      fetchPending();
    } catch (err) {
      setPendingError('Failed to approve request.');
    }
    setPendingActionId(null);
  };

  const handleReject = async (id) => {
    setPendingActionId(id);
    setPendingSuccess('');
    try {
      await rejectBorrowRequest(id);
      setPendingSuccess('Request rejected.');
      fetchPending();
    } catch (err) {
      setPendingError('Failed to reject request.');
    }
    setPendingActionId(null);
  };

  return (
    <div className="ml-56 p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">Pending Borrow Requests</h1>
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        {pendingError && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-center font-medium">{pendingError}</div>}
        {pendingSuccess && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2 text-center font-medium">{pendingSuccess}</div>}
        {pendingLoading ? <div>Loading...</div> : (
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
                        disabled={pendingActionId === req.id}
                        onClick={() => handleApprove(req.id)}
                      >
                        {pendingActionId === req.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
                        disabled={pendingActionId === req.id}
                        onClick={() => handleReject(req.id)}
                      >
                        {pendingActionId === req.id ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffPendingRequests; 