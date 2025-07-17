import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FaUserTie, FaPlus, FaUndo, FaExclamationTriangle, FaTools, FaCheckCircle, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';
import { fetchPendingBorrowRequests, getPendingBorrowRequests, approveBorrowRequest, rejectBorrowRequest, getEquipmentMap } from '../api/equipment';
import { getAllUsers } from '../api/users';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  };
  const [borrowForm, setBorrowForm] = useState({ user_id: '', equipment_id: '', notes: '', due_date: defaultDueDate() });
  const [notification, setNotification] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({ id: '', status: 'returned', notes: '' });
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [borrowedSearch, setBorrowedSearch] = useState('');
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [equipmentRes, borrowedRes, usersRes] = await Promise.all([
          api.get('/api/equipment'),
          api.get('/api/borrowed'),
          api.get('/api/users?role=user'),
        ]);
        setEquipment(equipmentRes.data);
        setBorrowed(borrowedRes.data);
        setUsers(usersRes.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch dashboard data');
      }
      setLoading(false);
    };
    fetchData();
    fetchPending();
  }, []);

  const handleBorrowChange = e => setBorrowForm({ ...borrowForm, [e.target.name]: e.target.value });

  const handleBorrowSubmit = async e => {
    e.preventDefault();
    try {
      await api.post('/api/borrowed/borrow', borrowForm);
      setNotification('Borrow recorded successfully!');
      setShowBorrowModal(false);
      setBorrowForm({ user_id: '', equipment_id: '', notes: '', due_date: defaultDueDate() });
      // Refresh data
      const [equipmentRes, borrowedRes] = await Promise.all([
        api.get('/api/equipment'),
        api.get('/api/borrowed'),
      ]);
      setEquipment(equipmentRes.data);
      setBorrowed(borrowedRes.data);
    } catch (err) {
      setNotification(err.response?.data?.message || 'Failed to record borrow');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const openReturnModal = (item, status) => {
    setReturnForm({ id: item.id, status, notes: '' });
    setShowReturnModal(true);
  };

  const handleReturnChange = e => setReturnForm({ ...returnForm, [e.target.name]: e.target.value });

  const handleReturnSubmit = async e => {
    e.preventDefault();
    try {
      await api.put(`/api/borrowed/return/${returnForm.id}`, {
        status: returnForm.status,
        notes: returnForm.notes,
      });
      setNotification(`Equipment marked as ${returnForm.status}.`);
      setShowReturnModal(false);
      setReturnForm({ id: '', status: 'returned', notes: '' });
      // Refresh data
      const [equipmentRes, borrowedRes] = await Promise.all([
        api.get('/api/equipment'),
        api.get('/api/borrowed'),
      ]);
      setEquipment(equipmentRes.data);
      setBorrowed(borrowedRes.data);
    } catch (err) {
      setNotification(err.response?.data?.message || 'Failed to update status');
    }
    setTimeout(() => setNotification(''), 3000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/equipment/${id}`, { ...equipment.find(eq => eq.id === id), status: newStatus });
      setNotification('Equipment status updated.');
      // Refresh equipment
      const equipmentRes = await api.get('/api/equipment');
      setEquipment(equipmentRes.data);
    } catch (err) {
      setNotification(err.response?.data?.message || 'Failed to update status');
    }
    setTimeout(() => setNotification(''), 3000);
  };

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

  const statusColors = {
    borrowed: 'bg-blue-100 text-blue-700',
    returned: 'bg-green-100 text-green-700',
    lost: 'bg-yellow-100 text-yellow-700',
    damaged: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaUserTie className="text-3xl text-blue-600" />
          <h1 className="text-2xl font-extrabold">Welcome, {user?.name || 'Staff'}!</h1>
        </div>
        <p className="mb-6 text-gray-600 text-lg">Manage equipment and borrowing transactions below.</p>
        {notification && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded shadow">{notification}</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <div className="mb-8 flex justify-end">
          <button onClick={() => setShowBorrowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow">
            <FaPlus /> Record Borrow
          </button>
        </div>
        {/* Borrow Modal */}
        {showBorrowModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow max-w-md w-full relative">
              <button onClick={() => setShowBorrowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"><FaTimesCircle size={22} /></button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaPlus /> Record Borrow</h2>
              <form onSubmit={handleBorrowSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">User</label>
                  <select name="user_id" value={borrowForm.user_id} onChange={handleBorrowChange} className="w-full border rounded px-2 py-1" required>
                    <option value="">Select user</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Equipment</label>
                  <select name="equipment_id" value={borrowForm.equipment_id} onChange={handleBorrowChange} className="w-full border rounded px-2 py-1" required>
                    <option value="">Select equipment</option>
                    {equipment.filter(eq => eq.status === 'available').map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Due Date</label>
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    <input type="date" name="due_date" value={borrowForm.due_date} onChange={handleBorrowChange} className="w-full border rounded px-2 py-1" required />
                  </div>
                </div>
                <div>
                  <label className="block mb-1">Notes</label>
                  <input name="notes" value={borrowForm.notes} onChange={handleBorrowChange} className="w-full border rounded px-2 py-1" placeholder="Optional notes" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowBorrowModal(false)} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition text-gray-700">
                    <FaTimesCircle /> Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow">
                    <FaPlus /> Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow max-w-md w-full relative">
              <button onClick={() => setShowReturnModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"><FaTimesCircle size={22} /></button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaUndo /> Mark as {returnForm.status.charAt(0).toUpperCase() + returnForm.status.slice(1)}</h2>
              <form onSubmit={handleReturnSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Notes</label>
                  <input name="notes" value={returnForm.notes} onChange={handleReturnChange} className="w-full border rounded px-2 py-1" placeholder="Optional notes" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowReturnModal(false)} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition text-gray-700">
                    <FaTimesCircle /> Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow">
                    <FaUndo /> Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Equipment Search */}
        <div className="mb-2 flex justify-end">
          <input
            type="text"
            placeholder="Search equipment..."
            className="border px-2 py-1 rounded"
            value={equipmentSearch}
            onChange={e => setEquipmentSearch(e.target.value)}
          />
        </div>
        {/* Equipment Table */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FaTools className="text-xl text-green-600" />
            <h2 className="text-xl font-bold">All Equipment</h2>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Name</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">Quantity</th>
                  <th className="py-2 px-4 border-b">Status</th>
                </tr>
              </thead>
              <tbody>
                {equipment.filter(item =>
                  item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                  item.description?.toLowerCase().includes(equipmentSearch.toLowerCase())
                ).map(item => (
                  <tr key={item.id} className="text-center">
                    <td className="py-2 px-4 border-b">{item.name}</td>
                    <td className="py-2 px-4 border-b">{item.description}</td>
                    <td className="py-2 px-4 border-b">{item.quantity}</td>
                    <td className="py-2 px-4 border-b capitalize">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                    </td>
                  </tr>
                ))}
                {equipment.filter(item =>
                  item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
                  item.description?.toLowerCase().includes(equipmentSearch.toLowerCase())
                ).length === 0 && (
                  <tr><td colSpan={4} className="py-4 text-gray-500">No equipment found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Borrowed Search */}
        <div className="mb-2 flex justify-end">
          <input
            type="text"
            placeholder="Search borrowed..."
            className="border px-2 py-1 rounded"
            value={borrowedSearch}
            onChange={e => setBorrowedSearch(e.target.value)}
          />
        </div>
        {/* Borrowed Table */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FaCheckCircle className="text-xl text-blue-600" />
            <h2 className="text-xl font-bold">Active Borrowed Equipment</h2>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">User ID</th>
                  <th className="py-2 px-4 border-b">Equipment ID</th>
                  <th className="py-2 px-4 border-b">Borrow Date</th>
                  <th className="py-2 px-4 border-b">Due Date</th>
                  <th className="py-2 px-4 border-b">Status</th>
                  <th className="py-2 px-4 border-b">Notes</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {borrowed.filter(item =>
                  item.status === 'borrowed' && (
                    String(item.user_id).includes(borrowedSearch) ||
                    String(item.equipment_id).includes(borrowedSearch) ||
                    (item.notes && item.notes.toLowerCase().includes(borrowedSearch.toLowerCase()))
                  )
                ).map(item => {
                  const isOverdue = item.due_date && new Date(item.due_date) < new Date();
                  return (
                    <tr key={item.id} className={`text-center${isOverdue ? ' bg-red-100' : ''}`}>
                      <td className="py-2 px-4 border-b">{item.user_id}</td>
                      <td className="py-2 px-4 border-b">{item.equipment_id}</td>
                      <td className="py-2 px-4 border-b">{item.borrow_date ? item.borrow_date.slice(0, 10) : ''}</td>
                      <td className="py-2 px-4 border-b font-semibold">
                        {item.due_date ? item.due_date.slice(0, 10) : ''}
                        {isOverdue && <span className="ml-2 px-2 py-0.5 rounded bg-red-500 text-white text-xs flex items-center gap-1"><FaExclamationTriangle /> Overdue</span>}
                      </td>
                      <td className="py-2 px-4 border-b capitalize">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      </td>
                      <td className="py-2 px-4 border-b">{item.notes}</td>
                      <td className="py-2 px-4 border-b flex flex-wrap gap-2 justify-center">
                        <button onClick={() => openReturnModal(item, 'returned')} className="flex items-center gap-1 text-green-600 hover:text-green-800 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-200"><FaUndo /> Return</button>
                        <button onClick={() => openReturnModal(item, 'lost')} className="flex items-center gap-1 text-yellow-700 hover:text-yellow-900 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200"><FaExclamationTriangle /> Lost</button>
                        <button onClick={() => openReturnModal(item, 'damaged')} className="flex items-center gap-1 text-purple-700 hover:text-purple-900 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-200"><FaTools /> Damaged</button>
                      </td>
                    </tr>
                  );
                })}
                {borrowed.filter(item =>
                  item.status === 'borrowed' && (
                    String(item.user_id).includes(borrowedSearch) ||
                    String(item.equipment_id).includes(borrowedSearch) ||
                    (item.notes && item.notes.toLowerCase().includes(borrowedSearch.toLowerCase()))
                  )
                ).length === 0 && (
                  <tr><td colSpan={7} className="py-4 text-gray-500">No borrowed equipment found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Add this section before or after the main dashboard content */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-2">Pending Borrow Requests</h2>
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
    </div>
  );
};

export default StaffDashboard; 