import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { studentAPI, feeAPI, departmentAPI, specialityAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { PrintStudentListButton, PrintPageButton } from '../../components/PrintButton';
import { HiSearch, HiPlus, HiEye, HiPencil, HiTrash, HiUsers, HiCheckCircle, HiCash, HiPrinter } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';
import * as XLSX from 'xlsx';

// Add Google Fonts
if (!document.querySelector('link[href*="Inter"]')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

// Add custom styles
if (!document.querySelector('#custom-dashboard-styles')) {
  const style = document.createElement('style');
  style.id = 'custom-dashboard-styles';
  style.textContent = `
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .dashboard-gradient {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .card-shadow {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    .card-hover {
      transition: all 0.3s ease;
    }
    
    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  `;
  document.head.appendChild(style);
}

const ShowStudents = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

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
    fetchStudents();
    
    // Check URL parameter for filter
    const filterParam = searchParams.get('filter');
    if (filterParam === 'paid') {
      setStatusFilter('Paid');
    }
  }, [searchParams]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Always fetch students, departments, and specialities
      const promises = [
        studentAPI.getAll(),
        departmentAPI.getAll(),
        specialityAPI.getAll()
      ];
      
      // Only fetch fees if user has fee permission
      const userRole = JSON.parse(localStorage.getItem('admin') || '{}');
      const hasFeePermission = userRole.permissions?.feeManagement || userRole.role === 'super_admin';
      
      if (hasFeePermission) {
        promises.push(feeAPI.getAll());
      }
      
      const responses = await Promise.all(promises);
      
      const studentsData = responses[0].data.data || responses[0].data || [];
      const departmentsData = responses[1].data.data || responses[1].data || [];
      const specialitiesData = responses[2].data.data || responses[2].data || [];
      const feesData = hasFeePermission && responses[3] ? (responses[3].data.data || responses[3].data || []) : [];
      
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setSpecialities(Array.isArray(specialitiesData) ? specialitiesData : []);
      setFees(Array.isArray(feesData) ? feesData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setStudents([]);
      setFees([]);
      setDepartments([]);
      setSpecialities([]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (department) => {
    if (typeof department === 'object' && department?.name) {
      return department.name;
    }
    return departments.find(d => d._id === department)?.name || 'N/A';
  };

  const getSpecialityName = (speciality) => {
    if (!speciality) return 'Not Selected';
    if (typeof speciality === 'object' && speciality?.name) {
      return speciality.name;
    }
    return specialities.find(s => s._id === speciality)?.name || 'N/A';
  };

  const calculateFeeStatus = (student) => {
    const totalFee = student.totalFee || 0;
    
    // Calculate paid amount from fee records
    const studentFees = fees.filter(fee => fee.studentId?._id === student._id);
    const paidFee = studentFees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
    
    const dueAmount = Math.max(0, totalFee - paidFee);
    const status = dueAmount <= 0 ? 'Paid' : paidFee > 0 ? 'Partial' : 'Due';
    return { status, dueAmount, totalFee, paidFee };
  };

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const departmentName = getDepartmentName(student.department);
    const specialityName = getSpecialityName(student.speciality);
    
    const matchesSearch = student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialityName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;

    const { status } = calculateFeeStatus(student);

    // Map filter status to actual status  
    let targetStatus = statusFilter;
    if (statusFilter === 'Overdue' || statusFilter === 'Pending') {
      targetStatus = 'Due';
    }

    return matchesSearch && status === targetStatus;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when search, filter, or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // const handleDelete = async (id) => {
  //   const student = students.find(s => s._id === id);

  //   const result = await Swal.fire({
  //     title: 'Delete Student?',
  //     html: `Are you sure you want to delete <strong>${student.name}</strong>?<br><small>This action cannot be undone.</small>`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#ef4444',
  //     cancelButtonColor: '#6b7280',
  //     confirmButtonText: 'Yes, Delete',
  //     cancelButtonText: 'Cancel'
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       await studentAPI.delete(id);
  //       toast.success('Student deleted successfully!');
  //       fetchStudents();
  //     } catch (error) {
  //       toast.error('Failed to delete student');
  //     }
  //   }
  // };

  const handleEdit = (id) => {
    navigate(`/students/edit/${id}`);
  };

  const handleViewDetails = (id) => {
    navigate(`/students/details/${id}`);
  };

  const handleFeeDetails = (id) => {
    navigate(`/students/fees/${id}`);
  };

  const handleExcelDownload = () => {
    const excelData = filteredStudents.map(student => ({
      'Name': student.name || 'N/A',
      'Roll Number': student.rollNumber || 'N/A',
      'Department': getDepartmentName(student.department),
      'Speciality': getSpecialityName(student.speciality),
      'Phone': student.phone || 'N/A',
      'Email': student.email || 'N/A',
      'Address': student.address || 'N/A',
      'Date of Birth': formatDate(student.dateOfBirth),
      'Total Fee': student.totalFee || 0,
      'Paid Fee': student.paidAmount || 0,
      'Due Amount': (student.totalFee || 0) - (student.paidAmount || 0),
      'Fee Status': calculateFeeStatus(student).status
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');

    const fileName = `Students_List_${new Date().toLocaleDateString('en-IN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success('Excel file downloaded successfully!');
  };

  const getStatusBadge = (status) => {
    const colorScheme = {
      'Paid': 'green',
      'Partial': 'blue',
      'Due': 'red'
    };
    return colorScheme[status] || 'gray';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Due': return 'bg-red-100 text-red-800';
      case 'Partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
          <div className="mb-6 text-xl font-semibold text-rose-600">{error}</div>
          <button
            onClick={fetchStudents}
            className="px-6 py-3 text-white bg-blue-400 rounded-xl hover:bg-blue-500 transition-all duration-300 font-semibold shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 min-h-screen bg-blue-50 p-3 sm:p-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Student Management</h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1">Manage all student records and information</p>
        </div>
        <div className="flex flex-col xs:flex-row sm:flex-row gap-2 sm:gap-3 w-full xs:w-auto sm:w-auto">
          <button
            onClick={handleExcelDownload}
            className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 space-x-2 text-white transition-all duration-300 rounded-lg sm:rounded-xl bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm lg:text-base min-h-[40px] sm:min-h-[44px]"
          >
            <HiPrinter className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Download Excel</span>
            <span className="sm:hidden">Excel</span>
          </button>
          <button
            onClick={() => navigate('/students/add')}
            className="flex items-center justify-center px-3 sm:px-4 lg:px-6 py-2 sm:py-3 space-x-2 text-white transition-all duration-300 rounded-lg sm:rounded-xl bg-blue-400 hover:bg-blue-500 shadow-lg hover:shadow-xl font-semibold text-xs sm:text-sm lg:text-base min-h-[40px] sm:min-h-[44px]"
          >
            <HiPlus className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Add New Student</span>
            <span className="sm:hidden">Add Student</span>
          </button>
        </div>
      </div>
      {/* Stats */}
      <div className="w-full grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-xl shadow-lg">
                <HiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-700">{students.length}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-xl shadow-lg">
                <HiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Full Fee Paid</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600">{students.filter(student => {
                const { status } = calculateFeeStatus(student);
                return status === 'Paid';
              }).length}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-xl shadow-lg">
                <HiCash className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Pending Fees</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">{students.filter(student => {
                const { status } = calculateFeeStatus(student);
                return status !== 'Paid';
              }).length}</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-400 rounded-xl shadow-lg">
                <HiCash className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-gray-500">Total Fee Amount</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 truncate">₹{students.reduce((sum, s) => sum + (s.totalFee || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar and Filters */}
      <div className="w-full max-w-full p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 sm:pl-4 pointer-events-none">
              <HiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 sm:py-4 pl-10 sm:pl-12 pr-3 sm:pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/90 backdrop-blur-sm font-medium text-gray-600 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['All', 'Paid', 'Pending'].map((filterStatus) => {
              const isActive = statusFilter === filterStatus;

              let buttonClasses = 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border-2 font-medium transition-all duration-200 text-xs sm:text-sm ';

              if (filterStatus === 'All') {
                buttonClasses += isActive
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500';
              } else if (filterStatus === 'Paid') {
                buttonClasses += isActive
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-500';
              } else if (filterStatus === 'Partial') {
                buttonClasses += isActive
                  ? 'bg-yellow-500 text-white border-yellow-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-500';
              } else if (filterStatus === 'Overdue') {
                buttonClasses += isActive
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-red-500 hover:text-red-500';
              } else if (filterStatus === 'Pending') {
                buttonClasses += isActive
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-orange-500 hover:text-orange-500';
              }

              return (
                <button
                  key={filterStatus}
                  onClick={() => setStatusFilter(filterStatus)}
                  className={buttonClasses}
                >
                  {filterStatus}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="w-full max-w-full bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-white/20 card-hover">
        {/* Desktop Table View */}
        <div className="hidden lg:block p-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Student Info
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Academic
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Fee Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
            <div className={`${itemsPerPage === filteredStudents.length && filteredStudents.length > 50 ? 'max-h-96 overflow-y-auto' : ''}`}>
              <table className="w-full">
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentStudents.map((student) => {
                    const { status, dueAmount, totalFee } = calculateFeeStatus(student);
                    return (
                      <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
                                <span className="text-white font-semibold text-sm">
                                  {student.name?.charAt(0) || 'S'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-700">
                                {student.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Roll: {student.rollNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-700">
                              {student.phone || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {student.email || 'N/A'}
                            </div>
                           
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-semibold text-gray-700">
                              Department: {getDepartmentName(student.department)}
                            </div>
                            <div className="text-sm text-gray-600 font-extra-semibold">
                              Speciality: {getSpecialityName(student.speciality)}
                            </div>
                            <div className="text-sm text-gray-500">
                              DOB: {formatDate(student.dateOfBirth)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${status === 'Paid' ? 'bg-green-100 text-green-700' :
                              status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                              {status}
                            </span>
                            <div className="text-sm font-medium text-gray-700">
                              Total: ₹{totalFee.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              Due: ₹{dueAmount.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(student._id)}
                              className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                              title="View Details"
                            >
                              <HiEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(student._id)}
                              className="p-2 text-orange-600 bg-orange-100 rounded-lg hover:bg-orange-200 transition-all duration-200"
                              title="Edit Student"
                            >
                              <HiPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleFeeDetails(student._id)}
                              className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200"
                              title="Fee Details"
                            >
                              <FaRupeeSign className="w-4 h-4" />
                            </button>
                            {/* <button
                              onClick={() => handleDelete(student._id)}
                              className="p-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200"
                              title="Delete Student"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-3 sm:p-4 w-full">
          <div className="space-y-3 sm:space-y-4 w-full">
            {currentStudents.map((student) => {
              const { status, dueAmount, totalFee } = calculateFeeStatus(student);
              return (
                <div key={student._id} className="w-full bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  {/* Student Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {student.name?.charAt(0) || 'S'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-700">
                          {student.name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Roll: {student.rollNumber || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status === 'Paid' ? 'bg-green-100 text-green-700' :
                      status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {status}
                    </span>
                  </div>

                  {/* Student Details */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-3 text-xs w-full">
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <div className="font-medium text-gray-700">{getDepartmentName(student.department)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Speciality:</span>
                      <div className="font-medium text-gray-700">{getSpecialityName(student.speciality)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <div className="font-medium text-gray-700">{student.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Fee:</span>
                      <div className="font-medium text-gray-700">₹{totalFee.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Fee Info */}
                  <div className="flex justify-between items-center mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="text-xs">
                      <span className="text-gray-500">Due Amount:</span>
                      <div className="font-semibold text-red-600">₹{dueAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 w-full">
                    <button
                      onClick={() => handleViewDetails(student._id)}
                      className="flex-1 min-w-0 flex items-center justify-center px-2 py-2 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      <HiEye className="w-3 h-3 mr-1" />
                      <span className="truncate">View</span>
                    </button>
                    <button
                      onClick={() => handleEdit(student._id)}
                      className="flex-1 min-w-0 flex items-center justify-center px-2 py-2 text-xs text-orange-600 bg-orange-100 rounded-lg hover:bg-orange-200 transition-all duration-200"
                    >
                      <HiPencil className="w-3 h-3 mr-1" />
                      <span className="truncate">Edit</span>
                    </button>
                    <button
                      onClick={() => handleFeeDetails(student._id)}
                      className="flex-1 min-w-0 flex items-center justify-center px-2 py-2 text-xs text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-all duration-200"
                    >
                      <FaRupeeSign className="w-3 h-3 mr-1" />
                      <span className="truncate">Fee</span>
                    </button>
                    {/* <button
                      onClick={() => handleDelete(student._id)}
                      className="flex items-center justify-center px-3 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200"
                    >
                      <HiTrash className="w-3 h-3" />
                    </button> */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination Controls - Only show if more than 50 students */}
        {filteredStudents.length > 50 && (
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 px-3 sm:px-6 pb-4 sm:pb-6 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-xs sm:text-sm text-gray-600">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={50}>50</option>
                  <option value={filteredStudents.length}>All</option>
                </select>
                <span className="text-xs sm:text-sm text-gray-600">per page</span>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;

                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg ${isCurrentPage
                          ? 'bg-blue-500 text-white'
                          : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  }

                  // Show ellipsis
                  if (
                    (page === currentPage - 2 && currentPage > 3) ||
                    (page === currentPage + 2 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-400">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
};

export default ShowStudents;