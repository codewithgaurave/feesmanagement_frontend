// Print utilities for fee management system
import * as XLSX from 'xlsx';

export const smartPrint = (pageData, pageType) => {
  console.log('smartPrint called with:', { pageData, pageType });
  switch (pageType) {
    case 'fee-receipt':
      if (pageData?.fee && pageData?.student) {
        printFeeReceipt(pageData.fee, pageData.student);
      }
      break;
    case 'due-notice':
      if (pageData?.fee && pageData?.student) {
        printDueFeeNotice(pageData.fee, pageData.student);
      }
      break;
    case 'student-details':
      if (pageData?.student) {
        printStudentDetails(pageData.student, pageData.fees);
      }
      break;
    case 'student-list':
      if (pageData?.students) {
        printStudentList(pageData.students, pageData.filters);
      }
      break;
    case 'general':
    default:
      window.print();
      break;
  }
};

export const printStudentDetails = (student, fees = []) => {
  console.log('printStudentDetails called with:', { student, fees });
  
  // Test with dummy data if no student data
  if (!student || !student.name) {
    student = {
      name: 'Test Student',
      rollNumber: '12345',
      class: 'Test Class',
      phone: '9999999999',
      email: 'test@test.com',
      address: 'Test Address'
    };
    console.log('Using dummy student data:', student);
  }
  
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Prepare student details data
  const studentData = [
    ['Fee Management System'],
    ['STUDENT DETAILS'],
    [],
    ['Personal Information'],
    ['Name', student.name || 'N/A'],
    ['Roll Number', student.rollNumber || 'N/A'],
    ['Class', student.class || 'N/A'],
    ['Phone', student.phone || 'N/A'],
    ['Email', student.email || 'N/A'],
    ['Address', student.address || 'N/A'],
    ['Father Name', student.fatherName || 'N/A'],
    ['Mother Name', student.motherName || 'N/A'],
    []
  ];
  
  // Add fee history if available
  if (fees && fees.length > 0) {
    studentData.push(
      ['Fee History'],
      ['Fee Type', 'Amount', 'Paid Amount', 'Due Amount', 'Status', 'Due Date'],
      ...fees.map(fee => [
        fee.feeType || 'N/A',
        fee.amount || 0,
        fee.paidAmount || 0,
        fee.dueAmount || 0,
        fee.status || 'N/A',
        fee.dueDate ? new Date(fee.dueDate).toLocaleDateString('en-IN') : 'N/A'
      ])
    );
  }
  
  studentData.push([], [`Report Generated: ${currentDate}`]);
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(studentData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Student Details');
  
  // Download Excel file
  XLSX.writeFile(wb, `Student_Details_${student.name || 'Unknown'}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const printDueFeeNotice = (fee, student) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Prepare notice data
  const noticeData = [
    ['Fee Management System'],
    ['DUE FEE NOTICE'],
    [],
    ['Student Information'],
    ['Student Name', student.name],
    ['Roll Number', fee.rollNumber || 'N/A'],
    ['Class', student.class || 'N/A'],
    ['Phone', student.phone || 'N/A'],
    [],
    ['Fee Details'],
    ['Fee Type', fee.feeType],
    ['Due Date', new Date(fee.dueDate).toLocaleDateString('en-IN')],
    ['Amount Due', fee.amount],
    ['Status', fee.status.toUpperCase()],
    [],
    ['Notice'],
    ['Please pay the above amount at the earliest to avoid any inconvenience.'],
    [],
    [`Notice Date: ${currentDate}`]
  ];
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(noticeData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Due Notice');
  
  // Download Excel file
  XLSX.writeFile(wb, `Due_Notice_${student.name || 'Unknown'}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const printStudentList = (students = [], filters = {}) => {
  console.log('printStudentList called with:', { students, filters });
  
  // Test with dummy data if no students
  if (!students || students.length === 0) {
    students = [
      { name: 'Test Student 1', rollNumber: '001', class: 'Class 10', phone: '9999999999', totalFee: 50000 },
      { name: 'Test Student 2', rollNumber: '002', class: 'Class 11', phone: '8888888888', totalFee: 60000 }
    ];
    console.log('Using dummy student data');
  }
  
  const currentDate = new Date().toLocaleDateString('en-IN');
  
  // Prepare data for Excel
  const excelData = [
    ['Student List Report'],
    [`Generated on: ${currentDate}`],
    [],
    ['S.No.', 'Name', 'Roll Number', 'Class', 'Phone', 'Total Fee'],
    ...students.map((student, index) => [
      index + 1,
      student.name || 'N/A',
      student.rollNumber || 'N/A',
      student.class || 'N/A',
      student.phone || 'N/A',
      (student.totalFee || 0)
    ]),
    [],
    [`Total Students: ${students.length}`]
  ];
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Student List');
  
  // Download Excel file
  XLSX.writeFile(wb, `Student_List_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const printFeeReceipt = (fee, student) => {
  const currentDate = new Date().toLocaleDateString('en-IN');
  const receiptNo = `FMS-${fee._id?.slice(-6).toUpperCase() || Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // Prepare receipt data
  const receiptData = [
    ['Fee Management System'],
    ['FEE RECEIPT'],
    [`Receipt No: ${receiptNo}`],
    [],
    ['Student Information'],
    ['Student Name', student.name],
    ['Roll Number', fee.rollNumber || 'N/A'],
    ['Class', student.class || 'N/A'],
    [],
    ['Fee Details'],
    ['Fee Type', fee.feeType],
    ['Payment Date', fee.paidDate ? new Date(fee.paidDate).toLocaleDateString('en-IN') : currentDate],
    ['Amount Paid', fee.paidAmount || fee.amount],
    ['Payment Method', fee.paymentMethod || 'Cash'],
    [],
    ['Status', '✓ PAID'],
    [],
    [`Receipt Generated: ${currentDate}`]
  ];
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(receiptData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Fee Receipt');
  
  // Download Excel file
  XLSX.writeFile(wb, `Fee_Receipt_${receiptNo}_${new Date().toISOString().split('T')[0]}.xlsx`);
};