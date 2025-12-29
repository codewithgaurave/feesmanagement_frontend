import React from 'react';

const PrintReceipt = ({ fee, student, printType = 'receipt', onClose }) => {
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

  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    const printWindow = window.open('', '_blank');
    
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - ${student?.name || fee.studentId?.name}</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            .print-content { 
              width: 100%; 
              max-width: none; 
              margin: 0; 
              box-shadow: none;
              border-radius: 0;
              padding: 20px;
            }
            @media print {
              body { margin: 0; }
              .print-content { padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; font-family: Arial, sans-serif; }
            .print-content { 
              width: 100%; 
              max-width: none; 
              margin: 0; 
              box-shadow: none;
              border-radius: 0;
              padding: 20px;
            }
          }
        `}</style>

        <div className="p-8">
          {/* Header Buttons - No Print */}
          <div className="no-print flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {printType === 'summary' ? 'Fee Summary Preview' : 'Fee Receipt Preview'}
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center space-x-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print {printType === 'summary' ? 'Summary' : 'Receipt'}</span>
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-medium"
              >
                Close
              </button>
            </div>
          </div>

          {/* Receipt Content */}
          <div id="print-content" className="print-content border-2 border-gray-300 p-8 bg-white">
            {printType === 'summary' ? (
              // Summary Receipt
              <>
                <div className="text-center mb-6 border-b-2 border-blue-600 pb-4">
                  <div className="flex items-center justify-center mb-2">
                    <img
                      src="/logo.png"
                      alt="Institute Logo"
                      style={{ width: "80px", height: "auto" }}
                      className="mr-4"
                    />
                    <h1 className="text-3xl font-bold text-blue-800">CAREER MEDICAL COLLEGE</h1>
                  </div>
                  <h2 className="text-xl font-bold text-blue-700">Fee Payment Summary</h2>
                  <p className="text-sm text-gray-600 mt-2">Receipt No: CMC-{fee._id?.slice(-6).toUpperCase()} | Date: {formatDate(new Date())}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Student Details</h3>
                    <p><strong>Name:</strong> {student?.name || fee.studentId?.name}</p>
                    <p><strong>Roll No:</strong> {student?.rollNumber || fee.studentId?.rollNumber}</p>
                    <p><strong>Class:</strong> {student?.class || fee.studentId?.class}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Fee Information</h3>
                    <p><strong>Fee Type:</strong> {fee.feeType}</p>
                    <p><strong>Total Amount:</strong> ₹{fee.amount?.toLocaleString()}</p>
                    <p><strong>Paid Amount:</strong> ₹{(fee.paidAmount || fee.amount)?.toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={fee.status === 'paid' ? 'text-green-600' : 'text-red-600'}>{fee.status?.toUpperCase()}</span></p>
                  </div>
                </div>
                
                <div className="text-center bg-gray-100 p-4 rounded">
                  <p className="text-2xl font-bold text-blue-600">Total: ₹{fee.amount?.toLocaleString()}</p>
                  {fee.status === 'paid' && <p className="text-green-600 font-bold">✓ PAID IN FULL</p>}
                </div>
                
                <div className="text-center mt-6 text-sm text-gray-600">
                  <p>Career Medical College | www.careermedical.in</p>
                  <p>This is a computer generated summary receipt</p>
                </div>
              </>
            ) : (
              // Detailed Receipt
              <>
                {/* Header */}
                <div className="text-center mb-8 border-b-4 border-blue-600 pb-6">
                  <div className="flex items-center justify-center mb-4">
                    <img
                      src="/logo.png"
                      alt="Institute Logo"
                      style={{ width: "80px", height: "auto" }}
                      className="mr-4"
                    />
                    <div>
                      <h1 className="text-4xl font-bold text-blue-800 mb-2">CAREER MEDICAL COLLEGE</h1>
                      <p className="text-lg text-gray-700 font-semibold">www.careermedical.in</p>
                      <p className="text-sm text-gray-600 mt-1">Affiliated to Medical University | Recognized by Medical Council</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mt-4">
                    <h2 className="text-2xl font-bold text-blue-700 mb-2">📋 FEE PAYMENT RECEIPT</h2>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-700">Receipt No: <span className="font-bold text-blue-800">CMC-{fee._id?.slice(-6).toUpperCase()}</span></p>
                      <p className="text-sm text-gray-700">Date: <span className="font-bold text-blue-800">{formatDate(new Date())}</span></p>
                    </div>
                  </div>
                </div>

                {/* Student & Fee Details */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  {/* Student Details */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">
                      📚 Student Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-700 font-medium">Name:</span>
                        <span className="font-bold text-gray-900">{student?.name || fee.studentId?.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-700 font-medium">Roll Number:</span>
                        <span className="font-bold text-gray-900">{student?.rollNumber || fee.studentId?.rollNumber}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-700 font-medium">Class:</span>
                        <span className="font-bold text-gray-900">{student?.class || fee.studentId?.class}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">Phone:</span>
                        <span className="font-bold text-gray-900">{student?.phone || fee.studentId?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fee Details */}
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-blue-200 pb-2">
                      💰 Fee Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-700 font-medium">Fee Type:</span>
                        <span className="font-bold text-gray-900">{fee.feeType}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-700 font-medium">Total Amount:</span>
                        <span className="font-bold text-blue-600 text-lg">₹{fee.amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-1">
                        <span className="text-gray-700 font-medium">Due Date:</span>
                        <span className="font-bold text-gray-900">{formatDate(fee.dueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">Status:</span>
                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                          fee.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {fee.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Details (if paid) */}
                {fee.status === 'paid' && (
                  <div className="mb-8 bg-green-50 p-6 rounded-lg border-2 border-green-200">
                    <h3 className="text-lg font-bold text-green-800 mb-4 border-b-2 border-green-300 pb-2">
                      ✅ Payment Confirmation
                    </h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <span className="block text-green-700 font-medium mb-1">Paid Date</span>
                        <span className="font-bold text-green-900 text-lg">{formatDate(fee.paidDate)}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-green-700 font-medium mb-1">Payment Method</span>
                        <span className="font-bold text-green-900 text-lg">{fee.paymentMethod || 'Cash'}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-green-700 font-medium mb-1">Paid Amount</span>
                        <span className="font-bold text-green-900 text-xl">₹{(fee.paidAmount || fee.amount || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {fee.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-2">
                      📝 Additional Notes
                    </h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 italic">{fee.description}</p>
                  </div>
                )}

                {/* Amount Summary */}
                <div className="bg-gray-100 p-6 rounded-lg mb-6 border-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Total Amount</h3>
                      <p className="text-gray-600">Fee Amount Due</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        ₹{(fee.amount || 0).toLocaleString()}
                      </p>
                      {fee.status === 'paid' && (
                        <p className="text-lg text-green-600 font-bold">✓ PAID IN FULL</p>
                      )}
                      {fee.status === 'pending' && (
                        <p className="text-lg text-red-600 font-bold">⚠ PAYMENT PENDING</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-gray-300 pt-6 mt-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Receipt Information</h4>
                      <p className="text-sm text-gray-600">Generated on: <span className="font-medium">{formatDate(new Date())}</span></p>
                      <p className="text-sm text-gray-600">Generated by: <span className="font-medium">Admin</span></p>
                      <p className="text-sm text-gray-600">System: <span className="font-medium">Fee Management System</span></p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-gray-900 mb-2">Career Medical College</h4>
                      <p className="text-sm text-gray-600">Website: www.careermedical.in</p>
                      <p className="text-sm text-gray-600">Email: info@careermedical.in</p>
                      <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
                      <p className="text-sm text-gray-600">Office Hours: 9 AM - 5 PM (Mon-Sat)</p>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="mt-8 text-center bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-blue-800 font-bold mb-2">
                    🏥 CAREER MEDICAL COLLEGE - OFFICIAL FEE RECEIPT
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    📋 This is a computer generated receipt. No signature required.
                  </p>
                  <p className="text-sm text-gray-600">
                    For fee-related queries, contact the Accounts Department | www.careermedical.in
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Keep this receipt safe. Required for admission formalities and future reference.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintReceipt;