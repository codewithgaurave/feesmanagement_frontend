import React, { useState } from 'react';
import { notificationAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { HiMail, HiPhone, HiSpeakerphone } from 'react-icons/hi';

const NotificationTest = () => {
  const [testData, setTestData] = useState({
    email: '',
    phone: '',
    studentName: 'Test Student',
    amount: 5000,
    dueDate: '2025-02-15',
    feeType: 'Tuition Fee',
    message: 'This is a test notification for fee payment reminder.'
  });

  const [loading, setLoading] = useState({
    email: false,
    sms: false,
    call: false,
    bulk: false
  });

  const handleTestEmail = async () => {
    if (!testData.email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(prev => ({ ...prev, email: true }));
    
    try {
      const response = await notificationAPI.sendEmail({
        to: testData.email,
        subject: 'Test Fee Payment Reminder',
        studentName: testData.studentName,
        amount: testData.amount,
        dueDate: testData.dueDate,
        feeType: testData.feeType,
        message: testData.message
      });

      if (response.data.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      toast.error('Error sending test email: ' + error.message);
      console.error('Email test error:', error);
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleTestSMS = async () => {
    if (!testData.phone) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(prev => ({ ...prev, sms: true }));
    
    try {
      const response = await notificationAPI.sendSMS({
        phone: testData.phone,
        studentName: testData.studentName,
        amount: testData.amount,
        dueDate: testData.dueDate,
        feeType: testData.feeType,
        message: testData.message
      });

      if (response.data.success) {
        toast.success('Test SMS sent successfully!');
      } else {
        toast.error('Failed to send test SMS');
      }
    } catch (error) {
      toast.error('Error sending test SMS: ' + error.message);
      console.error('SMS test error:', error);
    } finally {
      setLoading(prev => ({ ...prev, sms: false }));
    }
  };

  const handleTestCall = async () => {
    if (!testData.phone) {
      toast.error('Please enter a phone number');
      return;
    }

    setLoading(prev => ({ ...prev, call: true }));
    
    try {
      const response = await notificationAPI.makeCall({
        phone: testData.phone,
        studentName: testData.studentName
      });

      if (response.data.success) {
        toast.success('Test call initiated successfully!');
      } else {
        toast.error('Failed to initiate test call');
      }
    } catch (error) {
      toast.error('Error initiating test call: ' + error.message);
      console.error('Call test error:', error);
    } finally {
      setLoading(prev => ({ ...prev, call: false }));
    }
  };

  const handleTestBulk = async () => {
    if (!testData.email && !testData.phone) {
      toast.error('Please enter at least email or phone number');
      return;
    }

    setLoading(prev => ({ ...prev, bulk: true }));
    
    try {
      const students = [
        {
          name: testData.studentName,
          email: testData.email,
          phone: testData.phone,
          amount: testData.amount,
          dueDate: testData.dueDate,
          feeType: testData.feeType
        }
      ];

      const response = await notificationAPI.sendBulkNotifications({
        students,
        type: 'both',
        message: testData.message,
        subject: 'Test Bulk Fee Payment Reminder'
      });

      if (response.data.success) {
        toast.success('Test bulk notifications sent successfully!');
      } else {
        toast.error('Failed to send test bulk notifications');
      }
    } catch (error) {
      toast.error('Error sending test bulk notifications: ' + error.message);
      console.error('Bulk test error:', error);
    } finally {
      setLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification System Test</h2>
        
        {/* Test Data Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Email Address
            </label>
            <input
              type="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="test@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Phone Number
            </label>
            <input
              type="tel"
              value={testData.phone}
              onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Name
            </label>
            <input
              type="text"
              value={testData.studentName}
              onChange={(e) => setTestData(prev => ({ ...prev, studentName: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Amount (₹)
            </label>
            <input
              type="number"
              value={testData.amount}
              onChange={(e) => setTestData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={testData.dueDate}
              onChange={(e) => setTestData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Type
            </label>
            <input
              type="text"
              value={testData.feeType}
              onChange={(e) => setTestData(prev => ({ ...prev, feeType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Message
          </label>
          <textarea
            value={testData.message}
            onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleTestEmail}
            disabled={loading.email || !testData.email}
            className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <HiMail className="w-5 h-5 mr-2" />
            {loading.email ? 'Sending...' : 'Test Email'}
          </button>
          
          <button
            onClick={handleTestSMS}
            disabled={loading.sms || !testData.phone}
            className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <HiPhone className="w-5 h-5 mr-2" />
            {loading.sms ? 'Sending...' : 'Test SMS'}
          </button>
          
          <button
            onClick={handleTestCall}
            disabled={loading.call || !testData.phone}
            className="flex items-center justify-center px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <HiSpeakerphone className="w-5 h-5 mr-2" />
            {loading.call ? 'Calling...' : 'Test Call'}
          </button>
          
          <button
            onClick={handleTestBulk}
            disabled={loading.bulk || (!testData.email && !testData.phone)}
            className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <HiMail className="w-5 h-5 mr-2" />
            {loading.bulk ? 'Sending...' : 'Test Bulk'}
          </button>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Instructions:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Enter your email and phone number to test notifications</li>
            <li>• Email notifications will be sent using nodemailer (configure SMTP in .env)</li>
            <li>• SMS notifications are currently mock (integrate with Twilio for real SMS)</li>
            <li>• Call functionality is mock (integrate with voice service for real calls)</li>
            <li>• Check browser console and server logs for detailed information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationTest;