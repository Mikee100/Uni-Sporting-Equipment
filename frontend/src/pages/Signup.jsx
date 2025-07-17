import React from 'react';
import SignupForm from '../components/SignupForm';
import { Link } from 'react-router-dom';
import { FaDumbbell } from 'react-icons/fa';

const Signup = () => (
  <div className="min-h-[80vh] flex flex-col justify-center items-center px-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
      <FaDumbbell className="text-4xl text-blue-600 mb-3" />
      <h2 className="text-2xl font-extrabold mb-1 text-gray-800 text-center">Create Your Account</h2>
      <p className="mb-6 text-gray-600 text-center">Sign up to start borrowing and managing sporting equipment.</p>
      <SignupForm />
      <p className="mt-6 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
      </p>
    </div>
  </div>
);

export default Signup; 