import React, { useEffect, useState, useRef } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { FaUserPlus, FaUserEdit, FaTrash, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const tableRef = useRef(null);
  const formRef = useRef(null);
  const [activeSection, setActiveSection] = useState('table');

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

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = 'Invalid email address.';
    if (!editingId && !form.password) errors.password = 'Password is required.';
    else if (form.password && form.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    return errors;
  };

  const handleAdd = async e => {
    e.preventDefault();
    setFieldErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await createUser(form);
      setForm(emptyForm);
      setSuccessMsg('User added successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
    setLoading(false);
  };

  const handleEdit = user => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setActiveSection('form');
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleUpdate = async e => {
    e.preventDefault();
    setFieldErrors({});
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await updateUser(editingId, { ...form });
      setEditingId(null);
      setForm(emptyForm);
      setSuccessMsg('User updated successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
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

  // CSV Export
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Role'];
    const rows = users.map(u => [u.name, u.email, u.role]);
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to load logo as base64
  const getLogoBase64 = () => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'Anonymous';
      img.src = '/riara.webp';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/webp'));
      };
      img.onerror = reject;
    });
  };

  // PDF Export (branded)
  const exportPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoBase64 = await getLogoBase64();
    // Header
    doc.addImage(logoBase64, 'WEBP', 40, 18, 60, 60);
    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text('User List', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor('#333');
    doc.text('Generated by Uni Sporting Equipment System', pageWidth / 2, 70, { align: 'center' });
    // Table
    doc.autoTable({
      head: [['Name', 'Email', 'Role']],
      body: users.map(u => [u.name, u.email, u.role]),
      startY: 90,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      didDrawPage: (data) => {
        // Footer
        const date = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.setTextColor('#888');
        doc.text(`Generated: ${date}`, 40, pageHeight - 20);
        doc.text('Uni Sporting Equipment System', pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 60, pageHeight - 20);
      },
    });
    doc.save('users.pdf');
  };

  // Nav click handlers
  const scrollToTable = () => {
    setActiveSection('table');
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollToForm = () => {
    setActiveSection('form');
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="ml-56 min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
          <FaUserPlus className="text-blue-600" /> Manage Users
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* In-page nav */}
        <div className="flex gap-4 mb-8 border-b pb-2">
          <button onClick={scrollToTable} className={`px-4 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-150 ${activeSection === 'table' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>User List</button>
          <button onClick={scrollToForm} className={`px-4 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-150 ${activeSection === 'form' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>{editingId ? 'Edit User' : 'Add User'}</button>
        </div>
        {/* Add/Edit User Section */}
        {activeSection === 'form' && (
          <div ref={formRef} className="bg-white rounded-xl shadow p-8 mb-8 border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">{editingId ? <FaUserEdit /> : <FaUserPlus />} {editingId ? 'Edit User' : 'Add New User'}</h2>
            {successMsg && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded shadow text-center">{successMsg}</div>}
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. John Doe" className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${fieldErrors.name ? 'border-red-400' : ''}`} required />
                <p className="text-xs text-gray-500 mt-1">Enter the user's full name.</p>
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Email <span className="text-red-500">*</span></label>
                <input name="email" value={form.email} onChange={handleChange} placeholder="e.g. user@email.com" className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${fieldErrors.email ? 'border-red-400' : ''}`} required type="email" />
                <p className="text-xs text-gray-500 mt-1">Enter a valid email address.</p>
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>
              <div className="relative">
                <label className="block font-semibold mb-1">Password {editingId ? '' : <span className="text-red-500">*</span>}</label>
                <input name="password" value={form.password} onChange={handleChange} placeholder="At least 8 characters" className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200 pr-10 ${fieldErrors.password ? 'border-red-400' : ''}`} required={editingId ? false : true} type={showPassword ? 'text' : 'password'} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters.</p>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Role <span className="text-red-500">*</span></label>
                <select name="role" value={form.role} onChange={handleChange} className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-200">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="user">User</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Assign a role to the user.</p>
              </div>
              <div className="flex items-end gap-2 mt-6">
                <button type="submit" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow disabled:opacity-60" disabled={loading}>
                  {loading && <span className="loader border-t-2 border-b-2 border-white rounded-full w-4 h-4 mr-2 animate-spin"></span>}
                  {editingId ? <FaUserEdit /> : <FaUserPlus />} {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                  <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setFieldErrors({}); }} className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition text-gray-700 ml-2">
                    <FaTimes /> Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        {/* User List Section */}
        {activeSection === 'table' && (
          <>
            <div ref={tableRef} className="flex gap-2 mb-4 justify-end">
              <button onClick={exportCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold">Export CSV</button>
              <button onClick={exportPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold">Export PDF</button>
            </div>
            <div ref={tableRef} className="bg-white rounded-xl shadow overflow-x-auto">
              <h2 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">User List</h2>
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers; 