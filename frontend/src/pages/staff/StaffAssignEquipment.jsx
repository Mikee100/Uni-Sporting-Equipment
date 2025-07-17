import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const StaffAssignEquipment = () => {
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({ user_id: '', equipment_id: '', due_date: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch users and available equipment
    const fetchData = async () => {
      try {
        const [usersRes, equipmentRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/equipment'),
        ]);
        setUsers(usersRes.data.filter(u => u.role === 'user'));
        setEquipment(equipmentRes.data.filter(eq => eq.status === 'available' && eq.quantity > 0));
      } catch (err) {
        setError('Failed to fetch users or equipment');
      }
    };
    fetchData();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      if (!form.user_id || !form.equipment_id || !form.due_date) {
        setError('Please fill all required fields.');
        setLoading(false);
        return;
      }
      await api.post('/api/borrowed/borrow', form);
      setSuccess('Equipment assigned successfully!');
      setForm({ user_id: '', equipment_id: '', due_date: '', notes: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign equipment');
    }
    setLoading(false);
  };

  return (
    <div className="ml-56 p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Assign Equipment to User</h1>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-xl">
        <div className="mb-4">
          <label className="block font-semibold mb-1">User <span className="text-red-500">*</span></label>
          <select name="user_id" value={form.user_id} onChange={handleChange} className="border px-3 py-2 rounded w-full" required>
            <option value="">Select user...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Equipment <span className="text-red-500">*</span></label>
          <select name="equipment_id" value={form.equipment_id} onChange={handleChange} className="border px-3 py-2 rounded w-full" required>
            <option value="">Select equipment...</option>
            {equipment.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.sport})</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Due Date <span className="text-red-500">*</span></label>
          <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="border px-3 py-2 rounded w-full" required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} className="border px-3 py-2 rounded w-full" rows={2} placeholder="Optional notes..." />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow font-semibold" disabled={loading}>
          {loading ? 'Assigning...' : 'Assign Equipment'}
        </button>
      </form>
    </div>
  );
};

export default StaffAssignEquipment; 