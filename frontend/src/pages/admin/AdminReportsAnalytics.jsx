import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FaChartPie, FaHistory, FaBoxes, FaFileExport, FaClipboardList, FaExclamationCircle } from 'react-icons/fa';

const AdminReportsAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/reports/summary');
        setStats(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch summary stats');
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <div className="ml-56 min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FaChartPie className="text-3xl text-blue-600" />
          <h1 className="text-3xl font-extrabold">Reports & Analytics</h1>
        </div>
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
          </>
        )}
        {/* Charts Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaChartPie className="text-xl text-blue-500" />
            <h2 className="text-xl font-bold">Visualizations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6 text-gray-400 flex items-center justify-center min-h-[180px]">(Most Borrowed Equipment Chart)</div>
            <div className="bg-white rounded-xl shadow p-6 text-gray-400 flex items-center justify-center min-h-[180px]">(Borrow/Return Trends Chart)</div>
          </div>
        </div>
        {/* History Tables */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaHistory className="text-xl text-yellow-500" />
            <h2 className="text-xl font-bold">Borrow/Return History</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-gray-400 flex items-center justify-center min-h-[120px]">(Borrow/Return history table with filters)</div>
        </div>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaExclamationCircle className="text-xl text-purple-500" />
            <h2 className="text-xl font-bold">Penalty History</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-gray-400 flex items-center justify-center min-h-[120px]">(Penalty history table with filters)</div>
        </div>
        {/* Inventory Management */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaBoxes className="text-xl text-green-500" />
            <h2 className="text-xl font-bold">Inventory Management</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-gray-400 flex items-center justify-center min-h-[120px]">(Low-stock warnings, restock actions)</div>
        </div>
        {/* Export/Import */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaFileExport className="text-xl text-blue-500" />
            <h2 className="text-xl font-bold">Export/Import</h2>
          </div>
          <div className="flex gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow">Export to CSV</button>
            <button className="bg-gray-600 hover:bg-gray-700 transition text-white px-4 py-2 rounded shadow">Import from CSV</button>
          </div>
        </div>
        {/* Audit Log */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaHistory className="text-xl text-gray-500" />
            <h2 className="text-xl font-bold">Audit Log</h2>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-gray-400 flex items-center justify-center min-h-[120px]">(Audit log table)</div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsAnalytics; 