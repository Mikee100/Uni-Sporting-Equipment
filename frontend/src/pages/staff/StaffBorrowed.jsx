import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FaCheckCircle, FaUndo, FaExclamationTriangle, FaTools, FaTimesCircle, FaCalendarAlt } from 'react-icons/fa';

const statusColors = {
  borrowed: 'bg-blue-100 text-blue-700',
  returned: 'bg-green-100 text-green-700',
  lost: 'bg-yellow-100 text-yellow-700',
  damaged: 'bg-purple-100 text-purple-700',
};

const StaffBorrowed = () => {
  const [borrowed, setBorrowed] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowedSearch, setBorrowedSearch] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnForm, setReturnForm] = useState({ id: '', status: 'returned', notes: '' });
  const [notification, setNotification] = useState('');

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
        setError('Failed to fetch borrowed equipment data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

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

  return (
    <div className="ml-56 p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaCheckCircle className="text-blue-600" /> All Borrowed Equipment</h1>
      {notification && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded shadow">{notification}</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-2 flex justify-end">
        <input
          type="text"
          placeholder="Search borrowed..."
          className="border px-2 py-1 rounded"
          value={borrowedSearch}
          onChange={e => setBorrowedSearch(e.target.value)}
        />
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
    </div>
  );
};

export default StaffBorrowed; 