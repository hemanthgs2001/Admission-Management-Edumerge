import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaGraduationCap, 
  FaChartLine, 
  FaUsers, 
  FaShieldAlt,
  FaClock,
  FaUserCheck,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex max-w-6xl w-full mx-4">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex flex-1 flex-col justify-center p-12 bg-gradient-to-br from-cyan-900/50 to-teal-900/50 rounded-l-2xl backdrop-blur-sm border border-gray-700">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl flex items-center justify-center">
                <FaGraduationCap className="text-2xl text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">EDUMERGE</h1>
            </div>
            <p className="text-cyan-400 text-lg font-semibold">Admission Management Assignment</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Why Choose Us?</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-600/30 transition-colors">
                  <FaChartLine className="text-cyan-500 text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-200 font-semibold">Streamlined Admissions</h4>
                  <p className="text-gray-400 text-sm">Efficient application tracking and management system</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-10 h-10 bg-teal-600/20 rounded-lg flex items-center justify-center group-hover:bg-teal-600/30 transition-colors">
                  <FaUsers className="text-teal-500 text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-200 font-semibold">Multi-User Support</h4>
                  <p className="text-gray-400 text-sm">Admin, Officers, and Management with role-based access</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-600/30 transition-colors">
                  <FaShieldAlt className="text-cyan-500 text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-200 font-semibold">Secure Platform</h4>
                  <p className="text-gray-400 text-sm">Enterprise-grade security with encrypted data protection</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-10 h-10 bg-teal-600/20 rounded-lg flex items-center justify-center group-hover:bg-teal-600/30 transition-colors">
                  <FaClock className="text-teal-500 text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-200 font-semibold">Real-time Updates</h4>
                  <p className="text-gray-400 text-sm">Instant notifications and status tracking for applications</p>
                </div>
              </div>

              <div className="flex items-start gap-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-10 h-10 bg-cyan-600/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-600/30 transition-colors">
                  <FaUserCheck className="text-cyan-500 text-lg" />
                </div>
                <div>
                  <h4 className="text-gray-200 font-semibold">Easy Management</h4>
                  <p className="text-gray-400 text-sm">Comprehensive dashboard for complete control</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Trusted by 500+ Educational Institutions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 bg-gray-800 p-8 rounded-lg shadow-2xl lg:rounded-l-none lg:rounded-r-2xl border border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaGraduationCap className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-100">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
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
                placeholder="Enter your username"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pr-10"
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
            >
              Login
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default Login;