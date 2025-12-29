import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { feeAPI, studentAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { HiRefresh, HiArrowLeft, HiPlus } from 'react-icons/hi';

const AddFee = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'paid', // Set to paid when payment method is selected
    paymentMethod: '',
    transactionId: '',
    checkNumber: '',
    bankName: '',
    paidDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-') // DD-MM-YYYY format
  });

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [maxFeeAmount, setMaxFeeAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(true);
  const [paidFeeTypes, setPaidFeeTypes] = useState([]);

  const paymentMethods = [
    'Cash',
    'Cheque/DD',
    'UPI/Net Banking/RTGS'
  ];

  const feeTypes = [
     'Total fee',
    'Tuition Fee',
    'Hostel Fee',
    'Security Fee',
    'AC Charge',
    'Miscellaneous Fee',
    'Fine'
  ];

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = students.filter(student => {
      return (student.rollNumber?.toLowerCase() || '').includes(searchLower) ||
             (student.name?.toLowerCase() || '').includes(searchLower) ||
             (student.email?.toLowerCase() || '').includes(searchLower) ||
             (student.class?.toLowerCase() || '').includes(searchLower);
    });
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-set payment date and status when payment method is selected
    if (name === 'paymentMethod' && value) {
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-GB').replace(/\//g, '-');
      setFormData(prev => ({
        ...prev,
        [name]: value,
        status: 'paid',
        paidDate: formattedDate
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear search when student is selected and set selected student
    if (name === 'studentId' && value) {
      setSearchTerm('');
      const student = students.find(s => s._id === value);
      setSelectedStudent(student);
      checkPaidFeeTypes(value);
      // Clear amount when student changes
      setFormData(prev => ({ ...prev, amount: '' }));
      setMaxFeeAmount('');
    }
    
    // Clear selected student if no student selected
    if (name === 'studentId' && !value) {
      setSelectedStudent(null);
      setMaxFeeAmount('');
      setPaidFeeTypes([]);
      setFormData(prev => ({ ...prev, amount: '' }));
    }
    
    // Clear amount when fee type changes
    if (name === 'feeType') {
      setFormData(prev => ({ ...prev, amount: '' }));
      setMaxFeeAmount('');
    }
  };

  const checkPaidFeeTypes = async (studentId) => {
    try {
      const [studentResponse, feesResponse] = await Promise.all([
        studentAPI.getById(studentId),
        feeAPI.getByStudentId(studentId)
      ]);
      
      const student = studentResponse.data.data || studentResponse.data;
      const feesData = feesResponse.data.fees || feesResponse.data.data || [];
      
      const fullyPaidTypes = [];
      
      // Check each fee type
      const feeTypeAmounts = {
        'Tuition Fee': student.tuitionFee || 0,
        'Hostel Fee': student.hostelFee || 0,
        'Security Fee': student.securityFee || 0,
        'AC Charge': student.acCharge || 0,
        'Miscellaneous Fee': student.miscellaneousFee || 0
      };
      
      // Check if Total fee was paid (meaning all individual fees were paid at once)
      const totalFeePayments = feesData.filter(f => f.feeType === 'Total fee' && f.status === 'paid');
      const hasTotalFeePayment = totalFeePayments.length > 0;
      
      Object.entries(feeTypeAmounts).forEach(([feeType, totalAmount]) => {
        const paidAmount = feesData
          .filter(f => f.feeType === feeType && f.status === 'paid')
          .reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
        
        // If Total fee was paid, individual fees are considered fully paid
        // OR if individual fee is fully paid
        // OR if no amount is set for this fee type
        if (hasTotalFeePayment || paidAmount >= totalAmount || totalAmount === 0) {
          fullyPaidTypes.push(feeType);
        }
      });
      
      // Check Total fee status
      const totalFeeAmount = Object.values(feeTypeAmounts).reduce((sum, amount) => sum + amount, 0);
      const totalPaidAmount = feesData
        .filter(f => f.status === 'paid')
        .reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
      
      if (totalFeeAmount === 0 || totalPaidAmount >= totalFeeAmount) {
        fullyPaidTypes.push('Total fee');
      }
      
      setPaidFeeTypes(fullyPaidTypes);
    } catch (error) {
      console.error('Error checking paid fee types:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    
    if (location.state?.prefillData) {
      const data = location.state.prefillData;
      setFormData(prev => ({
        ...prev,
        studentId: data.studentId || data._id,
        feeType: data.feeType,
        amount: data.amount || data.dueAmount
      }));
    }
  }, [location.state]);

  const fetchStudents = async () => {
    try {
      setFetchingStudents(true);
      console.log('Fetching students...');
      
      // Check if auth token exists
      const token = localStorage.getItem('authToken');
      console.log('Auth token exists:', !!token);
      
      const response = await studentAPI.getAll();
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      const studentsData = response.data?.data || [];
      console.log('Students array:', studentsData);
      console.log('Students count:', studentsData.length);
      
      setStudents(studentsData);
      setFilteredStudents(studentsData);
      
      if (studentsData.length === 0) {
        console.log('No students found in response');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.response?.data?.message);
      
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Failed to fetch students: ${errorMsg}`);
      setStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.studentId) {
      toast.error('Please select a student');
      return;
    }
    
    if (!formData.feeType) {
      toast.error('Please select fee type');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    // Check if trying to pay for fully paid fee type
    if (maxFeeAmount === 0 && formData.feeType !== 'Fine') {
      toast.error(`${formData.feeType} is already fully paid!`);
      return;
    }
    
    if (!formData.paymentMethod) {
      toast.error('Please select payment method');
      return;
    }
    
    // Validate dates
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      const paidDate = new Date(formData.paidDate);
      
      // Check if due date is not in the past
      if (dueDate <= today) {
        toast.error('Due date must be after today\'s date');
        return;
      }
      
      // Check if due date and paid date are the same
      if (formData.dueDate === formData.paidDate) {
        toast.error('Due date and paid date cannot be the same');
        return;
      }
    }
    
    const enteredAmount = parseFloat(formData.amount);
    
    // Check if fee type is already fully paid (skip for Fine)
    if (formData.studentId && formData.feeType && formData.feeType !== 'Total fee' && formData.feeType !== 'Fine') {
      try {
        const [studentResponse, feesResponse] = await Promise.all([
          studentAPI.getById(formData.studentId),
          feeAPI.getByStudentId(formData.studentId)
        ]);
        
        const student = studentResponse.data.data || studentResponse.data;
        const feesData = feesResponse.data.fees || feesResponse.data.data || [];
        
        // Get total amount for this fee type
        let totalFeeForType = 0;
        switch(formData.feeType) {
          case 'Tuition Fee': totalFeeForType = student.tuitionFee || 0; break;
          case 'Hostel Fee': totalFeeForType = student.hostelFee || 0; break;
          case 'Security Fee': totalFeeForType = student.securityFee || 0; break;
          case 'AC Charge': totalFeeForType = student.acCharge || 0; break;
          case 'Miscellaneous Fee': totalFeeForType = student.miscellaneousFee || 0; break;
        }
        
        // Calculate already paid amount for this fee type
        const paidForThisFeeType = feesData
          .filter(f => f.feeType === formData.feeType && f.status === 'paid')
          .reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
        
        // Check if fee type is already fully paid
        if (paidForThisFeeType >= totalFeeForType && totalFeeForType > 0) {
          toast.error(`${formData.feeType} is already fully paid! Cannot add more payment.`);
          return;
        }
        
        // Check if new payment would exceed total
        if (paidForThisFeeType + enteredAmount > totalFeeForType && totalFeeForType > 0) {
          const remainingAmount = Math.max(0, totalFeeForType - paidForThisFeeType);
          toast.error(`Payment exceeds remaining amount! Only ₹${remainingAmount.toLocaleString()} is due for ${formData.feeType}.`);
          return;
        }
      } catch (error) {
        console.error('Error validating fee type payment:', error);
      }
    }
    
    // Validate Total fee payment
    if (formData.feeType === 'Total fee') {
      try {
        const [studentResponse, feesResponse] = await Promise.all([
          studentAPI.getById(formData.studentId),
          feeAPI.getByStudentId(formData.studentId)
        ]);
        
        const student = studentResponse.data.data || studentResponse.data;
        const feesData = feesResponse.data.fees || feesResponse.data.data || [];
        
        const totalAmount = (
          (student.tuitionFee || 0) +
          (student.hostelFee || 0) +
          (student.securityFee || 0) +
          (student.acCharge || 0) +
          (student.miscellaneousFee || 0)
        );
        
        // Calculate total paid amount across all fee types
        const totalPaidAmount = feesData
          .filter(f => f.status === 'paid')
          .reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
        
        if (totalPaidAmount >= totalAmount && totalAmount > 0) {
          toast.error('All fees are already fully paid! Cannot add more payment.');
          return;
        }
        
        const remainingAmount = Math.max(0, totalAmount - totalPaidAmount);
        if (enteredAmount > remainingAmount) {
          toast.error(`Payment exceeds remaining amount! Only ₹${remainingAmount.toLocaleString()} is due in total.`);
          return;
        }
      } catch (error) {
        console.error('Error validating total fee payment:', error);
      }
    }
    
    setLoading(true);
    
    try {
      // Log the data being sent for debugging
      console.log('Original form data:', formData);
      
      // Clean and prepare the data
      const cleanedData = {
        studentId: formData.studentId,
        feeType: formData.feeType,
        amount: parseFloat(formData.amount),
        paidAmount: parseFloat(formData.amount), // Since payment is being made
        status: 'paid',
        paymentMethod: formData.paymentMethod,
        description: formData.description || '',
        dueDate: formData.dueDate ? 
          new Date(formData.dueDate).toLocaleDateString('en-GB').replace(/\//g, '-') : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB').replace(/\//g, '-'),
        paidDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-')
      };
      
      // Add payment-specific fields based on payment method
      if (formData.paymentMethod === 'UPI/Net Banking/RTGS') {
        if (!formData.transactionId) {
          toast.error('Transaction ID is required for UPI/Net Banking/RTGS');
          setLoading(false);
          return;
        }
        cleanedData.transactionId = formData.transactionId;
        cleanedData.bankName = formData.bankName || '';
      }
      
      if (formData.paymentMethod === 'Cheque/DD') {
        if (!formData.checkNumber) {
          toast.error('Cheque/DD number is required');
          setLoading(false);
          return;
        }
        cleanedData.checkNumber = formData.checkNumber;
        cleanedData.bankName = formData.bankName || '';
      }
      
      console.log('Cleaned data to send:', cleanedData);
      
      const response = await feeAPI.create(cleanedData);
      console.log('Success response:', response.data);
      
      const student = students.find(s => s._id === formData.studentId);
      
      toast.success('Fee added successfully!');
      
      // Navigate back to fees list
      navigate('/fees/show');
      
      // Force refresh the fees list by triggering a page reload after navigation
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Fee creation error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to add fee. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid data provided. Please check all fields.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-8">
        <button
          onClick={() => navigate('/fees/show')}
          className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <HiRefresh className="w-4 h-4" />
          <span>Back to Fees</span>
        </button>
        <div className="min-w-0 flex-1 text-right mr-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mr-20">Add Fee</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Collect fee from students</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Student Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Student Selection</h3>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Search Student
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, roll number, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Select Student *
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                  disabled={fetchingStudents}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">
                    {fetchingStudents ? 'Loading students...' : 
                     filteredStudents.length === 0 ? 'No students found' : 'Choose a student'}
                  </option>
                  {filteredStudents.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} | {student.email || 'No email'} | Roll: {student.rollNumber} | {student.class}
                    </option>
                  ))}
                </select>
                {!fetchingStudents && filteredStudents.length === 0 && students.length > 0 && (
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">No students match your search</p>
                )}
                {!fetchingStudents && students.length === 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      No students found. Please{' '}
                      <button
                        type="button"
                        onClick={() => navigate('/students/add')}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        add students
                      </button>
                      {' '}first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Fee Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Fee Type *
                </label>
                <select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select fee type</option>
                  {feeTypes.map(type => {
                    // Always show Total fee and Fine
                    if (type === 'Total fee' || type === 'Fine') {
                      const isDisabled = paidFeeTypes.includes(type);
                      return (
                        <option 
                          key={type} 
                          value={type}
                          disabled={isDisabled && type !== 'Fine'}
                          className={isDisabled && type !== 'Fine' ? 'text-gray-400 bg-gray-100' : ''}
                        >
                          {type}{isDisabled && type !== 'Fine' ? ' (Fully Paid)' : ''}
                        </option>
                      );
                    }
                    
                    // Show other fee types only if they have remaining amounts
                    const isDisabled = paidFeeTypes.includes(type);
                    if (!isDisabled) {
                      return (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      );
                    }
                    
                    return null;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="text"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  onClick={async () => {
                    if (formData.studentId && formData.feeType) {
                      try {
                        const [studentResponse, feesResponse] = await Promise.all([
                          studentAPI.getById(formData.studentId),
                          feeAPI.getByStudentId(formData.studentId)
                        ]);
                        
                        const freshStudent = studentResponse.data.data || studentResponse.data;
                        const feesData = feesResponse.data.fees || feesResponse.data.data || [];
                        
                        if (formData.feeType === 'Total fee') {
                          const totalAmount = (
                            (freshStudent.tuitionFee || 0) +
                            (freshStudent.hostelFee || 0) +
                            (freshStudent.securityFee || 0) +
                            (freshStudent.acCharge || 0) +
                            (freshStudent.miscellaneousFee || 0)
                          );
                          
                          // Calculate total paid amount across all fee types
                          const totalPaidAmount = feesData
                            .filter(f => f.status === 'paid')
                            .reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
                          
                          const dueAmount = Math.max(0, totalAmount - totalPaidAmount);
                          setFormData(prev => ({ ...prev, amount: dueAmount > 0 ? dueAmount.toString() : '' }));
                          setMaxFeeAmount(dueAmount);
                          
                          if (dueAmount === 0) {
                            toast.info('All fees are already fully paid!');
                          }
                        } else if (formData.feeType !== 'Fine') {
                          let specificFeeAmount = 0;
                          switch(formData.feeType) {
                            case 'Tuition Fee': specificFeeAmount = freshStudent.tuitionFee || 0; break;
                            case 'Hostel Fee': specificFeeAmount = freshStudent.hostelFee || 0; break;
                            case 'Security Fee': specificFeeAmount = freshStudent.securityFee || 0; break;
                            case 'AC Charge': specificFeeAmount = freshStudent.acCharge || 0; break;
                            case 'Miscellaneous Fee': specificFeeAmount = freshStudent.miscellaneousFee || 0; break;
                          }
                          const paidForThisFeeType = feesData
                            .filter(f => f.feeType === formData.feeType && f.status === 'paid')
                            .reduce((sum, f) => sum + (f.paidAmount || f.amount || 0), 0);
                          const dueAmount = Math.max(0, specificFeeAmount - paidForThisFeeType);
                          setFormData(prev => ({ ...prev, amount: dueAmount > 0 ? dueAmount.toString() : '' }));
                          setMaxFeeAmount(dueAmount);
                          
                          if (dueAmount === 0) {
                            toast.info(`${formData.feeType} is already fully paid!`);
                          }
                        }
                        
                      } catch (error) {
                        console.error('Error fetching student data:', error);
                        toast.error('Failed to fetch student details');
                      }
                    } else {
                      if (!formData.studentId) toast.error('Please select a student first');
                      if (!formData.feeType) toast.error('Please select fee type first');
                    }
                  }}
                  required
                  placeholder={formData.feeType === 'Fine' ? 'Enter fine amount' : maxFeeAmount === 0 ? 'Fully Paid' : 'Click to calculate due amount'}
                  readOnly={formData.feeType === 'Total fee' || maxFeeAmount === 0}
                  disabled={maxFeeAmount === 0}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.feeType === 'Total fee' || maxFeeAmount === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
                {maxFeeAmount !== undefined && formData.feeType !== 'Fine' && (
                  <p className="mt-1 text-xs sm:text-sm text-blue-600">
                    {formData.feeType === 'Total fee' 
                      ? `Total Due Amount: ₹${maxFeeAmount?.toLocaleString()}` 
                      : `Due Amount: ₹${maxFeeAmount?.toLocaleString()}`
                    }
                    {maxFeeAmount === 0 && ' (Fully Paid)'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Next due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">Due date must be after today's date</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {formData.paymentMethod && formData.paymentMethod !== 'Cash' && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {formData.paymentMethod === 'UPI/Net Banking/RTGS' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                      <input
                        type="text"
                        name="transactionId"
                        value={formData.transactionId}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter transaction ID"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter bank name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                {formData.paymentMethod === 'Cheque/DD' && (
                  <>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Cheque/DD Number *</label>
                      <input
                        type="text"
                        name="checkNumber"
                        value={formData.checkNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter Cheque/DD number"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Bank Name *</label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter bank name"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div> 
                  </>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Additional Information</h3>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Remark *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/fees/show')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <HiRefresh className="animate-spin h-4 w-4" />
                  <span>Adding Fee...</span>
                </>
              ) : (
                <>
                  <HiRefresh className="w-4 h-4" />
                  <span>Add Fee</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFee;