import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getAvailableEquipment, requestBorrow, cancelBorrowRequest, getEquipmentMap } from '../api/equipment';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  borrowed: 'bg-blue-100 text-blue-700',
  returned: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  lost: 'bg-gray-200 text-gray-700',
  damaged: 'bg-purple-100 text-purple-700',
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [borrowed, setBorrowed] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [available, setAvailable] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  // Remove dueDates state and date input logic
  const [canceling, setCanceling] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [borrowedRes, penaltiesRes, availableRes, eqMap] = await Promise.all([
        api.get('/api/borrowed/my'),
        api.get('/api/penalties/my'),
        getAvailableEquipment(),
        getEquipmentMap(),
      ]);
      setBorrowed(borrowedRes.data);
      setPenalties(penaltiesRes.data);
      setAvailable(availableRes);
      setEquipmentMap(eqMap);
      setError('');
    } catch (err) {
      setError('Failed to fetch dashboard data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Prevent duplicate requests for same equipment
  const hasActiveOrPending = (equipment_id) =>
    borrowed.some(b => b.equipment_id === equipment_id && (b.status === 'pending' || b.status === 'borrowed'));

  const handleRequestBorrow = async (equipment_id) => {
    const today = new Date();
    const dueDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const dueDateStr = dueDate.toISOString().slice(0, 10);
    console.log('Requesting to borrow equipment:', equipment_id, dueDateStr);
    setRequesting(equipment_id);
    setSuccessMsg('');
    setError('');
    try {
      await requestBorrow({ equipment_id, due_date: dueDateStr });
      setSuccessMsg(`Request submitted! Pending approval. Due date: ${dueDateStr}`);
      // Optimistically update UI: mark as pending in borrowed
      setBorrowed(prev => ([...prev, {
        id: `pending-${equipment_id}`,
        equipment_id,
        status: 'pending',
        due_date: dueDateStr,
        notes: '',
      }]));
      setAvailable(prev => prev.filter(eq => eq.id !== equipment_id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request borrow');
    }
    setRequesting(null);
  };

  const handleCancelRequest = async (id) => {
    setCanceling(id);
    setSuccessMsg('');
    try {
      await cancelBorrowRequest(id);
      setSuccessMsg('Request cancelled.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request');
    }
    setCanceling(null);
  };

  // Due date picker: allow up to 14 days from today
  const minDate = new Date().toISOString().slice(0, 10);
  const maxDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.name || 'User'}!</h1>
      <p className="mb-6">This is your dashboard. Here you can see your borrowed equipment, request new equipment, and view any penalties.</p>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-center font-medium">{error}</div>}
      {successMsg && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2 text-center font-medium">{successMsg}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Available Equipment</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Description</th>
                    <th className="py-2 px-4 border-b">Quantity</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {available.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-gray-500 text-center">No equipment available for borrowing.</td></tr>
                  )}
                  {available.map(item => (
                    <tr key={item.id} className="text-center">
                      <td className="py-2 px-4 border-b">{item.name}</td>
                      <td className="py-2 px-4 border-b">{item.description}</td>
                      <td className="py-2 px-4 border-b">{item.quantity}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow disabled:opacity-60"
                          disabled={requesting === item.id || hasActiveOrPending(item.id)}
                          onClick={() => {
                            console.log('Button clicked for', item.id);
                            handleRequestBorrow(item.id);
                          }}
                        >
                          {requesting === item.id
                            ? 'Requesting...'
                            : hasActiveOrPending(item.id)
                              ? 'Pending Approval'
                              : 'Request to Borrow'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">My Borrow Requests & Equipment</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Equipment</th>
                    <th className="py-2 px-4 border-b">Borrow Date</th>
                    <th className="py-2 px-4 border-b">Return Date</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Notes</th>
                    <th className="py-2 px-4 border-b">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowed.map(item => (
                    <tr key={item.id} className="text-center">
                      <td className="py-2 px-4 border-b">{equipmentMap[item.equipment_id]?.name || item.equipment_id}</td>
                      <td className="py-2 px-4 border-b">{item.borrow_date ? new Date(item.borrow_date).toLocaleString() : ''}</td>
                      <td className="py-2 px-4 border-b">{item.due_date ? new Date(item.due_date).toLocaleString() : '-'}</td>
                      <td className="py-2 px-4 border-b">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      </td>
                      <td className="py-2 px-4 border-b">{item.notes}</td>
                      <td className="py-2 px-4 border-b">
                        {item.status === 'pending' && (
                          <button
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
                            disabled={canceling === item.id}
                            onClick={() => handleCancelRequest(item.id)}
                          >
                            {canceling === item.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {borrowed.length === 0 && (
                    <tr><td colSpan={6} className="py-4 text-gray-500">No borrowed equipment or requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">My Penalties</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Amount</th>
                    <th className="py-2 px-4 border-b">Reason</th>
                    <th className="py-2 px-4 border-b">Status</th>
                    <th className="py-2 px-4 border-b">Issued At</th>
                  </tr>
                </thead>
                <tbody>
                  {penalties.map(item => (
                    <tr key={item.id} className="text-center">
                      <td className="py-2 px-4 border-b">{item.amount}</td>
                      <td className="py-2 px-4 border-b">{item.reason}</td>
                      <td className="py-2 px-4 border-b capitalize">{item.status}</td>
                      <td className="py-2 px-4 border-b">{item.issued_at ? new Date(item.issued_at).toLocaleString() : ''}</td>
                    </tr>
                  ))}
                  {penalties.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-gray-500 text-center">No penalties found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard; 