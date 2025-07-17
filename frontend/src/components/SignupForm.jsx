import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const { signup, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(name, email, password);
    if (success) navigate('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto bg-white p-0 rounded shadow-none">
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-4 text-sm text-center font-medium">{error}</div>}
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 font-semibold">Name</label>
        <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-gray-700 font-semibold">Email</label>
        <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="mb-6">
        <label className="block mb-1 text-gray-700 font-semibold">Password</label>
        <input type="password" className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-semibold text-lg shadow transition disabled:opacity-60" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm; 