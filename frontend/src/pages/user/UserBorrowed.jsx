import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { getAvailableEquipment, requestBorrow, cancelBorrowRequest, getEquipmentMap } from '../../api/equipment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  borrowed: 'bg-blue-100 text-blue-700',
  returned: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  lost: 'bg-gray-200 text-gray-700',
  damaged: 'bg-purple-100 text-purple-700',
};

const TABS = [
  { key: 'available', label: 'Available Equipment' },
  { key: 'borrowed', label: 'My Borrow Requests & Equipment' },
  { key: 'current', label: 'Currently Borrowed' }, // NEW TAB
];

const COMMON_SPORTS = [
  'All Sports', 'Football', 'Basketball', 'Tennis', 'Volleyball', 'Badminton', 'Table Tennis', 'Cricket', 'Rugby', 'Hockey', 'Athletics', 'Swimming', 'Other'
];

const UserBorrowed = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [borrowed, setBorrowed] = useState([]);
  const [available, setAvailable] = useState([]);
  const [equipmentMap, setEquipmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [canceling, setCanceling] = useState(null);
  const [returning, setReturning] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toReturnId, setToReturnId] = useState(null);
  const [selectedSport, setSelectedSport] = useState('All Sports');

  const fetchData = async (sportFilter = selectedSport) => {
    setLoading(true);
    try {
      let availableRes;
      if (sportFilter && sportFilter !== 'All Sports') {
        availableRes = await api.get(`/api/equipment?sport=${encodeURIComponent(sportFilter)}`);
        availableRes = availableRes.data;
      } else {
        availableRes = await getAvailableEquipment();
      }
      const [borrowedRes, eqMap] = await Promise.all([
        api.get('/api/borrowed/my'),
        getEquipmentMap(),
      ]);
      setBorrowed(borrowedRes.data);
      setAvailable(availableRes);
      setEquipmentMap(eqMap);
      setError('');
    } catch (err) {
      setError('Failed to fetch borrowed equipment data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(selectedSport);
    // eslint-disable-next-line
  }, [selectedSport]);

  // Prevent duplicate requests for same equipment
  const hasActiveOrPending = (equipment_id) =>
    borrowed.some(b => b.equipment_id === equipment_id && (b.status === 'pending' || b.status === 'borrowed'));

  const handleRequestBorrow = async (equipment_id) => {
    const today = new Date();
    const dueDate = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
    const dueDateStr = dueDate.toISOString().slice(0, 10);
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

  const handleReturn = async (id) => {
    setReturning(id);
    setSuccessMsg('');
    setError('');
    try {
      await api.put(`/api/borrowed/return/${id}`, { status: 'returned' });
      setSuccessMsg('Equipment marked as returned.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark as returned');
    }
    setReturning(null);
    setShowConfirm(false);
    setToReturnId(null);
  };

  // CSV Export for Available Equipment
  const exportAvailableCSV = () => {
    const headers = ['Name', 'Sport', 'Description', 'Quantity'];
    const rows = available.map(item => [item.name, item.sport || 'General', item.description, item.quantity]);
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'available_equipment.csv');
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

  // PDF Export for Available Equipment (branded)
  const exportAvailablePDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'WEBP', 40, 18, 60, 60);
    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text('Available Equipment', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor('#333');
    doc.text('Generated by Uni Sporting Equipment System', pageWidth / 2, 70, { align: 'center' });
    doc.autoTable({
      head: [['Name', 'Sport', 'Description', 'Quantity']],
      body: available.map(item => [item.name, item.sport || 'General', item.description, item.quantity]),
      startY: 90,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      didDrawPage: (data) => {
        const date = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.setTextColor('#888');
        doc.text(`Generated: ${date}`, 40, pageHeight - 20);
        doc.text('Uni Sporting Equipment System', pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 60, pageHeight - 20);
      },
    });
    doc.save('available_equipment.pdf');
  };
  // CSV Export for Borrowed Equipment
  const exportBorrowedCSV = () => {
    const headers = ['Name', 'Status', 'Due Date', 'Notes'];
    const rows = borrowed.map(item => [equipmentMap[item.equipment_id]?.name || '', item.status, item.due_date || '', item.notes || '']);
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'my_borrowed_equipment.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // PDF Export for Borrowed Equipment (branded)
  const exportBorrowedPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const logoBase64 = await getLogoBase64();
    doc.addImage(logoBase64, 'WEBP', 40, 18, 60, 60);
    doc.setFontSize(22);
    doc.setTextColor('#2563eb');
    doc.text('My Borrowed Equipment', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor('#333');
    doc.text('Generated by Uni Sporting Equipment System', pageWidth / 2, 70, { align: 'center' });
    doc.autoTable({
      head: [['Name', 'Status', 'Due Date', 'Notes']],
      body: borrowed.map(item => [equipmentMap[item.equipment_id]?.name || '', item.status, item.due_date || '', item.notes || '']),
      startY: 90,
      margin: { left: 40, right: 40 },
      styles: { fontSize: 11, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 245, 255] },
      didDrawPage: (data) => {
        const date = new Date().toLocaleString();
        doc.setFontSize(10);
        doc.setTextColor('#888');
        doc.text(`Generated: ${date}`, 40, pageHeight - 20);
        doc.text('Uni Sporting Equipment System', pageWidth / 2, pageHeight - 20, { align: 'center' });
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 60, pageHeight - 20);
      },
    });
    doc.save('my_borrowed_equipment.pdf');
  };

  return (
    <div className="pt-20 max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8 text-blue-700">My Borrowed Equipment</h1>
      {/* Tab Navbar */}
      <div className="flex gap-2 mb-8 border-b">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 font-semibold rounded-t-md focus:outline-none transition-colors duration-150
              ${activeTab === tab.key ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            style={{ borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent' }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-center font-medium">{error}</div>}
      {successMsg && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2 text-center font-medium">{successMsg}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Available Equipment Tab */}
          {activeTab === 'available' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Available Equipment</h2>
              {/* Sport Filter Dropdown */}
              <div className="mb-4 flex items-center gap-2">
                <label htmlFor="sport-filter" className="font-semibold text-gray-700">Filter by Sport:</label>
                <select
                  id="sport-filter"
                  className="border rounded px-3 py-1"
                  value={selectedSport}
                  onChange={e => setSelectedSport(e.target.value)}
                >
                  {COMMON_SPORTS.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mb-4 justify-end">
                <button onClick={exportAvailableCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold">Export CSV</button>
                <button onClick={exportAvailablePDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold">Export PDF</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Sport</th>
                      <th className="py-2 px-4 border-b">Description</th>
                      <th className="py-2 px-4 border-b">Quantity</th>
                      <th className="py-2 px-4 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {available.length === 0 && (
                      <tr><td colSpan={5} className="py-4 text-gray-500 text-center">No equipment available for borrowing.</td></tr>
                    )}
                    {available.map(item => (
                      <tr key={item.id} className="text-center">
                        <td className="py-2 px-4 border-b">{item.name}</td>
                        <td className="py-2 px-4 border-b">{item.sport || 'General'}</td>
                        <td className="py-2 px-4 border-b">{item.description}</td>
                        <td className="py-2 px-4 border-b">{item.quantity}</td>
                        <td className="py-2 px-4 border-b">
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded shadow disabled:opacity-60"
                            disabled={requesting === item.id || hasActiveOrPending(item.id)}
                            onClick={() => handleRequestBorrow(item.id)}
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
          )}
          {/* Borrow Requests & Equipment Tab */}
          {activeTab === 'borrowed' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-700">My Borrow Requests & Equipment</h2>
              <div className="flex gap-2 mb-4 justify-end">
                <button onClick={exportBorrowedCSV} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow font-semibold">Export CSV</button>
                <button onClick={exportBorrowedPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold">Export PDF</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded">
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
          )}
          {/* Currently Borrowed Tab */}
          {activeTab === 'current' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4 text-blue-700">Currently Borrowed Equipment</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Equipment</th>
                      <th className="py-2 px-4 border-b">Due Date</th>
                      <th className="py-2 px-4 border-b">Status</th>
                      <th className="py-2 px-4 border-b">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {borrowed.filter(item => item.status === 'borrowed').length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-gray-500 text-center">No equipment currently borrowed.</td>
                      </tr>
                    )}
                    {borrowed.filter(item => item.status === 'borrowed').map(item => (
                      <tr key={item.id} className="text-center">
                        <td className="py-2 px-4 border-b">{equipmentMap[item.equipment_id]?.name || item.equipment_id}</td>
                        <td className="py-2 px-4 border-b">{item.due_date ? new Date(item.due_date).toLocaleString() : '-'}</td>
                        <td className="py-2 px-4 border-b">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                        </td>
                        <td className="py-2 px-4 border-b">
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow disabled:opacity-60"
                            disabled={returning === item.id}
                            onClick={() => { setShowConfirm(true); setToReturnId(item.id); }}
                          >
                            {returning === item.id ? 'Returning...' : 'Mark as Returned'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-xl max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Return</h3>
            <p className="mb-4">Are you sure you want to mark this equipment as returned?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => { setShowConfirm(false); setToReturnId(null); }}
              >Cancel</button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => handleReturn(toReturnId)}
                disabled={returning === toReturnId}
              >{returning === toReturnId ? 'Returning...' : 'Yes, Return'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBorrowed; 