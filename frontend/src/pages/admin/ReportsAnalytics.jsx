import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { FaChartPie, FaHistory, FaBoxes, FaFileExport, FaClipboardList, FaExclamationCircle, FaUsers } from 'react-icons/fa';

const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#e11d48', '#a21caf', '#fbbf24', '#14b8a6', '#6366f1'];

const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [borrowingTrend, setBorrowingTrend] = useState([]);
  const [penaltyTrend, setPenaltyTrend] = useState([]);
  const [sportPopularity, setSportPopularity] = useState([]);
  const [lossDamage, setLossDamage] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAnalytics = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      const [summary, bt, pt, sp, ld, au, ls] = await Promise.all([
        api.get('/api/reports/summary'),
        api.get('/api/reports/analytics/borrowing-trend', { params }),
        api.get('/api/reports/analytics/penalty-trend', { params }),
        api.get('/api/reports/borrowing-by-sport', { params }),
        api.get('/api/reports/analytics/loss-damage-rate', { params }),
        api.get('/api/reports/analytics/active-users', { params }),
        api.get('/api/reports/analytics/low-stock'),
      ]);
      setStats(summary.data);
      setBorrowingTrend(bt.data);
      setPenaltyTrend(pt.data);
      setSportPopularity(sp.data);
      setLossDamage(ld.data);
      setActiveUsers(au.data);
      setLowStock(ls.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch analytics');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, []);

  const handleDateFilter = e => {
    e.preventDefault();
    fetchAnalytics();
  };

  // Prepare penalty trend for stacked bar chart
  const penaltyReasons = Array.from(new Set(penaltyTrend.map(p => p.reason)));
  const penaltyDataByDate = Object.values(
    penaltyTrend.reduce((acc, p) => {
      if (!acc[p.date]) acc[p.date] = { date: p.date };
      acc[p.date][p.reason] = p.count;
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FaChartPie className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-extrabold">Reports & Analytics</h1>
        </div>
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
            <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setStartDate(''); setEndDate(''); fetchAnalytics('', ''); }}>Clear</button>
          )}
        </form>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="text-lg text-gray-500">Loading...</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <FaBoxes className="text-3xl text-green-500 mb-2" />
                <div className="text-2xl font-bold">{stats?.total_equipment ?? '--'}</div>
                <div className="text-gray-600">Total Equipment</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <FaClipboardList className="text-3xl text-yellow-500 mb-2" />
                <div className="text-2xl font-bold">{stats?.active_borrows ?? '--'}</div>
                <div className="text-gray-600">Active Borrows</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
                <FaExclamationCircle className="text-3xl text-purple-500 mb-2" />
                <div className="text-2xl font-bold">{stats?.unpaid_penalties ?? '--'}</div>
                <div className="text-gray-600">Unpaid Penalties</div>
              </div>
            </div>
            {/* Most Borrowed Equipment Highlight */}
            <div className="mb-10">
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl shadow flex flex-col items-center max-w-md mx-auto">
                <div className="text-lg font-semibold text-gray-700 mb-1">Most Borrowed Equipment</div>
                <div className="text-2xl font-bold text-purple-700">{stats?.most_borrowed_equipment?.name ?? '--'}</div>
                {stats?.most_borrowed_equipment && (
                  <div className="text-sm text-gray-600 mt-1">Borrowed {stats.most_borrowed_equipment.count} times</div>
                )}
              </div>
            </div>
            {/* Analytics Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Borrowing Trend */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="font-semibold mb-2 flex items-center gap-2"><FaHistory className="text-blue-500" /> Borrowing Trend</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={borrowingTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#2563eb" name="Borrows" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Penalty Trend */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="font-semibold mb-2 flex items-center gap-2"><FaExclamationCircle className="text-purple-500" /> Penalty Trend</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={penaltyDataByDate} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {penaltyReasons.map((reason, idx) => (
                      <Bar key={reason} dataKey={reason} stackId="a" fill={COLORS[idx % COLORS.length]} name={reason} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Sport Popularity */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="font-semibold mb-2 flex items-center gap-2"><FaChartPie className="text-blue-500" /> Sport Popularity</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={sportPopularity} dataKey="borrow_count" nameKey="sport" cx="50%" cy="50%" outerRadius={80} label>
                      {sportPopularity.map((entry, idx) => (
                        <Cell key={entry.sport} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Active Users Trend */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="font-semibold mb-2 flex items-center gap-2"><FaUsers className="text-green-500" /> Active Users</div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={activeUsers} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="active_users" stroke="#22c55e" name="Active Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Equipment Loss/Damage Rate */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <FaExclamationCircle className="text-xl text-red-500" />
                <h2 className="text-xl font-bold">Equipment Loss/Damage Rate</h2>
              </div>
              <div className="overflow-x-auto bg-white rounded-xl shadow p-6">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Sport</th>
                      <th className="py-2 px-4 border-b">Lost</th>
                      <th className="py-2 px-4 border-b">Damaged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lossDamage.map(eq => (
                      <tr key={eq.id} className="text-center">
                        <td className="py-2 px-4 border-b">{eq.name}</td>
                        <td className="py-2 px-4 border-b">{eq.sport}</td>
                        <td className="py-2 px-4 border-b text-red-600 font-bold">{eq.lost_count}</td>
                        <td className="py-2 px-4 border-b text-yellow-600 font-bold">{eq.damaged_count}</td>
                      </tr>
                    ))}
                    {lossDamage.length === 0 && <tr><td colSpan={4} className="py-4 text-gray-500">No loss/damage data.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Low Stock Equipment */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <FaBoxes className="text-xl text-green-500" />
                <h2 className="text-xl font-bold">Low Stock Equipment</h2>
              </div>
              <div className="overflow-x-auto bg-white rounded-xl shadow p-6">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b">Name</th>
                      <th className="py-2 px-4 border-b">Sport</th>
                      <th className="py-2 px-4 border-b">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map(eq => (
                      <tr key={eq.id} className="text-center">
                        <td className="py-2 px-4 border-b">{eq.name}</td>
                        <td className="py-2 px-4 border-b">{eq.sport}</td>
                        <td className="py-2 px-4 border-b text-red-600 font-bold">{eq.quantity}</td>
                      </tr>
                    ))}
                    {lowStock.length === 0 && <tr><td colSpan={3} className="py-4 text-gray-500">No low stock items.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalytics; 