import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-96 border border-gray-700">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-white">🎓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-100">AdmissionHub</h2>
          <p className="text-gray-400 text-sm mt-2">Enterprise Management System</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Login
          </button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400 font-semibold mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-xs text-gray-400">
            <p>Admin: <span className="text-cyan-400">admin / admin123</span></p>
            <p>Admission Officer: <span className="text-cyan-400">officer / officer123</span></p>
            <p>Management: <span className="text-cyan-400">management / management123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;