import React, { useEffect, useState } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { FaUserPlus, FaUserEdit, FaTrash, FaTimes } from 'react-icons/fa';

const emptyForm = { name: '', email: '', password: '', role: 'user' };

const roleColors = {
  admin: 'bg-blue-100 text-blue-700',
  staff: 'bg-green-100 text-green-700',
  user: 'bg-purple-100 text-purple-700',
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      setUsers(await getAllUsers());
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(form);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
    setLoading(false);
  };

  const handleEdit = user => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUser(editingId, { ...form });
      setEditingId(null);
      setForm(emptyForm);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user?')) return;
    setLoading(true);
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
    setLoading(false);
  };

  return (
    <div className="ml-56 min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
          <FaUserPlus className="text-blue-600" /> Manage Users
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="flex flex-wrap gap-3 items-end">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border px-3 py-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-200" required />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border px-3 py-2 rounded w-52 focus:outline-none focus:ring-2 focus:ring-blue-200" required type="email" />
            <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="border px-3 py-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-blue-200" required={editingId ? false : true} type="password" />
            <select name="role" value={form.role} onChange={handleChange} className="border px-3 py-2 rounded w-32 focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="user">User</option>
            </select>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow" disabled={loading}>
              {editingId ? <FaUserEdit /> : <FaUserPlus />} {editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition text-gray-700 ml-2">
                <FaTimes /> Cancel
              </button>
            )}
          </form>
        </div>
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 text-left font-semibold">Name</th>
                <th className="py-3 px-4 text-left font-semibold">Email</th>
                <th className="py-3 px-4 text-left font-semibold">Role</th>
                <th className="py-3 px-4 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user.id} className={
                  `text-center ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`
                }>
                  <td className="py-2 px-4 text-left">{user.name}</td>
                  <td className="py-2 px-4 text-left">{user.email}</td>
                  <td className="py-2 px-4 text-left">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleColors[user.role] || 'bg-gray-200 text-gray-700'}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                  </td>
                  <td className="py-2 px-4 flex justify-center gap-2">
                    <button onClick={() => handleEdit(user)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-200">
                      <FaUserEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-200">
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-gray-500 text-center">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers; 