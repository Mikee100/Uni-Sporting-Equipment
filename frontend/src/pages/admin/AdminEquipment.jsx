import React, { useEffect, useState, useRef } from 'react';
import { getAllEquipment, createEquipment, updateEquipment, deleteEquipment } from '../../api/equipment';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaDumbbell, FaSearch, FaFileExport, FaExclamationTriangle, FaFilePdf, FaEye, FaEyeSlash } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const emptyForm = { name: '', description: '', quantity: 1, status: 'available', sport: '' };
const COMMON_SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Volleyball', 'Badminton', 'Table Tennis', 'Cricket', 'Rugby', 'Hockey', 'Athletics', 'Swimming', 'Other', 'General'
];

const statusColors = {
  available: 'bg-green-100 text-green-700',
  borrowed: 'bg-blue-100 text-blue-700',
  lost: 'bg-yellow-100 text-yellow-700',
  damaged: 'bg-purple-100 text-purple-700',
};

const AdminEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const formRef = useRef(null);
  const tableRef = useRef(null);
  const [activeSection, setActiveSection] = useState('table');

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      setEquipment(await getAllEquipment());
      setError('');
    } catch (err) {
      setError('Failed to fetch equipment');
    }
    setLoading(false);
  };

  useEffect(() => { fetchEquipment(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.sport) errors.sport = 'Sport is required.';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 1) errors.quantity = 'Quantity must be at least 1.';
    if (!form.status) errors.status = 'Status is required.';
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
      await createEquipment({ ...form, quantity: Number(form.quantity) });
      setForm(emptyForm);
      setSuccessMsg('Equipment added successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add equipment');
    }
    setLoading(false);
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({ name: item.name, description: item.description, quantity: item.quantity, status: item.status, sport: item.sport || '' });
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
      await updateEquipment(editingId, { ...form, quantity: Number(form.quantity) });
      setEditingId(null);
      setForm(emptyForm);
      setSuccessMsg('Equipment updated successfully!');
      setTimeout(() => setSuccessMsg(''), 2000);
      fetchEquipment();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update equipment');
    }
    setLoading(false);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this equipment?')) return;
    setLoading(true);
    try {
      await deleteEquipment(id);
      fetchEquipment();
    } catch (err) {
      setError('Failed to delete equipment');
    }
    setLoading(false);
  };

  // Filtered equipment list
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    let matchesStock = true;
    if (stockFilter === 'in') matchesStock = item.quantity > 0;
    if (stockFilter === 'low') matchesStock = item.quantity > 0 && item.quantity <= 5;
    if (stockFilter === 'out') matchesStock = item.quantity === 0;
    return matchesSearch && matchesStatus && matchesStock;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Description', 'Quantity', 'Status'];
    const rows = filteredEquipment.map(item => [item.name, item.description, item.quantity, item.status]);
    let csvContent = headers.join(',') + '\n' + rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Equipment List', 14, 16);
    const tableColumn = ['Name', 'Description', 'Quantity', 'Status'];
    const tableRows = filteredEquipment.map(item => [item.name, item.description, item.quantity, item.status]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [34, 197, 94] }, // Tailwind green-500
    });
    doc.save('equipment.pdf');
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
          <FaDumbbell className="text-green-600" /> Equipment Management
        </h1>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* In-page nav */}
        <div className="flex gap-4 mb-8 border-b pb-2">
          <button onClick={scrollToTable} className={`px-4 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-150 ${activeSection === 'table' ? 'bg-green-100 text-green-700 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}>Equipment List</button>
          <button onClick={scrollToForm} className={`px-4 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-150 ${activeSection === 'form' ? 'bg-green-100 text-green-700 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-100'}`}>{editingId ? 'Edit Equipment' : 'Add Equipment'}</button>
        </div>
        {/* Add/Edit Equipment Section */}
        {activeSection === 'form' && (
          <div ref={formRef} className="bg-white rounded-xl shadow p-8 mb-8 border-t-4 border-green-500">
            <h2 className="text-xl font-bold mb-4 text-green-700 flex items-center gap-2"><FaPlus /> {editingId ? 'Edit Equipment' : 'Add New Equipment'}</h2>
            {successMsg && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded shadow text-center">{successMsg}</div>}
            <form onSubmit={editingId ? handleUpdate : handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">Name <span className="text-red-500">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Football" className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-200 ${fieldErrors.name ? 'border-red-400' : ''}`} required />
                <p className="text-xs text-gray-500 mt-1">Enter the equipment name.</p>
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Sport <span className="text-red-500">*</span></label>
                <select name="sport" value={form.sport} onChange={handleChange} className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-200 ${fieldErrors.sport ? 'border-red-400' : ''}`} required>
                  <option value="">Select Sport</option>
                  {COMMON_SPORTS.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose the sport category for this equipment.</p>
                {fieldErrors.sport && <p className="text-xs text-red-500 mt-1">{fieldErrors.sport}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Size 5, Adidas" className="border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-200" />
                <p className="text-xs text-gray-500 mt-1">Add a short description (optional).</p>
              </div>
              <div>
                <label className="block font-semibold mb-1">Quantity <span className="text-red-500">*</span></label>
                <input name="quantity" value={form.quantity} onChange={handleChange} placeholder="e.g. 10" className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-200 ${fieldErrors.quantity ? 'border-red-400' : ''}`} type="number" min="1" required />
                <p className="text-xs text-gray-500 mt-1">Enter the available quantity.</p>
                {fieldErrors.quantity && <p className="text-xs text-red-500 mt-1">{fieldErrors.quantity}</p>}
              </div>
              <div>
                <label className="block font-semibold mb-1">Status <span className="text-red-500">*</span></label>
                <select name="status" value={form.status} onChange={handleChange} className={`border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-200 ${fieldErrors.status ? 'border-red-400' : ''}`} required>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="lost">Lost</option>
                  <option value="damaged">Damaged</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Set the current status of the equipment.</p>
                {fieldErrors.status && <p className="text-xs text-red-500 mt-1">{fieldErrors.status}</p>}
              </div>
              <div className="flex items-end gap-2 mt-6">
                <button type="submit" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded shadow disabled:opacity-60" disabled={loading}>
                  {loading && <span className="loader border-t-2 border-b-2 border-white rounded-full w-4 h-4 mr-2 animate-spin"></span>}
                  {editingId ? <FaEdit /> : <FaPlus />} {editingId ? 'Update' : 'Add'}
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
        {/* Equipment List Section */}
        {activeSection === 'table' && (
          <>
            <div ref={tableRef} className="flex flex-wrap gap-3 mb-6 items-center justify-between">
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search equipment..."
                    className="border px-3 py-2 rounded w-48 focus:outline-none focus:ring-2 focus:ring-green-200 pl-9"
                  />
                  <FaSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border px-3 py-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="lost">Lost</option>
                  <option value="damaged">Damaged</option>
                </select>
                <select
                  value={stockFilter}
                  onChange={e => setStockFilter(e.target.value)}
                  className="border px-3 py-2 rounded w-40 focus:outline-none focus:ring-2 focus:ring-green-200"
                >
                  <option value="">All Stock</option>
                  <option value="in">In Stock</option>
                  <option value="low">Low Stock (≤5)</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded shadow">
                  <FaFileExport /> Export CSV
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded shadow">
                  <FaFilePdf /> Export PDF
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow overflow-x-auto mb-10">
              <h2 className="text-xl font-bold px-6 pt-6 pb-2 text-green-700">Equipment List</h2>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                    <th className="py-3 px-4 text-left font-semibold">Sport</th>
                    <th className="py-3 px-4 text-left font-semibold">Description</th>
                    <th className="py-3 px-4 text-left font-semibold">Quantity</th>
                    <th className="py-3 px-4 text-left font-semibold">Status</th>
                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipment.map((item, idx) => (
                    <tr key={item.id} className={
                      `text-center ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition`
                    }>
                      <td className="py-2 px-4 text-left">{item.name}</td>
                      <td className="py-2 px-4 text-left">{item.sport || 'General'}</td>
                      <td className="py-2 px-4 text-left">{item.description}</td>
                      <td className="py-2 px-4 text-left">{item.quantity}</td>
                      <td className="py-2 px-4 text-left">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                      </td>
                      <td className="py-2 px-4 flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-200">
                          <FaEdit /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-red-500 hover:text-red-700 transition px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-200">
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEquipment.length === 0 && (
                    <tr><td colSpan={6} className="py-4 text-gray-500 text-center">No equipment found.</td></tr>
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

export default AdminEquipment; 