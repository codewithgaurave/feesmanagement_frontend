import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const FeeManage = () => {
  const [activeTab, setActiveTab] = useState('show');
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [feeData, setFeeData] = useState({
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchStudents();
    fetchFees();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://feemanagment-full-backend-backup.onrender.com/api'}/students`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://feemanagment-full-backend-backup.onrender.com/api'}/fees`);
      const data = await response.json();
      setFees(data);
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const handleAddFee = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://feemanagment-full-backend-backup.onrender.com/api'}/fees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feeData, studentId: selectedStudent })
      });
      
      if (response.ok) {
        toast.success('Fee added successfully!');
        setFeeData({ amount: '', dueDate: '', description: '', status: 'pending' });
        setSelectedStudent('');
        fetchFees();
      }
    } catch (error) {
      toast.error('Error adding fee');
    }
  };

  const printFeeSlip = (fee) => {
    const student = students.find(s => s._id === fee.studentId);
    const printContent = `
      <div style="padding: 20px; font-family: Arial;">
        <h2>Fee Receipt</h2>
        <p><strong>Student:</strong> ${student?.name || 'N/A'}</p>
        <p><strong>Roll No:</strong> ${student?.rollNumber || 'N/A'}</p>
        <p><strong>Amount:</strong> ₹${fee.amount}</p>
        <p><strong>Description:</strong> ${fee.description}</p>
        <p><strong>Due Date:</strong> ${new Date(fee.dueDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${fee.status}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('show')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'show'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Show Fees
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Fee
          </button>
        </div>

        <div className="p-6">
          {/* Show Fees Tab */}
          {activeTab === 'show' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fees.map((fee) => {
                      const student = students.find(s => s._id === fee.studentId);
                      return (
                        <tr key={fee._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student?.name || 'N/A'}</div>
                              <div className="text-sm text-gray-500">{student?.rollNumber || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{fee.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(fee.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              fee.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {fee.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => printFeeSlip(fee)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                            >
                              Print Slip
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add Fee Tab */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddFee} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} - {student.rollNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    value={feeData.amount}
                    onChange={(e) => setFeeData({...feeData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={feeData.dueDate}
                    onChange={(e) => setFeeData({...feeData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={feeData.status}
                    onChange={(e) => setFeeData({...feeData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={feeData.description}
                  onChange={(e) => setFeeData({...feeData, description: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fee description..."
                />
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Add Fee
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeManage;