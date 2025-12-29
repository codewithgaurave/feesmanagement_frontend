import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PrintReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState({
    studentName: '',
    rollNumber: '',
    course: '',
    semester: '',
    feeType: '',
    totalAmount: '',
    feeAmount: '',
    paymentDate: '',
    receiptNumber: '',
    paymentMethod: 'Cash',
    collegeName: 'Career Medical Institute',
    collegeAddress: 'Medical Education Campus, Healthcare City - 110001',
    collegePhone: '+91 11-2345-6789',
    collegeEmail: 'info@careermedical.in',
    affiliatedTo: 'Medical Council of India (MCI)',
    registrationNo: ''
  });

  const [students] = useState([
    { id: 1, name: 'Dr. Amit Sharma', rollNumber: 'MBBS001', course: 'MBBS', semester: '1st Year' },
    { id: 2, name: 'Priya Patel', rollNumber: 'MBBS002', course: 'MBBS', semester: '2nd Year' },
    { id: 3, name: 'Rahul Kumar', rollNumber: 'MD001', course: 'MD Medicine', semester: '1st Year' },
    { id: 4, name: 'Sneha Gupta', rollNumber: 'BDS001', course: 'BDS', semester: '3rd Year' }
  ]);

  useEffect(() => {
    if (id) {
      // Auto-fill data if coming from fee details
      const student = students.find(s => s.id.toString() === id);
      if (student) {
        setReceiptData(prev => ({
          ...prev,
          studentName: student.name,
          rollNumber: student.rollNumber,
          course: student.course,
          semester: student.semester,
          receiptNumber: `CMI${Date.now()}`,
          paymentDate: new Date().toISOString().split('T')[0]
        }));
      } else {
        // Try to get student data from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const studentData = {
          name: urlParams.get('name'),
          rollNumber: urlParams.get('rollNumber'),
          course: urlParams.get('course') || urlParams.get('class'),
          semester: urlParams.get('semester') || urlParams.get('section'),
          totalAmount: urlParams.get('totalFee'),
          feeAmount: urlParams.get('paidAmount') || '0'
        };
        
        if (studentData.name) {
          setReceiptData(prev => ({
            ...prev,
            studentName: studentData.name,
            rollNumber: studentData.rollNumber,
            course: studentData.course,
            semester: studentData.semester,
            totalAmount: studentData.totalAmount,
            feeAmount: studentData.feeAmount,
            receiptNumber: `CMI${Date.now()}`,
            paymentDate: new Date().toISOString().split('T')[0]
          }));
        }
      }
    } else {
      // Generate receipt number for manual entry
      setReceiptData(prev => ({
        ...prev,
        receiptNumber: `CMI${Date.now()}`,
        paymentDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [id]);

  const handleInputChange = (e) => {
    setReceiptData({
      ...receiptData,
      [e.target.name]: e.target.value
    });
  };

  const generateReceipt = () => {
    window.print();
  };

  const handlePrint = () => {
    if (!receiptData.studentName || !receiptData.feeAmount) {
      alert('Please fill in all required fields');
      return;
    }
    generateReceipt();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Print Receipt</h1>
          <p className="text-gray-600 mt-1">Generate fee receipt for students</p>
        </div>
        <button
          onClick={() => navigate('/fees/show')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Fees
        </button>
      </div>
      
      {/* Input Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Student Name *</label>
            <input
              type="text"
              name="studentName"
              placeholder="Enter student name"
              value={receiptData.studentName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Roll Number *</label>
            <input
              type="text"
              name="rollNumber"
              placeholder="Enter roll number"
              value={receiptData.rollNumber}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Course *</label>
            <select
              name="course"
              value={receiptData.course}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select course</option>
              <option value="MBBS">MBBS</option>
              <option value="BDS">BDS</option>
              <option value="MD Medicine">MD Medicine</option>
              <option value="MD Surgery">MD Surgery</option>
              <option value="MS Orthopedics">MS Orthopedics</option>
              <option value="B.Sc Nursing">B.Sc Nursing</option>
              <option value="M.Sc Nursing">M.Sc Nursing</option>
              <option value="B.Pharm">B.Pharm</option>
              <option value="D.Pharm">D.Pharm</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Semester/Year *</label>
            <input
              type="text"
              name="semester"
              placeholder="Enter semester/year"
              value={receiptData.semester}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type *</label>
            <select
              name="feeType"
              value={receiptData.feeType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select fee type</option>
              <option value="Tuition Fee">Tuition Fee</option>
              <option value="Admission Fee">Admission Fee</option>
              <option value="Exam Fee">Exam Fee</option>
              <option value="Library Fee">Library Fee</option>
              <option value="Laboratory Fee">Laboratory Fee</option>
              <option value="Clinical Training Fee">Clinical Training Fee</option>
              <option value="Hospital Training Fee">Hospital Training Fee</option>
              <option value="Hostel Fee">Hostel Fee</option>
              <option value="Medical Equipment Fee">Medical Equipment Fee</option>
              <option value="Registration Fee">Registration Fee</option>
              <option value="Development Fee">Development Fee</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Fee Amount *</label>
            <input
              type="number"
              name="totalAmount"
              placeholder="Enter total fee amount"
              value={receiptData.totalAmount}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount *</label>
            <input
              type="number"
              name="feeAmount"
              placeholder="Enter paid amount"
              value={receiptData.feeAmount}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
            <select
              name="paymentMethod"
              value={receiptData.paymentMethod}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
            <input
              type="date"
              name="paymentDate"
              value={receiptData.paymentDate}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number</label>
            <input
              type="text"
              name="receiptNumber"
              placeholder="Auto-generated"
              value={receiptData.receiptNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
            <input
              type="text"
              name="registrationNo"
              placeholder="Enter registration number"
              value={receiptData.registrationNo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print-area">
        <div className="text-center mb-8 border-b-2 border-blue-600 pb-6">
          <div className="flex items-center justify-center mb-2">
            <img
              src="/logo.png"
              alt="Institute Logo"
              style={{ width: "80px", height: "auto" }}
              className="mr-4"
            />
            <h1 className="text-4xl font-bold text-blue-800">{receiptData.collegeName}</h1>
          </div>
          <p className="text-lg font-semibold text-gray-700">Medical Education & Healthcare Institute</p>
          <p className="text-gray-600 mt-2">{receiptData.collegeAddress}</p>
          <div className="flex justify-center space-x-8 mt-2 text-sm text-gray-600">
            <span>Phone: {receiptData.collegePhone}</span>
            <span>Email: {receiptData.collegeEmail}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Affiliated to: {receiptData.affiliatedTo}</p>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-red-600 bg-red-50 inline-block px-6 py-2 rounded-lg border-2 border-red-200">FEE PAYMENT RECEIPT</h2>
          </div>
        </div>
        
        <div className="border-2 border-gray-300 rounded-xl p-6">
          <div className="flex justify-between mb-6 pb-4 border-b">
            <span className="font-semibold">Receipt No: <span className="text-blue-600">{receiptData.receiptNumber}</span></span>
            <span className="font-semibold">Date: <span className="text-blue-600">{receiptData.paymentDate}</span></span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600 text-sm font-medium">Student Name:</p>
              <p className="font-bold text-lg text-gray-900">{receiptData.studentName || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600 text-sm font-medium">Roll Number:</p>
              <p className="font-bold text-lg text-gray-900">{receiptData.rollNumber || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600 text-sm font-medium">Course:</p>
              <p className="font-bold text-lg text-gray-900">{receiptData.course || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600 text-sm font-medium">Semester/Year:</p>
              <p className="font-bold text-lg text-gray-900">{receiptData.semester || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600 text-sm font-medium">Fee Type:</p>
              <p className="font-bold text-lg text-gray-900">{receiptData.feeType || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-600 text-sm font-medium">Payment Method:</p>
              <p className="font-bold text-lg text-gray-900">{receiptData.paymentMethod}</p>
            </div>
            {receiptData.registrationNo && (
              <div className="bg-blue-50 p-3 rounded-lg md:col-span-2">
                <p className="text-blue-600 text-sm font-medium">Registration Number:</p>
                <p className="font-bold text-lg text-blue-800">{receiptData.registrationNo}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                <span className="text-xl font-bold text-gray-900">Total Fee:</span>
                <span className="text-2xl font-bold text-blue-600">₹{receiptData.totalAmount || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Paid Fee:</span>
                <span className="text-2xl font-bold text-green-600">₹{receiptData.feeAmount || '0'}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">Amount in Words: {receiptData.feeAmount ? `Rupees ${receiptData.feeAmount} Only` : 'Zero Rupees Only'}</p>
          </div>
          
          <div className="flex justify-between items-start pt-6 border-t-2 border-gray-300">
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700 mb-1">Important Notes:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Keep this receipt for future reference</li>
                <li>• Fee once paid is non-refundable</li>
                <li>• Contact office for any queries</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-gray-400 w-40 mb-2 mt-8"></div>
              <p className="text-sm font-semibold text-gray-700">Accounts Officer</p>
              <p className="text-xs text-gray-500">Career Medical Institute</p>
            </div>
          </div>
          
          <div className="text-center pt-4 mt-4 border-t border-gray-200">
            <p className="text-sm text-blue-600 font-medium mb-1">Thank you for choosing Career Medical Institute</p>
            <p className="text-xs text-gray-500">This is a computer generated receipt and does not require signature</p>
            <p className="text-xs text-gray-400 mt-1">For queries: info@careermedical.in | +91 11-2345-6789</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 no-print">
        <button
          onClick={() => navigate('/fees/show')}
          className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  );
};

export default PrintReceipt;