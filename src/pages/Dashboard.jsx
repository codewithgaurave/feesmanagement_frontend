import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, studentAPI, feeAPI } from '../utils/api';
import { HiUsers, HiCash, HiClock, HiCalendar, HiUserAdd, HiUserGroup, HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    dueFees: 0,
    upcomingFees: 0,
    studentsWithFullFeesPaid: 0,
    studentsWithPendingFees: 0
  });
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check user role and permissions
    const userData = localStorage.getItem('admin');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      const response = await adminAPI.getDashboardStats();
      const data = response.data;
      
      setStats({
        totalStudents: data.totalStudents || 0,
        dueFees: data.pendingFees || 0,
        upcomingFees: data.overdueFees || 0,
        studentsWithFullFeesPaid: data.fullFeesPaidStudents || 0,
        studentsWithPendingFees: data.pendingStudents || 0
      });
      
    } catch (error) {
      console.error('Dashboard error:', error);
      // Show static data when server is down
      setStats({
        totalStudents: 0,
        dueFees: 0,
        upcomingFees: 0,
        studentsWithFullFeesPaid: 0,
        studentsWithPendingFees: 0
      });
    } finally {
      setLoading(false);
    }

    setRecentActivities([
      { id: 1, type: 'payment', message: 'Fee payment received', time: '2 hours ago' },
      { id: 2, type: 'student', message: 'New student registered', time: '4 hours ago' },
      { id: 3, type: 'reminder', message: 'Fee reminders sent', time: '1 day ago' }
    ]);
  };

  const quickActions = [
    {
      title: 'Add Student',
      description: 'Register new student',
      icon: <HiUserAdd className="w-8 h-8" />,
      link: '/students/add',
      color: 'from-blue-500 to-blue-600',
      permission: 'students'
    },
    {
      title: 'Collect Fee',
      description: 'Process fee payment',
      icon: <FaRupeeSign className="w-8 h-8" />,
      link: '/fees/add',
      color: 'from-green-500 to-green-600',
      permission: 'fees'
    },
    {
      title: 'View Students',
      description: 'Manage student data',
      icon: <HiUserGroup className="w-8 h-8" />,
      link: '/students/show',
      color: 'from-purple-500 to-purple-600',
      permission: 'students'
    },
    {
      title: 'Manage Employees',
      description: 'Employee management',
      icon: <HiUserGroup className="w-8 h-8" />,
      link: '/employees/manage',
      color: 'from-indigo-500 to-indigo-600',
      permission: 'admin'
    }
  ];

  // Filter actions based on user permissions
  const getFilteredActions = () => {
    if (!user) return quickActions;
    
    // If admin (super_admin role), show all actions
    if (user.role === 'super_admin') {
      return quickActions;
    }
    
    // If employee, filter based on permissions
    if (user.role === 'employee') {
      return quickActions.filter(action => {
        if (action.permission === 'admin') return false;
        if (action.permission === 'students') return user.permissions?.studentManagement;
        if (action.permission === 'fees') return user.permissions?.feeManagement;
        return true;
      });
    }
    
    return quickActions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-college-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">

      {/* User Info for Employees */}
      {user && user.role === 'employee' && (
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Welcome, {user.name}</h2>
              <p className="text-sm text-gray-600">Employee Dashboard</p>
            </div>
            <div className="text-right">
              <div className="flex flex-wrap gap-2 mb-2">
                {user.departments && Array.isArray(user.departments) && user.departments.map((dept, idx) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {typeof dept === 'object' ? dept.name : dept}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {user.permissions && typeof user.permissions === 'object' && (
                  <>
                    {user.permissions.studentManagement && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Student Management
                      </span>
                    )}
                    {user.permissions.feeManagement && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Fee Management
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-4 sm:p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Total Students</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-800 truncate">{stats.totalStudents}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg flex-shrink-0">
              <HiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Full Fees Paid</p>
              <p className="text-2xl lg:text-3xl font-bold text-green-600 truncate">{stats.studentsWithFullFeesPaid}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg flex-shrink-0">
              <HiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Pending Students</p>
              {/* <p className="text-2xl lg:text-3xl font-bold text-red-600 truncate">{stats.studentsWithPendingFees}</p> */}
              <p className="text-2xl lg:text-3xl font-bold text-red-600 truncate">{stats.studentsWithPendingFees}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg flex-shrink-0">
              <HiClock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Overdue Fees</p>
              <p className="text-2xl lg:text-3xl font-bold text-orange-600 truncate">{stats.upcomingFees}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg flex-shrink-0">
              <HiCalendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 sm:p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
        <h2 className="mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {getFilteredActions().map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group block transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-xl overflow-hidden border border-gray-200 hover:border-transparent"
            >
              <div className={`bg-gradient-to-br ${action.color} p-6 text-white h-full relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                      {React.cloneElement(action.icon, { className: 'w-8 h-8' })}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-gray-100 transition-colors duration-300">{action.title}</h3>
                  <p className="text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activities & Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        {/*<div className="p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start p-3 space-x-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 mt-2 rounded-full bg-college-primary"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{activity.message}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>*/}

        {/* Quick Links */}
        {/*<div className="p-6 bg-white border border-gray-100 shadow-lg rounded-xl">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Quick Links</h2>
          <div className="space-y-3">
            <Link to="/students/show" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Student Management</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/fees/manage" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Fee Management</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/fees/upcoming" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Upcoming Dates</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link to="/change-password" className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100">
              <span className="font-medium text-gray-700">Change Password</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>*/}
      </div>
    </div>
  );
};

export default Dashboard;