import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { updateRoleFromLogin } = useRole();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Try admin login first
      const response = await authAPI.login({ email, password });
      const { token, admin } = response.data;
      
      if (token) {
        login(admin || { email }, token);
        updateRoleFromLogin(admin || { email, role: 'super_admin' });
        toast.success('Admin login successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        return;
      }
    } catch (adminError) {
      // If admin login fails, try employee login
      try {
        const empResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/employee-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        const empData = await empResponse.json();
        
        if (empData.success) {
          login(empData.user, empData.token);
          updateRoleFromLogin(empData.user);
          toast.success('Employee login successful!');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          return;
        }
      } catch (empError) {
        console.error('Employee login error:', empError);
      }
      
      // If both fail, show error
      const errorMessage = adminError.response?.data?.message || 'Invalid credentials';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-3 sm:p-4 bg-gradient-to-br from-[#00a8cc] to-[#0077b6]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-sm sm:max-w-md">
        <div className="p-6 sm:p-8 border shadow-2xl bg-white backdrop-blur-sm rounded-xl sm:rounded-2xl border-white/20 animate-fade-in">
          {/* Logo and Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 p-1 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-br from-[#00a8cc] to-[#0077b6]">
              <img
                src="/logo.png"
                alt="Institute Logo"
                className="w-full h-full object-cover rounded-full bg-white p-1"
              />
            </div>
            <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-gray-800">Admin Login</h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HiMail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base transition-all duration-200 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#00a8cc] focus:border-transparent bg-gray-50 focus:bg-white"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <HiLockClosed className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-9 sm:pl-10 pr-10 sm:pr-12 text-sm sm:text-base transition-all duration-200 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-[#00a8cc] focus:border-transparent bg-gray-50 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00a8cc] to-[#0077b6] text-white py-2.5 sm:py-3 px-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          
        </div>

        {/* Decorative Elements */}
        <div className="absolute w-24 h-24 rounded-full -top-4 -left-4 bg-white/10 blur-xl"></div>
        <div className="absolute w-32 h-32 rounded-full -bottom-4 -right-4 bg-white/10 blur-xl"></div>
      </div>
    </div>
  );
};

export default Login;