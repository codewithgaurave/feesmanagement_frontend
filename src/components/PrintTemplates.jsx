import React from 'react';

// Student List Template
export const StudentListTemplate = ({ students, filters = {} }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="print-content bg-white p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Institute Logo"
            style={{ width: "80px", height: "auto" }}
            className="mr-4"
          />
          <h1 className="text-4xl font-bold text-blue-800">CAREER MEDICAL COLLEGE</h1>
        </div>
        <p className="text-lg text-gray-700 font-semibold">www.careermedical.in</p>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
          <h2 className="text-2xl font-bold text-blue-700">📋 STUDENTS LIST REPORT</h2>
          <p className="text-sm text-gray-600 mt-2">Generated on: {formatDate(new Date())}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-bold text-blue-800">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">{students.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-bold text-green-800">Active Students</h3>
          <p className="text-3xl font-bold text-green-600">{students.length}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg text-center">
          <h3 className="text-lg font-bold text-yellow-800">Total Fee Amount</h3>
          <p className="text-2xl font-bold text-yellow-600">₹{students.reduce((sum, s) => sum + (s.totalFee || 0), 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3 text-left">S.No.</th>
              <th className="border border-gray-300 p-3 text-left">Name</th>
              <th className="border border-gray-300 p-3 text-left">Roll Number</th>
              <th className="border border-gray-300 p-3 text-left">Class</th>
              <th className="border border-gray-300 p-3 text-left">Phone</th>
              <th className="border border-gray-300 p-3 text-left">Total Fee</th>
              <th className="border border-gray-300 p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={student._id}>
                <td className="border border-gray-300 p-3">{index + 1}</td>
                <td className="border border-gray-300 p-3 font-medium">{student.name}</td>
                <td className="border border-gray-300 p-3">{student.rollNumber}</td>
                <td className="border border-gray-300 p-3">{student.class}</td>
                <td className="border border-gray-300 p-3">{student.phone}</td>
                <td className="border border-gray-300 p-3">₹{student.totalFee?.toLocaleString() || '0'}</td>
                <td className="border border-gray-300 p-3">
                  <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-gray-300 pt-6 mt-8 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-bold mb-2">🏥 CAREER MEDICAL COLLEGE</p>
          <p className="text-sm text-gray-700">Students List Report | This is a computer generated document.</p>
        </div>
      </div>
    </div>
  );
};

// Fee List Template
export const FeeListTemplate = ({ fees, filters = {} }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const totalAmount = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const paidAmount = fees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const dueAmount = totalAmount - paidAmount;

  return (
    <div className="print-content bg-white p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Institute Logo"
            style={{ width: "80px", height: "auto" }}
            className="mr-4"
          />
          <h1 className="text-4xl font-bold text-blue-800">CAREER MEDICAL COLLEGE</h1>
        </div>
        <p className="text-lg text-gray-700 font-semibold">www.careermedical.in</p>
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
          <h2 className="text-2xl font-bold text-blue-700">💰 FEES REPORT</h2>
          <p className="text-sm text-gray-600 mt-2">Generated on: {formatDate(new Date())}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-bold text-blue-800">Total Records</h3>
          <p className="text-2xl font-bold text-blue-600">{fees.length}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-bold text-gray-800">Total Amount</h3>
          <p className="text-2xl font-bold text-gray-600">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-bold text-green-800">Collected</h3>
          <p className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <h3 className="text-sm font-bold text-red-800">Due Amount</h3>
          <p className="text-2xl font-bold text-red-600">₹{dueAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left text-xs">S.No.</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Student Name</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Roll No.</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Fee Type</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Amount</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Due Date</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Status</th>
              <th className="border border-gray-300 p-2 text-left text-xs">Paid Date</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, index) => (
              <tr key={fee._id}>
                <td className="border border-gray-300 p-2 text-xs">{index + 1}</td>
                <td className="border border-gray-300 p-2 text-xs font-medium">{fee.studentId?.name || 'N/A'}</td>
                <td className="border border-gray-300 p-2 text-xs">{fee.studentId?.rollNumber || 'N/A'}</td>
                <td className="border border-gray-300 p-2 text-xs">{fee.feeType}</td>
                <td className="border border-gray-300 p-2 text-xs">₹{fee.amount?.toLocaleString()}</td>
                <td className="border border-gray-300 p-2 text-xs">{formatDate(fee.dueDate)}</td>
                <td className="border border-gray-300 p-2 text-xs">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    fee.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {fee.status?.toUpperCase()}
                  </span>
                </td>
                <td className="border border-gray-300 p-2 text-xs">{fee.status === 'paid' ? formatDate(fee.paidDate) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t-2 border-gray-300 pt-6 mt-8 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-bold mb-2">🏥 CAREER MEDICAL COLLEGE</p>
          <p className="text-sm text-gray-700">Fees Report | This is a computer generated document.</p>
        </div>
      </div>
    </div>
  );
};

// Fee Receipt Template
export const FeeReceiptTemplate = ({ fee, student }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="print-content bg-white p-8 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body { margin: 0; font-family: Arial, sans-serif; }
          .print-content { width: 100%; max-width: none; margin: 0; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Institute Logo"
            style={{ width: "80px", height: "auto" }}
            className="mr-4"
          />
          <h1 className="text-4xl font-bold text-blue-800">CAREER MEDICAL COLLEGE</h1>
        </div>
        <p className="text-lg text-gray-700 font-semibold">www.careermedical.in</p>
        <p className="text-sm text-gray-600">Affiliated to Medical University | Recognized by Medical Council</p>
        
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">📋 FEE PAYMENT RECEIPT</h2>
          <div className="flex justify-between">
            <p className="text-sm">Receipt No: <span className="font-bold">CMC-{fee._id?.slice(-6).toUpperCase()}</span></p>
            <p className="text-sm">Date: <span className="font-bold">{formatDate(new Date())}</span></p>
          </div>
        </div>
      </div>

      {/* Student & Fee Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4 border-b-2 border-blue-200 pb-2">📚 Student Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">Name:</span>
              <span className="font-bold">{student?.name || fee.studentId?.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">Roll Number:</span>
              <span className="font-bold">{student?.rollNumber || fee.studentId?.rollNumber}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">Class:</span>
              <span className="font-bold">{student?.class || fee.studentId?.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phone:</span>
              <span className="font-bold">{student?.phone || fee.studentId?.phone || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold mb-4 border-b-2 border-blue-200 pb-2">💰 Fee Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">Fee Type:</span>
              <span className="font-bold">{fee.feeType}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">Amount:</span>
              <span className="font-bold text-blue-600 text-lg">₹{fee.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-1">
              <span className="font-medium">Due Date:</span>
              <span className="font-bold">{formatDate(fee.dueDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                fee.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {fee.status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation */}
      {fee.status === 'paid' && (
        <div className="mb-8 bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <h3 className="text-lg font-bold text-green-800 mb-4">✅ Payment Confirmation</h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <span className="block text-green-700 font-medium mb-1">Paid Date</span>
              <span className="font-bold text-green-900">{formatDate(fee.paidDate)}</span>
            </div>
            <div>
              <span className="block text-green-700 font-medium mb-1">Payment Method</span>
              <span className="font-bold text-green-900">{fee.paymentMethod || 'Cash'}</span>
            </div>
            <div>
              <span className="block text-green-700 font-medium mb-1">Amount Paid</span>
              <span className="font-bold text-green-900 text-xl">₹{fee.amount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 mt-8">
        <div className="text-center bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-bold text-blue-800 mb-2">🏥 CAREER MEDICAL COLLEGE - OFFICIAL RECEIPT</p>
          <p className="text-sm text-gray-700">This is a computer generated receipt. No signature required.</p>
          <p className="text-xs text-gray-500 mt-2">Keep this receipt safe for future reference.</p>
        </div>
      </div>
    </div>
  );
};

// Due Fee Notice Template
export const DueFeeNoticeTemplate = ({ fee, student }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="print-content bg-white p-8 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body { margin: 0; font-family: Arial, sans-serif; }
          .print-content { width: 100%; max-width: none; margin: 0; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-red-600 pb-6">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Institute Logo"
            style={{ width: "80px", height: "auto" }}
            className="mr-4"
          />
          <h1 className="text-4xl font-bold text-red-800">CAREER MEDICAL COLLEGE</h1>
        </div>
        <p className="text-lg text-gray-700 font-semibold">www.careermedical.in</p>
        
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200 mt-4">
          <h2 className="text-2xl font-bold text-red-700 mb-2">⚠️ FEE PAYMENT NOTICE</h2>
          <p className="text-red-600 font-semibold">URGENT: Payment Required</p>
        </div>
      </div>

      {/* Notice Content */}
      <div className="mb-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-2">📢 PAYMENT REMINDER</h3>
          <p className="text-yellow-700">
            Dear <strong>{student?.name || fee.studentName}</strong>, this is to inform you that your fee payment is overdue. 
            Please make the payment at the earliest to avoid any inconvenience.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">📚 Student Details</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {student?.name || fee.studentName}</p>
              <p><span className="font-medium">Roll Number:</span> {student?.rollNumber || 'N/A'}</p>
              <p><span className="font-medium">Class:</span> {student?.class || fee.class}</p>
              <p><span className="font-medium">Phone:</span> {student?.phone || fee.phone}</p>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4 text-red-800">💰 Outstanding Amount</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Fee Type:</span> {fee.feeType}</p>
              <p><span className="font-medium">Due Amount:</span> <span className="text-red-600 font-bold text-xl">₹{fee.dueAmount?.toLocaleString() || fee.amount?.toLocaleString()}</span></p>
              <p><span className="font-medium">Due Date:</span> <span className="text-red-600 font-bold">{formatDate(fee.dueDate)}</span></p>
              <p><span className="font-medium">Days Overdue:</span> <span className="text-red-600 font-bold">{fee.daysOverdue || 0} days</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-bold text-blue-800 mb-4">💳 Payment Instructions</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">Office Payment:</h4>
            <p className="text-sm">Visit the Accounts Department</p>
            <p className="text-sm">Timing: 9 AM - 5 PM (Mon-Sat)</p>
            <p className="text-sm">Bring this notice for reference</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Contact Information:</h4>
            <p className="text-sm">Phone: +91 98765 43210</p>
            <p className="text-sm">Email: accounts@careermedical.in</p>
            <p className="text-sm">Website: www.careermedical.in</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-800 font-bold mb-2">⚠️ IMPORTANT NOTICE</p>
          <p className="text-sm text-gray-700">Please clear your dues immediately to avoid any academic inconvenience.</p>
          <p className="text-xs text-gray-500 mt-2">Generated on: {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
};

// Student Details Print Template
export const StudentDetailsTemplate = ({ student, fees = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="print-content bg-white p-8 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body { margin: 0; font-family: Arial, sans-serif; }
          .print-content { width: 100%; max-width: none; margin: 0; }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Institute Logo"
            style={{ width: "80px", height: "auto" }}
            className="mr-4"
          />
          <h1 className="text-4xl font-bold text-blue-800">CAREER MEDICAL COLLEGE</h1>
        </div>
        <p className="text-lg text-gray-700 font-semibold">www.careermedical.in</p>
        
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
          <h2 className="text-2xl font-bold text-blue-700">📋 STUDENT DETAILS REPORT</h2>
        </div>
      </div>

      {/* Student Information */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">📚 Student Information</h3>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <p><span className="font-medium">Full Name:</span> <span className="font-bold">{student.name}</span></p>
            <p><span className="font-medium">Roll Number:</span> <span className="font-bold">{student.rollNumber}</span></p>
            <p><span className="font-medium">Class:</span> <span className="font-bold">{student.class}</span></p>
            <p><span className="font-medium">Section:</span> <span className="font-bold">{student.section || 'N/A'}</span></p>
          </div>
          <div className="space-y-3">
            <p><span className="font-medium">Phone:</span> <span className="font-bold">{student.phone}</span></p>
            <p><span className="font-medium">Email:</span> <span className="font-bold">{student.email || 'N/A'}</span></p>
            <p><span className="font-medium">Admission Date:</span> <span className="font-bold">{formatDate(student.admissionDate)}</span></p>
            <p><span className="font-medium">Parent Name:</span> <span className="font-bold">{student.parentName || 'N/A'}</span></p>
          </div>
        </div>
        {student.address && (
          <div className="mt-4">
            <p><span className="font-medium">Address:</span> <span className="font-bold">{student.address}</span></p>
          </div>
        )}
      </div>

      {/* Fee Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">💰 Fee Summary</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <span className="block text-gray-600 font-medium mb-1">Total Fee</span>
              <span className="text-2xl font-bold text-blue-600">₹{student.totalFee?.toLocaleString() || '0'}</span>
            </div>
            <div>
              <span className="block text-gray-600 font-medium mb-1">Paid Amount</span>
              <span className="text-2xl font-bold text-green-600">₹{student.paidAmount?.toLocaleString() || '0'}</span>
            </div>
            <div>
              <span className="block text-gray-600 font-medium mb-1">Due Amount</span>
              <span className="text-2xl font-bold text-red-600">₹{student.dueAmount?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee History */}
      {fees.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-2">📊 Fee History</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Fee Type</th>
                  <th className="border border-gray-300 p-3 text-left">Amount</th>
                  <th className="border border-gray-300 p-3 text-left">Due Date</th>
                  <th className="border border-gray-300 p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{fee.feeType}</td>
                    <td className="border border-gray-300 p-3">₹{fee.amount?.toLocaleString()}</td>
                    <td className="border border-gray-300 p-3">{formatDate(fee.dueDate)}</td>
                    <td className="border border-gray-300 p-3">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${
                        fee.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {fee.status?.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-6 text-center">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-bold mb-2">🏥 CAREER MEDICAL COLLEGE</p>
          <p className="text-sm text-gray-700">Student Details Report | Generated on: {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
};