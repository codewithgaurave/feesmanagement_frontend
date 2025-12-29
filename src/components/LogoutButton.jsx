import React from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const LogoutButton = ({ className = "", children }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your session!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      zIndex: 9999
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children || 'Logout'}
    </button>
  );
};

export default LogoutButton;