import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, feeAPI, notificationAPI } from '../../utils/api';
import { PrintStudentDetailsButton, PrintPageButton } from '../../components/PrintButton';
import FeeReceipt from '../../components/FeeReceipt';
import { createRoot } from 'react-dom/client';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { HiArrowLeft, HiUser, HiPencil, HiChatAlt, HiPhone, HiDocumentText, HiLightningBolt } from 'react-icons/hi';
import { FaRupeeSign } from 'react-icons/fa';

// Add print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-area, .print-area * {
      visibility: visible;
    }
    .print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    .print-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #000;
      padding-bottom: 10px;
    }
    .print-content {
      font-size: 12px;
      line-height: 1.4;
    }
    .print-section {
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .print-table th,
    .print-table td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    .print-table th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
  }
`;

// Add styles to document head
if (!document.querySelector('#print-styles')) {
  const style = document.createElement('style');
  style.id = 'print-styles';
  style.textContent = printStyles;
  document.head.appendChild(style);
}

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStudentData();
  }, [id]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      console.log('Loading student data for ID:', id);
      
      // Load student data with cache busting
      const studentRes = await studentAPI.getById(id);
      console.log('Student API response:', studentRes.data);
      
      const studentData = studentRes.data.data || studentRes.data;
      console.log('Student data:', studentData);
      
      // Calculate paid amount from fees
      let totalPaidAmount = 0;
      try {
        const feesRes = await feeAPI.getByStudentId(id);
        const feesData = feesRes.data.fees || feesRes.data.data || feesRes.data || [];
        console.log('Fees data:', feesData);
        
        totalPaidAmount = feesData
          .filter(fee => fee.status === 'paid')
          .reduce((sum, fee) => sum + (fee.paidAmount || fee.amount || 0), 0);
        
        console.log('Total paid amount calculated:', totalPaidAmount);
        setFees(Array.isArray(feesData) ? feesData : []);
      } catch (feeError) {
        console.log('No fees found for student:', feeError);
        setFees([]);
      }
      
      // Ensure fee fields are properly set with calculated values
      const processedStudent = {
        ...studentData,
        tuitionFee: studentData.tuitionFee || 0,
        hostelFee: studentData.hostelFee || 0,
        securityFee: studentData.securityFee || 0,
        miscellaneousFee: studentData.miscellaneousFee || 0,
        acCharge: studentData.acCharge || 0,
        totalFee: studentData.totalFee || 0,
        paidAmount: totalPaidAmount,
        dueAmount: Math.max(0, (studentData.totalFee || 0) - totalPaidAmount)
      };
      
      console.log('Processed student data:', processedStudent);
      setStudent(processedStudent);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      setStudent(null);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    if (!student?.phone) {
      toast.error('Student phone number not available');
      return;
    }

    setActionLoading(true);
    try {
      const dueAmount = student.dueAmount || 0;
      const message = `Dear ${student.name}, your fee payment is due. Please pay ₹${dueAmount.toLocaleString()} at your earliest convenience. Thank you.`;

      await notificationAPI.sendSMS({
        phone: student.phone,
        message: message,
        studentName: student.name,
        amount: dueAmount,
        email: student.email
      });
      toast.success('SMS sent successfully!');
    } catch (error) {
      console.error('Error sending SMS:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error sending SMS';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeCall = async () => {
    if (!student?.phone) {
      toast.error('Student phone number not available');
      return;
    }

    setActionLoading(true);
    try {
      await notificationAPI.makeCall({
        phone: student.phone,
        studentName: student.name
      });
      toast.success('Call initiated successfully!');
    } catch (error) {
      console.error('Error making call:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error making call';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayFee = async (feeId) => {
    setActionLoading(true);
    try {
      await feeAPI.payFee(feeId, { paymentMethod: 'cash' });
      toast.success('Fee payment recorded successfully!');
      loadStudentData(); // Reload data
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Error recording payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintPaymentReceipt = (fee) => {
    const printWindow = window.open('', '_blank');

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; min-height: 100vh; background-color: #f5f5f5; padding: 10px; display: flex; justify-content: center; align-items: center; font-family: Arial, sans-serif;">
            <div style="width: 100%; max-width: 700px; background-color: #ffffff; border: 3px solid #2c3e50; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); position: relative; page-break-inside: avoid; border-radius: 8px;">
              <!-- Watermark Logo -->
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; opacity: 0.1; pointer-events: none;">
                <img src="/src/assets/logo.png" alt="Watermark" style="width: 300px; height: 300px; object-fit: contain;" />
              </div>
              
              <!-- Header -->
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #34495e; position: relative; z-index: 2;">
                <div style="width: 60px; height: 60px; border: 2px solid #2c3e50; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #ecf0f1; flex-shrink: 0; overflow: hidden;">
                  <img src="/src/assets/logo.png" alt="Logo" style="width: 50px; height: 50px; object-fit: contain;" />
                </div>
                <div style="flex-grow: 1; text-align: center;">
                  <h1 style="color: #2c3e50; font-size: 16px; font-weight: bold; margin-bottom: 3px; letter-spacing: 0.5px;">CAREER INSTITUTE OF MEDICAL SCIENCES & HOSPITAL</h1>
                  <p style="color: #34495e; font-size: 12px; margin-bottom: 3px;">IIM ROAD, GHAILLA LUCKNOW - 226 013</p>
                  <p style="color: #34495e; font-size: 11px; font-weight: 600;">(PAYMENT RECEIPT)</p>
                </div>
              </div>
              
              <!-- Receipt Details -->
              <div style="margin-bottom: 10px; position: relative; z-index: 2;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Receipt No.</span>
                    <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 80px;">CIMS${Math.floor(Math.random() * 90000) + 10000}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 5px; margin-left: auto;">
                    <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Date</span>
                    <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none;">${new Date().toLocaleDateString('en-CA')}</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Name</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 180px;">${student?.name || ''}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Roll No.</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 80px;">${student?.rollNumber || ''}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Department:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${student?.class || student?.department || 'MBBS'}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Speciality:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${(student?.class?.toUpperCase() === 'MBBS' || student?.class?.toUpperCase() === 'BDS' || student?.department?.toUpperCase() === 'MBBS' || student?.department?.toUpperCase() === 'BDS') ? '' : (typeof student?.section === 'object' ? student?.section?.name : student?.section) || (typeof student?.speciality === 'object' ? student?.speciality?.name : student?.speciality) || 'N/A'}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Parent Name:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 150px;">${student?.guardianName || student?.parentName || ''}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Address:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 120px;">${student?.address || ''}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Payment Method:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 80px;">${fee?.paymentMethod || 'Cash'}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Payment Date:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 80px;">${fee?.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Cheque/DD No:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${fee?.chequeNumber || fee?.transactionId || 'CHQ' + Math.floor(Math.random() * 900000 + 100000)}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Bank Name:</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${fee?.bankName || 'Main department'}</span>
                </div>
              </div>
              
              <!-- Payment Details -->
              <div style="margin-bottom: 15px; position: relative; z-index: 2; background-color: #f8f9fa; padding: 10px; border: 1px solid #dee2e6; border-radius: 3px;">
                <h3 style="color: #2c3e50; font-size: 14px; font-weight: bold; margin-bottom: 10px; text-align: center;">PAYMENT DETAILS</h3>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6c757d; font-weight: 600; font-size: 12px;">Fee Type:</span>
                  <span style="color: #2c3e50; font-size: 12px;">${fee?.feeType || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6c757d; font-weight: 600; font-size: 12px;">Amount Paid:</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: bold;">₹${(fee?.paidAmount || fee?.amount || 0).toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6c757d; font-weight: 600; font-size: 12px;">Status:</span>
                  <span style="color: #28a745; font-size: 12px; font-weight: bold;">${fee?.status?.toUpperCase() || 'PAID'}</span>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 15px; border-top: 1px solid #bdc3c7; position: relative; z-index: 2;">
                <div style="color: #7f8c8d; font-size: 10px; font-style: italic;">* This is a computer generated receipt</div>
                <div style="text-align: right;">
                  <div style="color: #2c3e50; font-size: 12px; font-weight: 600; padding-top: 30px; border-top: 1px solid #2c3e50; min-width: 150px; text-align: center;">Authorised Signatory</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');

    // Calculate fee type wise breakdown - only show fees with due amounts
    const feeBreakdown = [
      { type: 'Tuition Fee', total: student?.tuitionFee || 0 },
      { type: 'Hostel Fee', total: student?.hostelFee || 0 },
      { type: 'Security Fee', total: student?.securityFee || 0 },
      { type: 'Miscellaneous Fee', total: student?.miscellaneousFee || 0 },
      { type: 'AC Charge', total: student?.acCharge || 0 }
    ].filter(fee => fee.total > 0);

    // Calculate paid amounts for each fee type based on total paid amount
    const totalPaidAmount = student?.paidAmount || 0;
    let remainingPaid = totalPaidAmount;
    
    feeBreakdown.forEach(fee => {
      if (remainingPaid >= fee.total) {
        fee.paid = fee.total;
        fee.due = 0;
        remainingPaid -= fee.total;
      } else if (remainingPaid > 0) {
        fee.paid = remainingPaid;
        fee.due = fee.total - remainingPaid;
        remainingPaid = 0;
      } else {
        fee.paid = 0;
        fee.due = fee.total;
      }
    });

    // Filter to show only fees with due amounts
    const feesWithDue = feeBreakdown.filter(fee => fee.due > 0);

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt</title>
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
            @media print {
              body { margin: 0; padding: 0; }
              @page { size: A4; margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; min-height: 100vh; background-color: #f5f5f5; padding: 10px; display: flex; justify-content: center; align-items: center; font-family: Arial, sans-serif;">
            <div style="width: 100%; max-width: 700px; background-color: #ffffff; border: 3px solid #2c3e50; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); position: relative; page-break-inside: avoid; border-radius: 8px;">
              <!-- Watermark Logo -->
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; opacity: 0.1; pointer-events: none;">
                <img src="/src/assets/logo.png" alt="Watermark" style="width: 300px; height: 300px; object-fit: contain;" />
              </div>
              <!-- Header -->
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #34495e; position: relative; z-index: 2;">
                <div style="width: 60px; height: 60px; border: 2px solid #2c3e50; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: #ecf0f1; flex-shrink: 0; overflow: hidden;">
                  <img src="/src/assets/logo.png" alt="Logo" style="width: 50px; height: 50px; object-fit: contain;" />
                </div>
                <div style="flex-grow: 1; text-align: center;">
                  <h1 style="color: #2c3e50; font-size: 16px; font-weight: bold; margin-bottom: 3px; letter-spacing: 0.5px;">CAREER INSTITUTE OF MEDICAL SCIENCES & HOSPITAL</h1>
                  <p style="color: #34495e; font-size: 12px; margin-bottom: 3px;">IIM ROAD, GHAILLA LUCKNOW - 226 013</p>
                  <p style="color: #34495e; font-size: 11px; font-weight: 600;">(STUDENT FILE COPY)</p>
                </div>
              </div>
              
              <!-- Receipt Details -->
              <div style="margin-bottom: 10px; position: relative; z-index: 2;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Receipt No.</span>
                    <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 80px;">CIMS${Math.floor(Math.random() * 90000) + 10000}</span>
                  </div>
                  <div style="display: flex; align-items: center; gap: 5px; margin-left: auto;">
                    <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Date</span>
                    <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none;">${new Date().toLocaleDateString('en-CA')}</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">F.Y.</span>
                    <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 60px;">2025-26</span>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Name</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 200px;">${student?.name || ''}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Batch :</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 80px;">${student?.class || 'MBBS'}</span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Roll No.</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${student?.rollNumber || ''}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Phone :</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${student?.phone || ''}</span>
                  <span style="color: #2c3e50; font-size: 12px; font-weight: 600;">Speciality :</span>
                  <span style="border: none; border-bottom: 1px dotted #7f8c8d; padding: 2px 5px; font-size: 12px; color: #2c3e50; background-color: transparent; outline: none; width: 100px;">${(student?.class?.toUpperCase() === 'MBBS' || student?.class?.toUpperCase() === 'BDS' || student?.department?.toUpperCase() === 'MBBS' || student?.department?.toUpperCase() === 'BDS') ? '' : (typeof student?.section === 'object' ? student?.section?.name : student?.section) || (typeof student?.speciality === 'object' ? student?.speciality?.name : student?.speciality) || 'Fee Receipt'}</span>
                </div>
              </div>
              
              <!-- Fee Table -->
              <div style="margin-bottom: 20px; border: 2px solid #34495e; position: relative; z-index: 2;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #ecf0f1;">
                      <th style="color: #2c3e50; font-size: 15px; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #34495e; width: 10%;">S.No.</th>
                      <th style="color: #2c3e50; font-size: 15px; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #34495e; width: 40%;">Fee Structure</th>
                      <th style="color: #2c3e50; font-size: 15px; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #34495e; width: 16%;">Total Amount</th>
                      <th style="color: #2c3e50; font-size: 15px; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #34495e; width: 17%;">Due Amount</th>
                      <th style="color: #2c3e50; font-size: 15px; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #34495e; width: 17%;">Paid Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${feeBreakdown.map((fee, index) => `
                      <tr style="border: 1px solid #bdc3c7;">
                        <td style="text-align: center; padding: 8px; color: #2c3e50; font-size: 14px; border: 1px solid #bdc3c7;">${index + 1}</td>
                        <td style="padding: 8px 15px; color: #34495e; font-size: 14px; border: 1px solid #bdc3c7;">${fee.type}</td>
                        <td style="text-align: right; padding: 8px 15px; color: #2c3e50; font-size: 14px; border: 1px solid #bdc3c7;">₹${fee.total.toLocaleString()}</td>
                        <td style="text-align: right; padding: 8px 15px; color: #dc3545; font-size: 14px; border: 1px solid #bdc3c7;">₹${fee.due.toLocaleString()}</td>
                        <td style="text-align: right; padding: 8px 15px; color: #28a745; font-size: 14px; border: 1px solid #bdc3c7;">₹${fee.paid.toLocaleString()}</td>
                      </tr>
                    `).join('')}
                    <tr style="background-color: #ecf0f1; font-weight: bold;">
                      <td colspan="2" style="text-align: center; padding: 12px; color: #2c3e50; font-size: 15px; font-weight: bold; border: 1px solid #34495e;">TOTAL AMOUNT</td>
                      <td style="text-align: right; padding: 12px 15px; color: #2c3e50; font-size: 15px; font-weight: bold; border: 1px solid #34495e;">₹${(student?.totalFee || 0).toLocaleString()}</td>
                      <td style="text-align: right; padding: 12px 15px; color: #dc3545; font-size: 15px; font-weight: bold; border: 1px solid #34495e;">₹${(student?.dueAmount || 0).toLocaleString()}</td>
                      <td style="text-align: right; padding: 12px 15px; color: #28a745; font-size: 15px; font-weight: bold; border: 1px solid #34495e;">₹${(student?.paidAmount || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Payment Details -->
               
              
              <!-- Footer -->
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; position: relative; z-index: 2;">
                <div style="color: #7f8c8d; font-size: 12px; font-style: italic;">* Subject to encashment of cheque</div>
                <div style="text-align: right;">
                  <div style="color: #2c3e50; font-size: 14px; font-weight: 600; padding-top: 40px; border-top: 1px solid #2c3e50; min-width: 180px; text-align: center;">Authorised Signatory</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  if (loading) return <Loader />;

  if (!student) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
        <button
          onClick={() => navigate('/students/show')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Student Details</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Complete information about <b className='text-xl'>{student.name}</b></p>
        </div>
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/students/show')}
              className="flex items-center justify-center px-3 py-2 text-sm text-white bg-gray-500 rounded-lg hover:bg-gray-600 transition-colors duration-200"
            >
              <HiArrowLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Back to Students</span>
              <span className="sm:hidden">Back</span>
            </button>
            {/* <button
              onClick={() => window.print()}
              className="flex items-center justify-center px-3 py-2 text-sm text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              <HiDocumentText className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Print Details</span>
              <span className="sm:hidden">Print</span>
            </button> */}

          </div>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <HiUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Full Name</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{student.name}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Roll Number</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{student.rollNumber}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Department</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{typeof student.class === 'object' ? student.class?.name : student.class || typeof student.department === 'object' ? student.department?.name : student.department || 'N/A'}</p>
            </div>
            {(student.section || student.speciality) && (
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Speciality</p>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{typeof student.section === 'object' ? student.section?.name : student.section || typeof student.speciality === 'object' ? student.speciality?.name : student.speciality}</p>
              </div>
            )}
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{student.phone}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base break-all">{student.email}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base">
                {student.dateOfBirth && student.dateOfBirth !== '' ?
                  new Date(student.dateOfBirth).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{student.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Parent/Guardian & Academic Information */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <HiUser className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
            Parent & Academic Info
          </h3>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Parent Name</p>
              <p className="font-medium text-gray-900 text-sm">{student.guardianName || student.parentName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Parent Phone</p>
              <p className="font-medium text-gray-900 text-sm">{student.guardianPhone || student.parentPhone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Admission Date</p>
              <p className="font-medium text-gray-900 text-sm">{student.admissionDate ? new Date(student.admissionDate).toLocaleDateString('en-IN') : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fee Type</p>
              <p className="font-medium text-gray-900 text-sm">{student.feeType || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Fee Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
            <FaRupeeSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
            Fee Summary
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-500">Total Fee</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">₹{student.totalFee?.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-green-600">Paid Amount</p>
              <p className="text-base sm:text-xl font-semibold text-green-700">₹{(student.paidAmount || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-red-600">Due Amount</p>
              <p className="text-base sm:text-xl font-semibold text-red-700">₹{(student.dueAmount || 0).toLocaleString()}</p>
            </div>
            <div className="pt-2">
              <p className="text-xs sm:text-sm text-gray-500">Fee Status</p>
              <span className={`inline-flex px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-full ${(student.dueAmount || 0) <= 0 ? 'bg-green-100 text-green-800' :
                (student.paidAmount || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                {(student.dueAmount || 0) <= 0 ? 'COMPLETE' :
                  (student.paidAmount || 0) > 0 ? 'PARTIAL' : 'DUE'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Fee Breakdown - Full Width */}
      <div className="w-full bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <FaRupeeSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
          Fee Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500">Tuition Fee</p>
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <p className="font-medium text-blue-900 text-sm">₹{(student.tuitionFee || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Hostel Fee</p>
            <p className="font-medium text-gray-900 text-sm">₹{(student.hostelFee || 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Security Fee</p>
            <p className="font-medium text-gray-900 text-sm">₹{(student.securityFee || 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Miscellaneous Fee</p>
            <p className="font-medium text-gray-900 text-sm">₹{(student.miscellaneousFee || 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">AC Charge</p>
            <p className="font-medium text-gray-900 text-sm">₹{(student.acCharge || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions - Full Width */}
      <div className="w-full bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <HiLightningBolt className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
          Quick Actions
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => navigate(`/students/edit/${student._id}`)}
            className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <HiPencil className="w-4 h-4" />
            <span>Edit Student</span>
          </button>
          <button
            onClick={() => navigate(`/students/fees/${student._id}`)}
            className="flex-1 bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <HiDocumentText className="w-4 h-4" />
            <span>Fee Details</span>
          </button>
          <button
            onClick={handlePrintReceipt}
            className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm"
          >
            <HiDocumentText className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Fee History */}
      <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
            <HiDocumentText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-600" />
            Fee History
          </h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fees.map((fee) => (
                <tr key={fee._id || fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.feeType}</div>
                    {fee.receiptNumber && (
                      <div className="text-sm text-gray-500">Receipt: {fee.receiptNumber}</div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{fee.amount?.toLocaleString()}</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Next Due date: {fee.dueDate ? (() => {
                      const date = new Date(fee.dueDate);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    })() : 'N/A'}</div>
                    {fee.paidDate && (
                      <div className="text-sm text-green-600">Paid Date: {(() => {
                        const date = new Date(fee.paidDate);
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      })()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                      fee.status === 'due' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {fee.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {fee.status !== 'paid' && (
                        <button
                          onClick={() => handlePayFee(fee._id || fee.id)}
                          disabled={actionLoading}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50 text-xs px-2 py-1 border border-green-600 rounded"
                        >
                          Mark as Paid
                        </button>
                      )}
                      <button
                        onClick={() => handlePrintPaymentReceipt(fee)}
                        className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 border border-blue-600 rounded flex items-center gap-1"
                      >
                        <HiDocumentText className="w-3 h-3" />
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {fees.map((fee) => (
              <div key={fee._id || fee.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                {/* Fee Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{fee.feeType}</div>
                    {fee.receiptNumber && (
                      <div className="text-xs text-gray-500">Receipt: {fee.receiptNumber}</div>
                    )}
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                    fee.status === 'due' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {fee.status?.toUpperCase()}
                  </span>
                </div>

                {/* Fee Details */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <div className="font-medium text-gray-700">₹{fee.amount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Due Date:</span>
                    <div className="font-medium text-gray-700">{fee.dueDate ? (() => {
                      const date = new Date(fee.dueDate);
                      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    })() : 'N/A'}</div>
                  </div>
                  {fee.paidDate && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Paid Date:</span>
                      <div className="font-medium text-green-600">{(() => {
                        const date = new Date(fee.paidDate);
                        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                      })()}</div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    {fee.status !== 'paid' && (
                      <button
                        onClick={() => handlePayFee(fee._id || fee.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Mark as Paid'}
                      </button>
                    )}
                    <button
                      onClick={() => handlePrintPaymentReceipt(fee)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-xs text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200 gap-1"
                    >
                      <HiDocumentText className="w-3 h-3" />
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {fees.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <HiDocumentText className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No fee records</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">No fee records found for this student.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;