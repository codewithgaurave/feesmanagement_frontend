import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feeAPI, studentAPI, notificationAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { PrintFeeListButton, PrintPageButton } from '../../components/PrintButton';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { HiPrinter, HiEye, HiRefresh, HiPlus, HiDocumentText, HiBell, HiPhone } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';

const ShowFees = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFeeDetails, setSelectedFeeDetails] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'N/A';
    }
  };


  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      console.log('Fetching fees and students...');
      
      const [feesResponse, studentsResponse] = await Promise.all([
        feeAPI.getAll(),
        studentAPI.getAll()
      ]);
      
      console.log('Fees response:', feesResponse.data);
      console.log('Students response:', studentsResponse.data);
      
      const feesData = feesResponse.data.data || feesResponse.data || [];
      const studentsData = studentsResponse.data.data || studentsResponse.data || [];
      
      console.log('Processed fees data:', feesData);
      console.log('Processed students data:', studentsData);
      
      setFees(Array.isArray(feesData) ? feesData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setError('');
      
      if (feesData.length === 0) {
        console.log('No fees found in response');
      }
      
    } catch (err) {
      console.error('Error fetching fees:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data?.message);
      
      // Set empty arrays but don't show error to user
      setFees([]);
      setStudents([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const filteredFees = Array.isArray(fees) ? fees.filter(fee => {
    const studentName = fee?.studentId?.name || 'Unknown Student';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (fee?.feeType || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || (fee?.status || '').toLowerCase() === filterStatus;
    return matchesSearch && matchesFilter;
  }) : [];

  // Group fees by student to show unique students
  const groupedStudents = filteredFees.reduce((acc, fee) => {
    const studentId = fee.studentId?._id || fee.studentId;
    if (!acc[studentId]) {
      acc[studentId] = {
        student: fee.studentId,
        fees: [],
        totalAmount: 0,
        paidAmount: 0,
        dueAmount: 0
      };
    }
    acc[studentId].fees.push(fee);
    acc[studentId].totalAmount += fee.amount || 0;
    acc[studentId].paidAmount += fee.paidAmount || 0;
    acc[studentId].dueAmount += (fee.amount || 0) - (fee.paidAmount || 0);
    return acc;
  }, {});

  const uniqueStudents = Object.values(groupedStudents);

  const handleShowAllRecords = () => {
    setSelectedFeeDetails(fees);
    setShowDetailsModal(true);
  };

  const handleViewDetails = (studentData) => {
    navigate(`/students/details/${studentData.student._id}`, { state: { student: studentData.student, fees: studentData.fees } });
  };



  const handleExcelDownload = (fee) => {
    const student = students.find(s => s._id === fee.studentId?._id);
    const totalFee = student ? (
      (student.tuitionFee || 0) +
      (student.hostelFee || 0) +
      (student.securityFee || 0) +
      (student.acCharge || 0) +
      (student.miscellaneousFee || 0)
    ) : 0;
    
    const excelData = [{
      'Student Name': fee.studentId?.name || 'Unknown',
      'Roll Number': fee.studentId?.rollNumber || 'N/A',
      'Class': fee.studentId?.class || 'N/A',
      'Total Fee': totalFee,
      'Fee Type': fee.feeType || 'N/A',
      'Description': fee.description || 'No description',
      'Amount': fee.amount || 0,
      'Paid Amount': fee.paidAmount || 0,
      'Status': fee.status || 'Pending',
      'Due Date': fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A',
      'Paid Date': fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : 'N/A',
      'Payment Method': fee.paymentMethod || 'N/A'
    }];
    
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Details');
    
    const fileName = `Fee_${fee.studentId?.name || 'Unknown'}_${fee.feeType || 'Fee'}_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('Excel file downloaded successfully!');
  };

  const handleMarkAsPaid = async (feeId, studentName, amount) => {
    const result = await Swal.fire({
      title: 'Mark as Paid?',
      html: `Mark fee for <strong>${studentName}</strong> as paid?<br><small>Amount: ₹${amount?.toLocaleString()}</small>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Mark Paid',
      cancelButtonText: 'Cancel'
    });
    
    if (result.isConfirmed) {
      const loadingToast = toast.loading('Processing payment...');
      try {
        const response = await feeAPI.payFee(feeId);
        
        // Update the local state immediately for better UX
        setFees(prevFees => 
          prevFees.map(fee => 
            fee._id === feeId 
              ? { ...fee, status: 'paid', paidDate: new Date(), paidAmount: fee.amount }
              : fee
          )
        );
        
        toast.dismiss(loadingToast);
        toast.success('Fee marked as paid successfully!');
        
        // Refresh data from server to ensure consistency
        setTimeout(() => {
          fetchFees();
        }, 500);
        
      } catch (err) {
        toast.dismiss(loadingToast);
        toast.error('Error marking fee as paid: ' + (err.response?.data?.message || err.message));
        console.error('Error marking fee as paid:', err);
      }
    }
  };
  
  const handleSendReminder = async (fee) => {
    const studentName = fee.studentId?.name || 'Unknown Student';
    const studentEmail = fee.studentId?.email;
    const studentPhone = fee.studentId?.phone;
    
    if (!studentEmail && !studentPhone) {
      toast.error('No email or phone number available for this student');
      return;
    }
    
    const { value: reminderType } = await Swal.fire({
      title: 'Send Payment Reminder',
      html: `Send reminder to <strong>${studentName}</strong>?<br><small>Amount: ₹${fee.amount?.toLocaleString()}</small>`,
      icon: 'question',
      input: 'select',
      inputOptions: {
        'email': `Email ${studentEmail ? '(' + studentEmail + ')' : '(Not available)'}`,
        'sms': `SMS ${studentPhone ? '(' + studentPhone + ')' : '(Not available)'}`,
        'both': 'Both Email & SMS'
      },
      inputValue: 'both',
      showCancelButton: true,
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Send Reminder',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) return 'Please select a reminder type';
        if (value === 'email' && !studentEmail) return 'Email not available';
        if (value === 'sms' && !studentPhone) return 'Phone number not available';
      }
    });
    
    if (reminderType) {
      const loadingToast = toast.loading('Sending reminder...');
      
      try {
        const reminderData = {
          studentName,
          amount: fee.amount || 0,
          dueDate: fee.dueDate,
          feeType: fee.feeType || 'Fee Payment',
          message: fee.status === 'overdue' ? 'Your fee payment is overdue. Please pay immediately to avoid penalties.' : 'Please pay your fee at the earliest.'
        };
        
        let success = false;
        
        if (reminderType === 'email' || reminderType === 'both') {
          if (studentEmail) {
            await notificationAPI.sendEmail({
              to: studentEmail,
              ...reminderData
            });
            success = true;
          }
        }
        
        if (reminderType === 'sms' || reminderType === 'both') {
          if (studentPhone) {
            await notificationAPI.sendSMS({
              phone: studentPhone,
              ...reminderData
            });
            success = true;
          }
        }
        
        toast.dismiss(loadingToast);
        
        if (success) {
          toast.success(`Reminder sent to ${studentName} via ${reminderType}!`);
        } else {
          toast.error('Failed to send reminder');
        }
        
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Error sending reminder: ' + error.message);
        console.error('Reminder error:', error);
      }
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={fetchFees}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage all student fees and payments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              if (filteredFees.length === 0) {
                toast.error('No data to download');
                return;
              }
              
              const excelData = filteredFees.map(fee => {
                const student = students.find(s => s._id === fee.studentId?._id);
                const totalFee = student ? (
                  (student.tuitionFee || 0) +
                  (student.hostelFee || 0) +
                  (student.securityFee || 0) +
                  (student.acCharge || 0) +
                  (student.miscellaneousFee || 0)
                ) : 0;
                
                return {
                'Student Name': fee.studentId?.name || 'Unknown',
                'Roll Number': fee.studentId?.rollNumber || 'N/A',
                'Class': fee.studentId?.class || 'N/A',
                'Phone': fee.studentId?.phone || 'N/A',
                'Total Fee': totalFee,
                'Fee Type': fee.feeType || 'N/A',
                'Description': fee.description || 'No description',
                'Amount': fee.amount || 0,
                'Paid Amount': fee.paidAmount || 0,
                'Due Amount': (fee.amount || 0) - (fee.paidAmount || 0),
                'Status': fee.status || 'Pending',
                'Due Date': formatDate(fee.dueDate),
                'Paid Date': formatDate(fee.paidDate),
                'Payment Method': fee.paymentMethod || 'N/A'
              }});
              
              const ws = XLSX.utils.json_to_sheet(excelData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'All Fees Data');
              
              const fileName = `All_Fees_Data_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
              XLSX.writeFile(wb, fileName);
              
              toast.success('Excel file downloaded successfully!');
            }}
            className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <HiDocumentText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Download Excel</span>
          </button>
          <button
            onClick={() => {
              fetchFees();
              toast.success('Data refreshed!');
            }}
            className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            disabled={loading}
          >
            <HiRefresh className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => navigate('/fees/add')}
            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Add Fee</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center justify-between">
            {/* <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-blue-600">Total Fees</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900 truncate">₹{fees.reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}</p>
            </div> */}

             <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-blue-600">Total Fee Amount</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 truncate">₹{students.reduce((sum, student) => {
                const totalAmount = (
                  (student.tuitionFee || 0) +
                  (student.hostelFee || 0) +
                  (student.securityFee || 0) +
                  (student.acCharge || 0) +
                  (student.miscellaneousFee || 0)
                );
                return sum + totalAmount;
              }, 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 text-white p-2 sm:p-3 rounded-xl flex-shrink-0">
              <FaRupeeSign className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-green-600">Collected</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900 truncate">₹{fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-500 text-white p-2 sm:p-3 rounded-xl flex-shrink-0">
              <MdCheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-2xl border border-red-200">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-red-600">Due Amount</p>
              <p className="text-lg sm:text-2xl font-bold text-red-900 truncate">₹{(() => {
                const totalAmount = students.reduce((sum, student) => {
                  const studentTotal = (
                    (student.tuitionFee || 0) +
                    (student.hostelFee || 0) +
                    (student.securityFee || 0) +
                    (student.acCharge || 0) +
                    (student.miscellaneousFee || 0)
                  );
                  return sum + studentTotal;
                }, 0);
                const collectedAmount = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0);
                return Math.max(0, totalAmount - collectedAmount);
              })().toLocaleString()}</p>
            </div>
            <div className="bg-red-500 text-white p-2 sm:p-3 rounded-xl flex-shrink-0">
              <MdError className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl border border-purple-200 cursor-pointer hover:shadow-lg transition-shadow" onClick={handleShowAllRecords}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-purple-600">Total Records</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-900">{fees.length}</p>
            </div>
            <div className="bg-purple-500 text-white p-2 sm:p-3 rounded-xl flex-shrink-0">
              <HiDocumentText className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filterStatus === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({fees.length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filterStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid ({fees.filter(f => f.status === 'paid').length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filterStatus === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({fees.filter(f => f.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              filterStatus === 'overdue' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue ({fees.filter(f => f.status === 'overdue').length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="w-full bg-white rounded-xl shadow-sm p-3 sm:p-4">
        <input
          type="text"
          placeholder="Search by student name or fee type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
        />
      </div>

      {/* Fees Table */}
      <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uniqueStudents.map((studentData) => {
                const student = students.find(s => s._id === studentData.student?._id);
                const totalFee = student ? (
                  (student.tuitionFee || 0) +
                  (student.hostelFee || 0) +
                  (student.securityFee || 0) +
                  (student.acCharge || 0) +
                  (student.miscellaneousFee || 0)
                ) : 0;
                
                return (
                <tr key={studentData.student?._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {studentData.student?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {studentData.student?.name || 'Unknown Student'}
                        </div>
                     
                        <div className="text-sm text-gray-500">
                          Roll: {studentData.student?.rollNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{studentData.fees.length} Fee Records</div>
                     
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-900">₹{totalFee.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{student?.class || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* <div className="text-sm font-medium text-gray-900">₹{studentData.totalAmount.toLocaleString()}</div> */}
                    <div className="text-sm text-green-600">Paid: ₹{studentData.paidAmount.toLocaleString()}</div>
                    <div className="text-sm text-orange-600">Due: ₹{(totalFee - studentData.paidAmount).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      (totalFee - studentData.paidAmount) <= 0 ? 'bg-green-100 text-green-800' :
                      studentData.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(totalFee - studentData.paidAmount) <= 0 ? 'Paid' : studentData.paidAmount > 0 ? 'Partial' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {studentData.fees.length > 0 ? formatDate(Math.max(...studentData.fees.map(f => new Date(f.dueDate || 0)))) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(studentData)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Student Details"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                       
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
        
        {/* Mobile Card View */}
        <div className="lg:hidden p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {uniqueStudents.map((studentData) => {
              const student = students.find(s => s._id === studentData.student?._id);
              const totalFee = student ? (
                (student.tuitionFee || 0) +
                (student.hostelFee || 0) +
                (student.securityFee || 0) +
                (student.acCharge || 0) +
                (student.miscellaneousFee || 0)
              ) : 0;
              
              return (
              <div key={studentData.student?._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                {/* Student Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {studentData.student?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {studentData.student?.name || 'Unknown Student'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Roll: {studentData.student?.rollNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    (totalFee - studentData.paidAmount) <= 0 ? 'bg-green-100 text-green-800' :
                    studentData.paidAmount > 0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(totalFee - studentData.paidAmount) <= 0 ? 'Paid' : studentData.paidAmount > 0 ? 'Partial' : 'Pending'}
                  </span>
                </div>

                {/* Fee Details */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500">Fee Records:</span>
                    <div className="font-medium text-gray-700">{studentData.fees.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Fee:</span>
                    <div className="font-medium text-blue-700">₹{totalFee.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <div className="font-medium text-gray-700">₹{studentData.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Paid:</span>
                    <div className="font-medium text-green-600">₹{studentData.paidAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Due:</span>
                    <div className="font-medium text-orange-600">₹{(totalFee - studentData.paidAmount).toLocaleString()}</div>
                  </div>
                </div>

                {/* Fee Types */}
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-500">Fee Types:</span>
                  <div className="text-xs text-gray-700">
                    {studentData.fees.map((f, index) => (
                      <div key={index}>{f.feeType}</div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewDetails(studentData)}
                    className="flex-1 min-w-0 flex items-center justify-center px-2 py-2 text-xs text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200"
                  >
                    <HiEye className="w-3 h-3 mr-1" />
                    <span className="truncate">View Details</span>
                  </button>
                  {/* {studentData.student?.phone && (
                    <a
                      href={`tel:${studentData.student.phone}`}
                      className="flex items-center justify-center px-3 py-2 text-xs text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 transition-all duration-200"
                    >
                      <HiPhone className="w-3 h-3" />
                    </a>
                  )} */}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {filteredFees.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">
            {fees.length === 0 ? 'No fees have been added yet' : 'No fees found matching your criteria'}
          </div>
          {fees.length === 0 && (
            <button
              onClick={() => navigate('/fees/add')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add First Fee
            </button>
          )}
        </div>
      )}

      {/* Fee Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">All Fee Records ({selectedFeeDetails.length})</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedFeeDetails.map((fee, index) => (
                      <tr key={fee._id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {fee.studentId?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Roll: {fee.studentId?.rollNumber || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{fee.feeType || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₹{(fee.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-green-600">₹{(fee.paidAmount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                            fee.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {fee.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(fee.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default ShowFees;