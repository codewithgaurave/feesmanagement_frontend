import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [departments, setDepartments] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const updateRoleFromLogin = (userData) => {
    // console.log('Updating role from login:', userData);
    setUserRole(userData.role || 'super_admin');
    setPermissions(userData.permissions || { student: true, fee: true });
    setDepartments(userData.departments || []);
    setIsLoaded(true);
  };

  useEffect(() => {
    // Get role from token or API
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // console.log('Token payload:', payload); // Debug log
        
        // Set role
        setUserRole(payload.role || 'super_admin');
        
        // Handle permissions - check if it's in the token or make API call
        if (payload.permissions) {
          setPermissions(payload.permissions);
        } else {
          // Fallback: fetch user data from API
          fetchUserData(token);
        }
        
        setDepartments(payload.departments || []);
      } catch (error) {
        // console.error('Token decode error:', error);
        // Fallback: fetch user data from API
        fetchUserData(token);
      }
    } else {
      // Clear role if no token
      setUserRole(null);
      setPermissions({});
      setDepartments([]);
    }
    setIsLoaded(true);
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // console.log('Fetched user data:', data);
        setUserRole(data.role || 'super_admin');
        setPermissions(data.permissions || { studentManagement: true, feeManagement: true });
        setDepartments(data.departments || []);
      } else {
        // console.log('API call failed, using fallback');
        // Fallback for existing tokens
        setUserRole('super_admin');
        setPermissions({ studentManagement: true, feeManagement: true });
        setDepartments([]);
      }
    } catch (error) {
      // console.error('Fetch user data error:', error);
      // Fallback for existing tokens
      setUserRole('super_admin');
      setPermissions({ studentManagement: true, feeManagement: true });
      setDepartments([]);
    }
  };

  const hasPermission = (permission) => {
    if (userRole === 'super_admin') return true;
    if (!userRole) return false;
    
    // Map old permission names to new ones
    const permissionMap = {
      'student': 'studentManagement',
      'fee': 'feeManagement'
    };
    
    const actualPermission = permissionMap[permission] || permission;
    return permissions[actualPermission] === true;
  };

  const canAccessDepartment = (departmentId) => {
    if (userRole === 'super_admin') return true;
    return departments.some(dep => dep._id === departmentId);
  };

  const isSuperAdmin = () => userRole === 'super_admin';

  return (
    <RoleContext.Provider value={{
      userRole,
      permissions,
      departments,
      hasPermission,
      canAccessDepartment,
      isSuperAdmin,
      setUserRole,
      setPermissions,
      setDepartments,
      updateRoleFromLogin,
      isLoaded
    }}>
      {children}
    </RoleContext.Provider>
  );
};