// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Swal from 'sweetalert2';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       setUser({ name: 'Admin', role: 'admin' });
//       setIsAuthenticated(true);
//     }
//     setLoading(false);
//   }, []);

//   const login = (userData, token) => {
//     localStorage.setItem('authToken', token);
//     setUser(userData);
//     setIsAuthenticated(true);
//   };

//   const logout = () => {
//     Swal.fire({
//       title: 'Logout Successful!',
//       text: 'You have been logged out successfully',
//       icon: 'success',
//       timer: 1500,
//       showConfirmButton: false,
//       timerProgressBar: true
//     }).then(() => {
//       localStorage.removeItem('authToken');
//       sessionStorage.clear();
//       setUser(null);
//       setIsAuthenticated(false);
//       // Clear role context by triggering re-render
//       window.location.href = '/';
//     });
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     logout
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;


import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, load admin/token from localStorage
    const storedToken = localStorage.getItem('authToken');
    const storedAdmin = localStorage.getItem('admin');
    
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      const adminData = JSON.parse(storedAdmin);
      setAdmin(adminData);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (adminData, authToken) => {
    setAdmin(adminData);
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('admin', JSON.stringify(adminData));
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
  };

  return (
    <AuthContext.Provider value={{ 
      admin, 
      token, 
      isAuthenticated, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
