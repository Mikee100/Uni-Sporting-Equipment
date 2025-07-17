import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { FaTools } from 'react-icons/fa';

const statusColors = {
  available: 'bg-green-100 text-green-700',
  borrowed: 'bg-blue-100 text-blue-700',
  lost: 'bg-yellow-100 text-yellow-700',
  damaged: 'bg-purple-100 text-purple-700',
};

const StaffEquipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/equipment');
        setEquipment(res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch equipment');
      }
      setLoading(false);
    };
    fetchEquipment();
  }, []);

  return (
    <div className="ml-56 p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2"><FaTools className="text-green-600" /> Equipment Management</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-2 flex justify-end">
        <input
          type="text"
          placeholder="Search equipment..."
          className="border px-2 py-1 rounded"
          value={equipmentSearch}
          onChange={e => setEquipmentSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Quantity</th>
              <th className="py-2 px-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {equipment.filter(item =>
              item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
              item.description?.toLowerCase().includes(equipmentSearch.toLowerCase())
            ).map(item => (
              <tr key={item.id} className="text-center">
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.description}</td>
                <td className="py-2 px-4 border-b">{item.quantity}</td>
                <td className="py-2 px-4 border-b capitalize">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status] || 'bg-gray-200 text-gray-700'}`}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                </td>
              </tr>
            ))}
            {equipment.filter(item =>
              item.name.toLowerCase().includes(equipmentSearch.toLowerCase()) ||
              item.description?.toLowerCase().includes(equipmentSearch.toLowerCase())
            ).length === 0 && (
              <tr><td colSpan={4} className="py-4 text-gray-500">No equipment found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffEquipment; 