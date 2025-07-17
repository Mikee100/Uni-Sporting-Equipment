import React, { useEffect, useState } from 'react';
import { getAllPenalties, createPenalty, updatePenalty, deletePenalty } from '../../api/penalties';
import { FaGavel, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';

const emptyForm = { user_id: '', borrowed_equipment_id: '', amount: '', reason: '', status: 'unpaid' };

const statusColors = {
  unpaid: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  waived: 'bg-purple-100 text-purple-700',
};

const typeColors = {
  Auto: 'bg-blue-100 text-blue-700',
  Manual: 'bg-gray-100 text-gray-700',
};

const AdminPenalties = () => {
  const [penalties, setPenalties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchPenalties = async () => {
    setLoading(true);
    try {
      setPenalties(await getAllPenalties());
      setError('');
    } catch (err) {
      setError('Failed to fetch penalties');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPenalties(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPenalty({ ...form, amount: Number(form.amount), type: 'Manual' });
      setForm(emptyForm);
      setShowModal(false);
      fetchPenalties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add penalty');
    }
    setLoading(false);
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      user_id: item.user_id,
      borrowed_equipment_id: item.borrowed_equipment_id,
      amount: item.amount,
      reason: item.reason,
      status: item.status
    });
    setShowModal(true);
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePenalty(editingId, { ...form, amount: Number(form.amount) });
      setEditingId(null);
      setForm(emptyForm);
      setShowModal(false);
      fetchPenalties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update penalty');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this penalty?')) return;
    setLoading(true);
    try {
      await deletePenalty(id);
      fetchPenalties();
    } catch (err) {
      setError('Failed to delete penalty');
    }
    setLoading(false);
  };

  // Determine penalty type (Auto/Manual) based on reason or other logic
  const getPenaltyType = (item) => {
    if (['Equipment lost', 'Equipment damaged', 'Late return'].includes(item.reason)) return 'Auto';
    return 'Manual';
  };

  return (
    <div className="ml-56 min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
          <FaGavel className="text-yellow-600" /> Manage Penalties
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-6 flex justify-end">
          <button onClick={() => { setShowModal(true); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 transition text-white px-4 py-2 rounded shadow">
            <FaPlus /> Give Manual Penalty
          </button>
        </div>
        {/* Modal for Manual Penalty */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button onClick={() => { setShowModal(false); setEditingId(null); setForm(emptyForm); }} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><FaTimes size={20} /></button>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">{editingId ? <FaEdit /> : <FaPlus />} {editingId ? 'Edit Penalty' : 'Give Manual Penalty'}</h2>
              <form onSubmit={editingId ? handleUpdate : handleAdd} className="flex flex-col gap-4">
                <input name="user_id" value={form.user_id} onChange={handleChange} placeholder="User ID" className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200" required />
                <input name="borrowed_equipment_id" value={form.borrowed_equipment_id} onChange={handleChange} placeholder="Borrowed Equipment ID" className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200" required />
                <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200" type="number" min="0" required />
                <input name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200" required />
                <select name="status" value={form.status} onChange={handleChange} className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200">
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                </select>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => { setShowModal(false); setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition text-gray-700">
                    <FaTimes /> Cancel
                  </button>
                  <button type="submit" className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 transition text-white px-4 py-2 rounded shadow" disabled={loading}>
                    {editingId ? <FaEdit /> : <FaPlus />} {editingId ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left font-semibold">User ID</th>
                <th className="py-3 px-4 text-left font-semibold">Borrowed Equipment ID</th>
                <th className="py-3 px-4 text-left font-semibold">Amount</th>
                <th className="py-3 px-4 text-left font-semibold">Reason</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map((item, idx) => (
                <tr key={item.id} className={
                  `text-center ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-yellow-50 transition`
                }>
                  <td className="py-2 px-4 text-left">{item.user_id}</td>
                  <td className="py-2 px-4 text-left">{item.borrowed_equipment_id}</td>
                  <td className="py-2 px-4 text-left">{item.amount}</td>
                  <td className="py-2 px-4 text-left">{item.reason}</td>
                  <td className="py-2 px-4 text-left">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                  </td>
                  <td className="py-2 px-4 text-left">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeColors[getPenaltyType(item)]}`}>{getPenaltyType(item)}</span>
                  </td>
                  <td className="py-2 px-4 flex justify-center gap-2">
                    <button onClick={() => handleEdit(item)} className="flex items-center gap-1 text-yellow-700 hover:text-yellow-900 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-200">
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-200">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {penalties.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-gray-500 text-center">No penalties found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPenalties; 