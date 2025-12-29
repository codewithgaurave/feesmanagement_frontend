import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import Swal from 'sweetalert2';
import {
  HiViewGrid,
  HiUsers,
  HiPlus,
  HiDocumentText,
  HiKey,
  HiLogout,
  HiCalendar,
  HiCog,
  HiChevronDown,
  HiChevronRight,
  HiOfficeBuilding,
  HiAcademicCap,
  HiUserGroup
} from 'react-icons/hi';

const Sidebar = ({ onNavigate }) => {
  const { logout } = useAuth();
  const { hasPermission, isSuperAdmin, userRole, isLoaded } = useRole();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Don't render sidebar content until role is loaded
  if (!isLoaded) {
    return (
      <div className="flex flex-col w-full h-screen text-black shadow-2xl bg-white border-r border-gray-200 lg:shadow-lg">
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onNavigate) {
      onNavigate();
    }
  }, [location.pathname, onNavigate]);

  // Close settings dropdown when navigating
  useEffect(() => {
    setIsSettingsOpen(false);
  }, [location.pathname]);

  const handleNavClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your session!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <HiViewGrid className="w-5 h-5" />
    }
  ];

  const studentItems = [
    {
      title: "Add Student",
      path: "/students/add",
      icon: <HiPlus className="w-5 h-5" />
    },
    {
      title: "View Students",
      path: "/students/show",
      icon: <HiUsers className="w-5 h-5" />
    }
  ];

  const feeItems = [
    {
      title: "Add Fee",
      path: "/fees/add",
      icon: <HiPlus className="w-5 h-5" />
    },
    {
      title: "Show Fees",
      path: "/fees/show",
      icon: <HiDocumentText className="w-5 h-5" />
    },
    {
      title: "Report",
      path: "/fees/upcoming",
      icon: <HiCalendar className="w-5 h-5" />
    }
  ];

  const settingsItems = [
    {
      title: "Add Department",
      path: "/settings/add-department",
      icon: <HiOfficeBuilding className="w-4 h-4" />
    },
    {
      title: "Add Speciality",
      path: "/settings/add-speciality",
      icon: <HiAcademicCap className="w-4 h-4" />
    },
    {
      title: "Add Employee",
      path: "/settings/add-employee",
      icon: <HiUserGroup className="w-4 h-4" />
    },
    {
      title: "Manage Employee",
      path: "/employees/manage",
      icon: <HiUsers className="w-4 h-4" />
    }
  ];

  return (
    <div className="flex flex-col w-full h-screen text-black shadow-2xl bg-white border-r border-gray-200 lg:shadow-lg">
      {/* Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-2 sm:p-3 lg:p-4 space-y-2 sm:space-y-3 lg:space-y-4">
          {/* Dashboard */}
          <div>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-blue-100 text-blue-800 shadow-lg'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                  }`
                }
              >
                <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                  {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                </span>
                <span className="font-medium nav-font text-sm sm:text-base truncate">{item.title}</span>
              </NavLink>
            ))}
          </div>

          {/* Students Section - For employees with student permission */}
          {hasPermission('student') && (
            <div>
              <div className="space-y-1">
                {studentItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-blue-100 text-blue-800 shadow-lg'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                      {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                    </span>
                    <span className="text-xs sm:text-sm font-medium nav-font truncate">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Fee Management Section - For employees with fee permission */}
          {hasPermission('fee') && (
            <div>
              <div className="space-y-1">
                {feeItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${isActive
                        ? 'bg-blue-100 text-blue-800 shadow-lg'
                        : 'text-gray-600 hover:text-black hover:bg-gray-50'
                      }`
                    }
                  >
                    <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                      {React.cloneElement(item.icon, { className: 'w-4 h-4 sm:w-5 sm:h-5' })}
                    </span>
                    <span className="text-xs sm:text-sm font-medium nav-font truncate">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {isSuperAdmin() && (
            <div>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`flex items-center justify-between w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${
                  isSettingsOpen || location.pathname.startsWith('/settings')
                    ? 'bg-blue-100 text-blue-800 shadow-lg'
                    : 'text-gray-600 hover:text-blue-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <HiCog className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium nav-font truncate">Settings</span>
                </div>
                {isSettingsOpen ?
                  <HiChevronDown className="w-3 h-3 transition-transform duration-200" /> :
                  <HiChevronRight className="w-3 h-3 transition-transform duration-200" />
                }
              </button>
              {isSettingsOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {settingsItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 group ${isActive
                          ?     'bg-blue-100 text-blue-800 shadow-sm'
                          : 'text-gray-600 hover:text-black hover:bg-gray-50'
                        }`
                      }
                    >
                      <span className="transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                        {item.icon}
                      </span>
                      <span className="text-xs font-medium nav-font truncate">{item.title}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}

            {/* Admin Management - Super Admin Only */}
            {/* {isSuperAdmin() && (
              <div>
                <NavLink
                  to="/admin-management"
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${isActive
                      ? 'bg-blue-100 text-blue-800 shadow-sm'
                      : 'text-gray-600 hover:text-black hover:bg-gray-50'
                    }`
                  }
                >
                  <HiUserGroup className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium nav-font truncate">Admin Management</span>
                </NavLink>
              </div>
            )} */}

          {/* Change Password */}
          <div>
            <NavLink
              to="/change-password"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-blue-100 text-blue-800 shadow-lg'
                  : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`
              }
            >
              <HiKey className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium nav-font truncate">Change Password</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Logout Button - Fixed at Bottom */}
      <div className="flex-shrink-0 p-2 sm:p-3 lg:p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 space-x-2 sm:space-x-3 text-black transition-all duration-200 border rounded-lg sm:rounded-xl group hover:text-black hover:bg-gray-50 border-gray-200 hover:border-gray-300 touch-manipulation active:bg-gray-100"
        >
          <HiLogout className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium nav-font truncate">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;