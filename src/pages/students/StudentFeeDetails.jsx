import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, feeAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { PrintStudentDetailsButton } from '../../components/PrintButton';
import { HiArrowLeft, HiInformationCircle, HiEye, HiDocumentText, HiRefresh } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';
import { MdCheckCircle, MdError } from 'react-icons/md';

const StudentFeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentFees();
  }, [id]);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      setError('');

      // Get student info
      const studentResponse = await studentAPI.getById(id);
      const studentData = studentResponse.data.data || studentResponse.data;

      if (studentData) {
        setStudent(studentData);

        // Get student fees with cache busting
        try {
          const feesResponse = await feeAPI.getByStudentId(id);
          const feesData = feesResponse.data.data || feesResponse.data || [];
          setFees(Array.isArray(feesData) ? feesData : []);
        } catch (feeError) {
          console.log('No fees found for student:', feeError);
          setFees([]);
        }
      } else {
        throw new Error('Student not found');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch student fee details';
      setError(errorMessage);
      setStudent(null);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      // Check if date is valid (not in 1931 or other invalid years)
      if (date.getFullYear() < 1950 || date.getFullYear() > 2050) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateTotals = () => {
    // Use student's fee data if available, otherwise calculate from fee records
    if (student && student.totalFee !== undefined) {
      const totalAmount = student.totalFee || 0;
      const paidAmount = student.paidAmount || 0;
      const dueAmount = Math.max(0, totalAmount - paidAmount);
      return { totalAmount, paidAmount, dueAmount };
    }

    // Fallback to calculating from fee records
    const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const paidAmount = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    const dueAmount = totalAmount - paidAmount;
    return { totalAmount, paidAmount, dueAmount };
  };

  if (loading) {
    return (
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader />
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading student fee details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 text-lg sm:text-xl mb-4">{error}</div>
            <div className="text-xs sm:text-sm text-gray-600 mb-4">
              Student ID: {id}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={fetchStudentFees}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/students/show')}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Back to Students</span>
                <span className="sm:hidden">Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { totalAmount, paidAmount, dueAmount } = calculateTotals();

  // If no student data found, show error
  if (!loading && !student) {
    return (
      <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto">
            <div className="text-red-500 text-lg sm:text-xl mb-4">Student Not Found</div>
            <div className="text-xs sm:text-sm text-gray-600 mb-4">
              No student found with ID: {id}
            </div>
            <button
              onClick={() => navigate('/students/show')}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Back to Students</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              Fee Details - {student?.name || 'Student'}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Complete fee history for Roll No: {student?.rollNumber}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={fetchStudentFees}
              className="bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              disabled={loading}
            >
              <HiRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {/* <button
              onClick={() => window.print()}
              className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >  
              <HiDocumentText className="w-4 h-4" />
              <span className="hidden sm:inline">Print Details</span>
              <span className="sm:hidden">Print</span>
            </button> */}
            <button
              onClick={() => navigate('/students/show')}
              className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <HiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Students</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>

        {/* Status Info */}
        {student && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start sm:items-center space-x-2">
              <HiInformationCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 sm:mt-0 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-blue-700">
                Showing fee details for <strong>{student.name}</strong> (Roll: {student.rollNumber})
                {fees.length > 0 ? ` - ${fees.length} fee record(s) found` : ' - No fee records found'}
              </p>
            </div>
          </div>
        )}

        {/* Student Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Student Information</h3>
          {student ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Name</span>
                <p className="font-medium text-gray-900 text-sm sm:text-base break-words">{student.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Roll Number</span>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{student.rollNumber || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Department</span>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{student.class || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm text-gray-500">Speciality</span>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{student.section || (typeof student.speciality === 'object' ? student.speciality?.name : student.speciality) || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm sm:text-base">Student information not available</p>
            </div>
          )}
        </div>

        {/* Fee Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-600">Total Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-blue-500 text-white p-2 sm:p-3 rounded-xl">
                <FaRupeeSign className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-600">Paid Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">₹{paidAmount.toLocaleString()}</p>
              </div>
              <div className="bg-green-500 text-white p-2 sm:p-3 rounded-xl">
                <MdCheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl border border-red-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-red-600">Due Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-red-900">₹{dueAmount.toLocaleString()}</p>
              </div>
              <div className="bg-red-500 text-white p-2 sm:p-3 rounded-xl">
                <MdError className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Fee Records */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Fee Records ({fees.length})</h3>
          </div>

          {fees.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                <div className="divide-y divide-gray-200">
                  {fees.map((fee) => (
                    <div key={fee._id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{fee.feeType}</h4>
                          {fee.description && (
                            <p className="text-xs text-gray-500 mt-1">{fee.description}</p>
                          )}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {fee.status?.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <span className="ml-1 font-medium">₹{fee.amount?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Paid:</span>
                          <span className="ml-1 font-medium text-green-600">₹{(fee.paidAmount || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due:</span>
                          <span className="ml-1 font-medium text-red-600">₹{((fee.amount || 0) - (fee.paidAmount || 0)).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <span className="ml-1 font-medium">{formatDate(fee.dueDate)}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/fees/details/${fee._id}`)}
                          className="w-full bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fees.map((fee) => (
                      <tr key={fee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                          {fee.description && (
                            <div className="text-sm text-gray-500">{fee.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          ₹{fee.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600">
                          ₹{(fee.paidAmount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          ₹{((fee.amount || 0) - (fee.paidAmount || 0)).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(fee.dueDate)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                            {fee.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/fees/details/${fee._id}`)}
                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <HiDocumentText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
              <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No fee records found</h3>
              <p className="mt-1 text-xs sm:text-sm text-gray-500">No fees have been added for this student yet.</p>
              <button
                onClick={() => navigate('/fees/add')}
                className="mt-4 w-full sm:w-auto bg-blue-500 text-white px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-600 text-sm sm:text-base font-medium transition-colors"
              >
                Add Fee
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeeDetails;