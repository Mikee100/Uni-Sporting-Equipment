import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const Reports = () => {
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [bySport, setBySport] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const [mb, bs, od, pen, tu] = await Promise.all([
          api.get('/api/reports/most-borrowed'),
          api.get('/api/reports/borrowing-by-sport'),
          api.get('/api/reports/overdue'),
          api.get('/api/reports/penalties-summary'),
          api.get('/api/reports/top-users'),
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
    fetchReports();
  }, []);

  // Simple bar chart for borrowing by sport
  const maxBorrow = Math.max(...bySport.map(s => s.borrow_count), 1);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">System Reports</h1>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}
      {loading ? <div>Loading reports...</div> : (
        <div className="space-y-10">
          {/* Most Borrowed Equipment */}
          <div>
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Most Borrowed Equipment</h2>
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
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Borrowing by Sport</h2>
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
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Overdue Borrowed Equipment</h2>
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
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Penalties Summary</h2>
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
            <h2 className="text-xl font-semibold mb-2 text-blue-700">Top Users (Most Borrowed)</h2>
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

export default Reports; 