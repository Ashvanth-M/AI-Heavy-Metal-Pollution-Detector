import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { ChevronLeft, User, Eye, EyeOff } from 'lucide-react';

const UserLogin: React.FC = () => {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('userSavedEmail');
    const savedPassword = localStorage.getItem('userSavedPassword');
    
    if (savedEmail && savedPassword) {
      setLoginForm(prev => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(loginForm.email, loginForm.password);
      
      if (result) {
        // Save password if remember me is checked
        if (loginForm.rememberMe) {
          localStorage.setItem('userSavedEmail', loginForm.email);
          localStorage.setItem('userSavedPassword', loginForm.password);
        } else {
          // Clear saved credentials if remember me is unchecked
          localStorage.removeItem('userSavedEmail');
          localStorage.removeItem('userSavedPassword');
        }
        
        // Redirect directly to user dashboard
        setLocation('/user-dashboard');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-green-100/30"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back Navigation */}
        <button
          onClick={() => setLocation('/')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </button>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">User Portal</h1>
            <p className="text-gray-600">Access pollution monitoring data</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={loginForm.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={loginForm.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
                Remember my credentials
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setLocation('/auth')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
              >
                Sign up here
              </button>
            </p>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500 mb-2">Admin Access</p>
              <button
                onClick={() => setLocation('/admin-login')}
                className="text-green-600 hover:text-green-800 font-medium transition-colors duration-200 text-sm"
              >
                Admin Portal →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;