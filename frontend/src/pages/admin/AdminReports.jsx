import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AdminReports = () => {
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [bySport, setBySport] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      const [mb, bs, od, pen, tu] = await Promise.all([
        api.get('/api/reports/most-borrowed', { params }),
        api.get('/api/reports/borrowing-by-sport', { params }),
        api.get('/api/reports/overdue', { params }),
        api.get('/api/reports/penalties-summary', { params }),
        api.get('/api/reports/top-users', { params }),
      ]);
      setMostBorrowed(mb.data);
      setBySport(bs.data);
      setOverdue(od.data);
      setPenalties(pen.data);
      setTopUsers(tu.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch reports');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, []);

  // Handle date filter submit
  const handleDateFilter = e => {
    e.preventDefault();
    fetchReports();
  };

  // CSV export helper
  const exportCSV = (headers, rows, filename) => {
    const csvContent = [headers.join(','), ...rows.map(r => r.map(x => `"${x ?? ''}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // PDF export helper
  const exportPDF = (title, headers, rows, filename) => {
    const doc = new jsPDF();
    doc.text(title, 14, 16);
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] }, // Tailwind blue-700
    });
    doc.save(filename);
  };

  const maxBorrow = Math.max(...bySport.map(s => s.borrow_count), 1);

  return (
    <div className="ml-56 max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">System Reports</h1>
      {/* Date Range Filter */}
      <form onSubmit={handleDateFilter} className="flex flex-wrap gap-4 items-end mb-8">
        <div>
          <label className="block text-sm font-semibold mb-1">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border px-3 py-2 rounded" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold">Apply Filter</button>
        {(startDate || endDate) && (
          <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setStartDate(''); setEndDate(''); fetchReports('', ''); }}>Clear</button>
        )}
      </form>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}
      {loading ? <div>Loading reports...</div> : (
        <div className="space-y-10">
          {/* Most Borrowed Equipment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-700">Most Borrowed Equipment</h2>
              <div className="flex gap-2">
                <button onClick={() => exportCSV(['Name', 'Sport', 'Times Borrowed'], mostBorrowed.map(eq => [eq.name, eq.sport, eq.borrow_count]), 'most_borrowed.csv')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
                <button onClick={() => exportPDF('Most Borrowed Equipment', ['Name', 'Sport', 'Times Borrowed'], mostBorrowed.map(eq => [eq.name, eq.sport, eq.borrow_count]), 'most_borrowed.pdf')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Export PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Sport</th>
                    <th className="py-2 px-4 border-b">Times Borrowed</th>
                  </tr>
                </thead>
                <tbody>
                  {mostBorrowed.map(eq => (
                    <tr key={eq.id} className="text-center">
                      <td className="py-2 px-4 border-b">{eq.name}</td>
                      <td className="py-2 px-4 border-b">{eq.sport}</td>
                      <td className="py-2 px-4 border-b">{eq.borrow_count}</td>
                    </tr>
                  ))}
                  {mostBorrowed.length === 0 && <tr><td colSpan={3} className="py-4 text-gray-500">No data.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Borrowing by Sport (Bar Chart) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-700">Borrowing by Sport</h2>
              <div className="flex gap-2">
                <button onClick={() => exportCSV(['Sport', 'Times Borrowed'], bySport.map(s => [s.sport, s.borrow_count]), 'borrowing_by_sport.csv')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
                <button onClick={() => exportPDF('Borrowing by Sport', ['Sport', 'Times Borrowed'], bySport.map(s => [s.sport, s.borrow_count]), 'borrowing_by_sport.pdf')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Export PDF</button>
              </div>
            </div>
            <div className="bg-white rounded shadow p-4">
              {bySport.length === 0 ? <div className="text-gray-500">No data.</div> : (
                <svg width="100%" height={bySport.length * 32}>
                  {bySport.map((s, i) => (
                    <g key={s.sport}>
                      <rect x={0} y={i * 32} width={`${(s.borrow_count / maxBorrow) * 400}`} height={24} fill="#2563eb" rx={4} />
                      <text x={8} y={i * 32 + 16} fill="#fff" fontSize={14} alignmentBaseline="middle">{s.sport}</text>
                      <text x={12 + (s.borrow_count / maxBorrow) * 400} y={i * 32 + 16} fill="#2563eb" fontSize={14} alignmentBaseline="middle">{s.borrow_count}</text>
                    </g>
                  ))}
                </svg>
              )}
            </div>
          </div>

          {/* Overdue Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-700">Overdue Borrowed Equipment</h2>
              <div className="flex gap-2">
                <button onClick={() => exportCSV(['User', 'Email', 'Equipment', 'Sport', 'Due Date'], overdue.map(item => [item.user_name, item.email, item.equipment_name, item.sport, item.due_date]), 'overdue_items.csv')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
                <button onClick={() => exportPDF('Overdue Borrowed Equipment', ['User', 'Email', 'Equipment', 'Sport', 'Due Date'], overdue.map(item => [item.user_name, item.email, item.equipment_name, item.sport, item.due_date]), 'overdue_items.pdf')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Export PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">User</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Equipment</th>
                    <th className="py-2 px-4 border-b">Sport</th>
                    <th className="py-2 px-4 border-b">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map(item => (
                    <tr key={item.id} className="text-center">
                      <td className="py-2 px-4 border-b">{item.user_name}</td>
                      <td className="py-2 px-4 border-b">{item.email}</td>
                      <td className="py-2 px-4 border-b">{item.equipment_name}</td>
                      <td className="py-2 px-4 border-b">{item.sport}</td>
                      <td className="py-2 px-4 border-b">{item.due_date ? new Date(item.due_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                  {overdue.length === 0 && <tr><td colSpan={5} className="py-4 text-gray-500">No overdue items.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Penalties Summary */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-700">Penalties Summary</h2>
              <div className="flex gap-2">
                <button onClick={() => exportCSV(['Reason', 'Count', 'Total Amount'], penalties.map(p => [p.reason, p.count, p.total_amount]), 'penalties_summary.csv')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
                <button onClick={() => exportPDF('Penalties Summary', ['Reason', 'Count', 'Total Amount'], penalties.map(p => [p.reason, p.count, p.total_amount]), 'penalties_summary.pdf')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Export PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Reason</th>
                    <th className="py-2 px-4 border-b">Count</th>
                    <th className="py-2 px-4 border-b">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {penalties.map(p => (
                    <tr key={p.reason} className="text-center">
                      <td className="py-2 px-4 border-b">{p.reason}</td>
                      <td className="py-2 px-4 border-b">{p.count}</td>
                      <td className="py-2 px-4 border-b">${p.total_amount}</td>
                    </tr>
                  ))}
                  {penalties.length === 0 && <tr><td colSpan={3} className="py-4 text-gray-500">No penalties.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Users */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-blue-700">Top Users (Most Borrowed)</h2>
              <div className="flex gap-2">
                <button onClick={() => exportCSV(['Name', 'Email', 'Times Borrowed'], topUsers.map(u => [u.name, u.email, u.borrow_count]), 'top_users.csv')} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Export CSV</button>
                <button onClick={() => exportPDF('Top Users (Most Borrowed)', ['Name', 'Email', 'Times Borrowed'], topUsers.map(u => [u.name, u.email, u.borrow_count]), 'top_users.pdf')} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">Export PDF</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b">Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Times Borrowed</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map(u => (
                    <tr key={u.id} className="text-center">
                      <td className="py-2 px-4 border-b">{u.name}</td>
                      <td className="py-2 px-4 border-b">{u.email}</td>
                      <td className="py-2 px-4 border-b">{u.borrow_count}</td>
                    </tr>
                  ))}
                  {topUsers.length === 0 && <tr><td colSpan={3} className="py-4 text-gray-500">No data.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports; 