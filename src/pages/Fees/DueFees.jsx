import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { feeAPI, notificationAPI } from '../../utils/api';
import Loader from '../../components/Loader';
import { 
  HiCurrencyRupee, 
  HiUsers, 
  HiExclamationCircle, 
  HiCash, 
  HiBell, 
  HiPrinter, 
  HiPhone 
} from 'react-icons/hi';

const DueFees = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dueFees, setDueFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchDueFees();
  }, []);

  const fetchDueFees = async () => {
    try {
      if (!initialized) setLoading(true);
      setError('');
      
      // Try to get all fees first, then filter for due fees
      const response = await feeAPI.getAll();
      const feesData = response.data.data || response.data || [];
      
      // Filter for pending/overdue fees and group by student
      const pendingFees = feesData.filter(fee => 
        fee.status === 'pending' || fee.status === 'overdue' || 
        (fee.paidAmount || 0) < (fee.amount || 0)
      );
      
      // Group by student
      const studentFeeMap = new Map();
      
      pendingFees.forEach(fee => {
        const studentId = fee.studentId?._id || fee.studentId;
        const studentKey = studentId?.toString() || 'unknown';
        
        if (!studentFeeMap.has(studentKey)) {
          const today = new Date();
          const dueDate = new Date(fee.dueDate);
          const daysOverdue = Math.max(0, Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)));
          
          studentFeeMap.set(studentKey, {
            _id: fee._id,
            studentId: fee.studentId,
            studentName: fee.studentId?.name || 'Unknown Student',
            class: fee.studentId?.class || 'N/A',
            phone: fee.studentId?.phone || '',
            email: fee.studentId?.email || '',
            totalAmount: fee.amount || 0,
            paidAmount: fee.paidAmount || 0,
            dueAmount: (fee.amount || 0) - (fee.paidAmount || 0),
            feeType: fee.feeType || 'Fee',
            dueDate: fee.dueDate,
            daysOverdue: daysOverdue,
            paymentMethod: fee.paymentMethod || '',
            transactionId: fee.transactionId || '',
            checkNumber: fee.checkNumber || '',
            bankName: fee.bankName || '',
            fees: []
          });
        }
        
        const studentData = studentFeeMap.get(studentKey);
        studentData.fees.push({
          feeType: fee.feeType,
          amount: fee.amount,
          dueDate: fee.dueDate,
          status: fee.status
        });
        
        // Update totals
        if (studentData.fees.length > 1) {
          studentData.totalAmount += fee.amount || 0;
          studentData.paidAmount += fee.paidAmount || 0;
          studentData.dueAmount = studentData.totalAmount - studentData.paidAmount;
          studentData.feeType = 'Multiple Fees';
        }
      });
      
      const processedDueFees = Array.from(studentFeeMap.values());
      setDueFees(processedDueFees);
      
      console.log('Processed due fees:', processedDueFees);
      
    } catch (err) {
      console.error('Error fetching due fees:', err);
      if (!initialized) {
        setError('Failed to fetch due fees');
        setDueFees([]);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };



  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-xl text-red-500">{error}</div>
          <button 
            onClick={fetchDueFees}
            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use actual data from API
  const dataToUse = dueFees;
  
  const filteredDueFees = Array.isArray(dataToUse) ? dataToUse.filter(fee => {
    const studentName = fee?.studentId?.name || fee?.studentName || '';
    const feeType = fee?.feeType || '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           feeType.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  const getDuePriority = (daysOverdue) => {
    if (daysOverdue > 7) return { color: 'bg-red-100 text-red-800', label: 'Critical' };
    if (daysOverdue > 0) return { color: 'bg-orange-100 text-orange-800', label: 'Overdue' };
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Due Soon' };
  };

  // const handleSendReminder = async (fee) => {
  //   const studentName = fee.studentId?.name || fee.studentName || 'Unknown Student';
  //   const studentEmail = fee.studentId?.email || fee.email;
  //   const studentPhone = fee.studentId?.phone || fee.phone;
    
  //   if (!studentEmail && !studentPhone) {
  //     toast.error('No email or phone number available for this student');
  //     return;
  //   }
    
  //   const { value: reminderType } = await Swal.fire({
  //     title: 'Send Reminder',
  //     html: `Send payment reminder to <strong>${studentName}</strong>?<br><small>Due Amount: ₹${(fee.dueAmount || fee.amount || 0).toLocaleString()}</small>`,
  //     icon: 'question',
     
  //     inputOptions: {
  //       'email': `Email ${studentEmail ? '(' + studentEmail + ')' : '(Not available)'}`,
        
  //     },
  //     inputValue: 'both',
  //     showCancelButton: true,
  //     confirmButtonColor: '#f97316',
  //     cancelButtonColor: '#6b7280',
  //     confirmButtonText: 'Send Reminder',
  //     cancelButtonText: 'Cancel',
  //     inputValidator: (value) => {
  //       if (!value) return 'Please select a reminder type';
  //       if (value === 'email' && !studentEmail) return 'Email not available';
  //       if (value === 'sms' && !studentPhone) return 'Phone number not available';
  //       if (value === 'both' && !studentEmail && !studentPhone) return 'No contact information available';
  //     }
  //   });
    
  //   if (reminderType) {
  //     const loadingToast = toast.loading('Sending reminder...');
      
  //     try {
  //       const reminderData = {
  //         studentName,
  //         amount: fee.dueAmount || fee.amount || 0,
  //         dueDate: fee.dueDate,
  //         feeType: fee.feeType || 'Fee Payment',
  //         message: 'Please pay your fee at the earliest to avoid late charges.'
  //       };
        
  //       let emailSuccess = false;
  //       let smsSuccess = false;
        
  //       if (reminderType === 'email' || reminderType === 'both') {
  //         if (studentEmail) {
  //           try {
  //             await notificationAPI.sendEmail({
  //               to: studentEmail,
  //               ...reminderData
  //             });
  //             emailSuccess = true;
  //           } catch (error) {
  //             console.error('Email error:', error);
  //           }
  //         }
  //       }
        
  //       if (reminderType === 'sms' || reminderType === 'both') {
  //         if (studentPhone) {
  //           try {
  //             await notificationAPI.sendSMS({
  //               phone: studentPhone,
  //               ...reminderData
  //             });
  //             smsSuccess = true;
  //           } catch (error) {
  //             console.error('SMS error:', error);
  //           }
  //         }
  //       }
        
  //       toast.dismiss(loadingToast);
        
  //       if (reminderType === 'both') {
  //         if (emailSuccess && smsSuccess) {
  //           toast.success(`Reminder sent to ${studentName} via Email & SMS!`);
  //         } else if (emailSuccess) {
  //           toast.success(`Email reminder sent to ${studentName}!`);
  //           if (!smsSuccess) toast.error('SMS failed to send');
  //         } else if (smsSuccess) {
  //           toast.success(`SMS reminder sent to ${studentName}!`);
  //           if (!emailSuccess) toast.error('Email failed to send');
  //         } else {
  //           toast.error('Failed to send reminders');
  //         }
  //       } else if (reminderType === 'email' && emailSuccess) {
  //         toast.success(`Email reminder sent to ${studentName}!`);
  //       } else if (reminderType === 'sms' && smsSuccess) {
  //         toast.success(`SMS reminder sent to ${studentName}!`);
  //       } else {
  //         toast.error('Failed to send reminder');
  //       }
        
  //     } catch (error) {
  //       toast.dismiss(loadingToast);
  //       toast.error('Error sending reminder: ' + error.message);
  //       console.error('Reminder error:', error);
  //     }
  //   }
  // };

  const handleCollectFee = (fee) => {
    const prefillData = {
      studentId: fee.studentId?._id || fee.studentId,
      feeType: fee.feeType,
      amount: fee.dueAmount,
      dueDate: fee.dueDate,
      paymentMethod: fee.paymentMethod || '',
      transactionId: fee.transactionId || '',
      checkNumber: fee.checkNumber || '',
      bankName: fee.bankName || ''
    };
    navigate('/fees/add', { state: { prefillData } });
  };

  const totalDueAmount = filteredDueFees.reduce((sum, fee) => sum + (fee.dueAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Due Fees</h1>
          <p className="mt-1 text-gray-600">Manage overdue and upcoming fee payments</p>
        </div>
        {/* <div className="flex space-x-3">
          <button
            onClick={async () => {
              if (filteredDueFees.length === 0) {
                toast.error('No students with due fees found');
                return;
              }
              
              // const { value: bulkType } = await Swal.fire({
              //   title: 'Send Bulk Reminders',
              //   html: `Send payment reminders to all <strong>${filteredDueFees.length} students</strong> with due fees?`,
              //   icon: 'question',
              
              //   inputOptions: {
              //     'email': 'Email Only',
             
              //   },
              //   inputValue: 'both',
              //   showCancelButton: true,
              //   confirmButtonColor: '#f97316',
              //   cancelButtonColor: '#6b7280',
              //   confirmButtonText: 'Send All Reminders',
              //   cancelButtonText: 'Cancel'
              // });
              
              // if (bulkType) {
              //   const loadingToast = toast.loading(`Sending ${bulkType} reminders to ${filteredDueFees.length} students...`);
                
              //   try {
              //     const studentsData = filteredDueFees.map(fee => ({
              //       name: fee.studentId?.name || fee.studentName || 'Unknown Student',
              //       email: fee.studentId?.email || fee.email,
              //       phone: fee.studentId?.phone || fee.phone,
              //       amount: fee.dueAmount || fee.amount || 0,
              //       dueDate: fee.dueDate,
              //       feeType: fee.feeType || 'Fee Payment'
              //     }));
                  
              //     const response = await notificationAPI.sendBulkNotifications({
              //       students: studentsData,
              //       type: bulkType,
              //       message: 'This is a reminder for your pending fee payment. Please pay at the earliest to avoid late charges.',
              //       subject: 'Fee Payment Reminder - Urgent'
              //     });
                  
              //     toast.dismiss(loadingToast);
                  
              //     if (response.data.success) {
              //       const { successful, failed, total } = response.data.summary;
              //       toast.success(`Bulk reminders completed! ${successful}/${total} sent successfully`);
                    
              //       if (failed > 0) {
              //         toast.error(`${failed} reminders failed to send`);
              //       }
              //     } else {
              //       toast.error('Failed to send bulk reminders');
              //     }
                  
              //   } catch (error) {
              //     toast.dismiss(loadingToast);
              //     toast.error('Error sending bulk reminders: ' + error.message);
              //     console.error('Bulk reminder error:', error);
              //   }
              // }
            }}
            className="px-4 py-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
          >
            Send All Reminders
          </button>
          <button
            onClick={() => navigate('/fees/show')}
            className="px-4 py-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
          >
            All Fees
          </button>
        </div> */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-6 border border-red-200 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Due Amount</p>
              <p className="text-2xl font-bold text-red-800">₹{totalDueAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 text-white bg-red-500 rounded-xl">
              <HiCurrencyRupee className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Students with Due</p>
              <p className="text-2xl font-bold text-orange-800">{filteredDueFees.length}</p>
            </div>
            <div className="p-3 text-white bg-orange-500 rounded-xl">
              <HiUsers className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="p-6 border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Critical Cases</p>
              <p className="text-2xl font-bold text-yellow-800">
                {filteredDueFees.filter(fee => (fee.daysOverdue || 0) > 7).length}
              </p>
            </div>
            <div className="p-3 text-white bg-yellow-500 rounded-xl">
              <HiExclamationCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
        <input
          type="text"
          placeholder="Search by student name or fee type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Due Fees List */}
      <div className="space-y-4">
        {filteredDueFees.map(fee => {
          const priority = getDuePriority(fee.daysOverdue || 0);
          const studentName = fee.studentId?.name || fee.studentName || 'Unknown Student';
          return (
            <div key={fee._id || fee.id} className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 font-bold text-white rounded-full bg-gradient-to-br from-red-500 to-red-600">
                    {studentName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{studentName}</h3>
                    <p className="text-sm text-gray-600">{fee.studentId?.class || fee.class} • {fee.feeType}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${priority.color}`}>
                  {priority.label}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-5">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-gray-900">₹{(fee.totalAmount || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600">Paid Amount</p>
                  <p className="text-lg font-bold text-green-800">₹{(fee.paidAmount || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-600">Due Amount</p>
                  <p className="text-lg font-bold text-red-800">₹{(fee.dueAmount || 0).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600">Payment Method</p>
                  <p className="text-sm font-bold text-blue-800">{fee.paymentMethod || 'Not specified'}</p>
                  {fee.transactionId && (
                    <p className="text-xs text-gray-600 mt-1">Transaction ID: {fee.transactionId}</p>
                  )}
                  {fee.checkNumber && (
                    <p className="text-xs text-gray-600 mt-1">Check No: {fee.checkNumber}</p>
                  )}
                  {fee.bankName && (
                    <p className="text-xs text-gray-600 mt-1">Bank: {fee.bankName}</p>
                  )}
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-600">Due Date</p>
                  <p className="text-lg font-bold text-yellow-800">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A'}</p>
                  {fee.daysOverdue > 0 && (
                    <p className="text-xs text-red-600">{fee.daysOverdue} days overdue</p>
                  )}
                </div>
              </div>

              < div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleCollectFee(fee)}
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  <HiCash className="w-4 h-4" />
                  <span>Collect Fee</span>
                </button>
                {/* <button
                  onClick={() => handleSendReminder(fee)}
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600"
                >
                  <HiBell className="w-4 h-4" />
                  <span>Send Reminder</span>
                </button> */}
                <button
                  onClick={() => {
                    import('../../utils/printUtils').then(({ printDueFeeNotice }) => {
                      printDueFeeNotice(fee, { name: fee.studentName, phone: fee.phone, class: fee.class });
                    });
                  }}
                  className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600"
                >
                  <HiPrinter className="w-4 h-4" />
                  <span>Print Notice</span>
                </button>
                {/* {(fee.studentId?.phone || fee.phone) ? (
                  <a
                    href={`tel:${fee.studentId?.phone || fee.phone}`}
                    className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600"
                  >
                    <HiPhone className="w-4 h-4" />
                    <span>Call Student</span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="flex items-center px-4 py-2 space-x-2 text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed"
                    title="Phone number not available"
                  >
                    <HiPhone className="w-4 h-4" />
                    <span>No Phone</span>
                  </button>
                )} */}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDueFees.length === 0 && (
        <div className="py-12 text-center">
          <div className="text-lg text-gray-400">No due fees found</div>
        </div>
      )}
    </div>
  );
};

export default DueFees;