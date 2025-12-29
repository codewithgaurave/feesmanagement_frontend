import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feeAPI, studentAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { FaExclamationTriangle, FaEye, FaUsers, FaRupeeSign, FaCalendarAlt } from 'react-icons/fa';

const UpcomingFees = () => {
  const navigate = useNavigate();
  const [allDueFees, setAllDueFees] = useState([]);
  const [todayStudents, setTodayStudents] = useState([]);
  const [todayPayments, setTodayPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('students');
  const [timePeriod, setTimePeriod] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (timePeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date(startOfWeek);
        endDate.setDate(startOfWeek.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    console.log('Date range for', timePeriod, ':', startDate, 'to', endDate);
    return { startDate, endDate };
  };

  const fetchTodayStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      const students = response.data.data || response.data || [];
      const { startDate, endDate } = getDateRange();

      const filteredStudents = students.filter(student => {
        const createdDate = new Date(student.createdAt);
        return createdDate >= startDate && createdDate < endDate;
      });

      console.log('Filtered students:', filteredStudents.length, 'for period:', timePeriod);
      setTodayStudents(filteredStudents);
    } catch (err) {
      console.error('Error fetching students:', err);
      setTodayStudents([]);
    }
  };

  const fetchTodayPayments = async () => {
    try {
      const response = await feeAPI.getAll();
      const fees = response.data.data || response.data || [];
      
      console.log('=== PAYMENT FILTER DEBUG ===');
      console.log('Total fees fetched:', fees.length);
      
      const paidFees = fees.filter(f => f.status === 'paid');
      console.log('Total paid fees:', paidFees.length);
      
      if (paidFees.length > 0) {
        console.log('Sample paid fee:', paidFees[0]);
        console.log('Sample paid date:', paidFees[0].paidDate);
      }
      
      // For now, show all paid fees regardless of date
      setTodayPayments(paidFees);
      console.log('Setting payments to:', paidFees.length);
      
    } catch (err) {
      console.error('Error fetching payments:', err);
      setTodayPayments([]);
    }
  };

  const fetchAllDueFees = async () => {
    try {
      const studentsResponse = await studentAPI.getAll();
      const students = studentsResponse.data.data || studentsResponse.data || [];

      const feesResponse = await feeAPI.getAll();
      const allFees = feesResponse.data.data || feesResponse.data || [];

      const dueFees = students.filter(student => {
        const totalAmount = student.totalFee || 0;
        const paidFees = allFees.filter(fee => 
          fee.studentId._id === student._id && fee.status === 'paid'
        );
        const paidAmount = paidFees.reduce((sum, fee) => sum + (fee.paidAmount || fee.amount || 0), 0);

        if (totalAmount - paidAmount > 0) {
          student.dueAmount = totalAmount - paidAmount;
          student.paidAmount = paidAmount;
          return true;
        }
        return false;
      });

      setAllDueFees(dueFees);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching due fees:', err);
      setError('Failed to fetch due fees');
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchAllDueFees();
    fetchTodayStudents();
    fetchTodayPayments();
  }, [timePeriod]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">{error}</div>
          <button
            onClick={fetchAllDueFees}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex flex-col items-start justify-between w-full gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Daily Students Details</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">Students with full payments status</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">

        {/* Today added students */}

        <div className="p-4 border border-blue-200 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-600 sm:text-sm">Added Students</p>
              <p className="text-lg font-bold text-blue-900 sm:text-2xl">{todayStudents.length}</p>
            </div>
            <div className="flex-shrink-0 p-2 text-white bg-blue-500 sm:p-3 rounded-xl">
              <FaUsers className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* student with due fees */}

        <div className="p-4 border border-red-200 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-600 sm:text-sm">Students with Due Fees</p>
              <p className="text-lg font-bold text-red-900 sm:text-2xl">{allDueFees.length}</p>
            </div>
            <div className="flex-shrink-0 p-2 text-white bg-red-500 sm:p-3 rounded-xl">
              <FaExclamationTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        {/* today payments */}

        <div className="p-4 border border-green-200 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-green-600 sm:text-sm">Payments</p>
              <p className="text-lg font-bold text-green-900 sm:text-2xl">{todayPayments.length}</p>
            </div>
            <div className="flex-shrink-0 p-2 text-white bg-green-500 sm:p-3 rounded-xl">
              <FaRupeeSign className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="w-full bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap gap-2">
             {/* students button */}
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'students'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaUsers className="w-4 h-4 inline mr-2" />
              Students ({todayStudents.length})
            </button>
            {/* due fee button */}
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dues'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaExclamationTriangle className="w-4 h-4 inline mr-2" />
              Due Fees ({allDueFees.length})
            </button>
           
            {/* payment button */}
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaRupeeSign className="w-4 h-4 inline mr-2" />
              Payments ({todayPayments.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="w-4 h-4 text-gray-500" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* All Due Fees Table */}
      {activeTab === 'dues' && (allDueFees.length > 0 ? (
        <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
              All Due Fees ({allDueFees.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allDueFees.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 font-medium text-sm">
                            {student.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                          <div className="text-sm text-gray-500">Class: {student.class}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-gray-900">₹{(student.totalFee || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">₹{(student.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-red-600">₹{(student.dueAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/students/details/${student._id}`)}
                        className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <FaExclamationTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Due Fees</h3>
            <p className="text-gray-500">All fees are up to date! No pending payments found.</p>
          </div>
        </div>
      ))}

      {/* Today Students Table */}
      {activeTab === 'students' && (todayStudents.length > 0 ? (
        <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
              Today Added Students ({todayStudents.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {student.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{student.rollNumber}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{student.class}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{student.phone}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(student.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/students/details/${student._id}`)}
                        className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <FaUsers className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Added Today</h3>
            <p className="text-gray-500">No new students were added today.</p>
          </div>
        </div>
      ))}

      {/* Today Payments Table */}
      {activeTab === 'payments' && (todayPayments.length > 0 ? (
        <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <FaRupeeSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
              Today Payments ({todayPayments.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-medium text-sm">
                            {payment.studentId?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.studentId?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">Roll: {payment.studentId?.rollNumber || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{payment.feeType}</td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">₹{(payment.paidAmount || payment.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{payment.paymentMethod || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => navigate(`/students/details/${payment.studentId?._id}`)}
                        className="flex items-center px-3 py-1.5 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaEye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
            <FaRupeeSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Today</h3>
            <p className="text-gray-500">No fee payments were made today.</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingFees;