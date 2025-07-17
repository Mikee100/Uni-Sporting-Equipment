import React from 'react';
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';
import { FaDumbbell } from 'react-icons/fa';

const Login = () => (
  <div className="min-h-[80vh] flex flex-col justify-center items-center  px-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
      <FaDumbbell className="text-4xl text-blue-600 mb-3" />
      <h2 className="text-2xl font-extrabold mb-1 text-gray-800 text-center">Welcome Back!</h2>
      <p className="mb-6 text-gray-600 text-center">Login to your Uni Sporting Equipment account</p>
      <LoginForm />
      <p className="mt-6 text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-600 hover:underline font-semibold">Sign up</Link>
      </p>
    </div>
  </div>
);

export default Login; 