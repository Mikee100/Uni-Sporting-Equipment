import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const UserPenalties = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPenalties = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/penalties/my');
      setPenalties(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch penalties');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  return (
    <div className="pt-20 max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">My Penalties</h1>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-center font-medium">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Reason</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Issued At</th>
              </tr>
            </thead>
            <tbody>
              {penalties.map(item => (
                <tr key={item.id} className="text-center">
                  <td className="py-2 px-4 border-b">{item.amount}</td>
                  <td className="py-2 px-4 border-b">{item.reason}</td>
                  <td className="py-2 px-4 border-b capitalize">{item.status}</td>
                  <td className="py-2 px-4 border-b">{item.issued_at ? new Date(item.issued_at).toLocaleString() : ''}</td>
                </tr>
              ))}
              {penalties.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-gray-500 text-center">No penalties found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserPenalties; 