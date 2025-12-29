import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { DepartmentProvider } from './context/DepartmentContext.jsx';
import { RoleProvider } from './context/RoleContext.jsx';
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Students
import AddStudent from "./pages/students/AddStudent";
import EditStudent from "./pages/students/EditStudents";
import ShowStudents from "./pages/students/ShowStudents";
import StudentDetails from "./pages/students/StudentDetails";
import StudentFeeDetails from "./pages/students/StudentFeeDetails";

// Fees
import AddFee from "./pages/Fees/AddFee";
import ShowFees from './pages/Fees/ShowFees';
import UpcomingFees from "./pages/Fees/UpcomingFees";
import FeeDetails from "./pages/Fees/FeeDetails";

import ChangePassword from "./pages/ChangePassword";
import Settings from "./pages/Settings";
import AddDepartment from "./pages/settings/AddDepartment";
import AddSpeciality from "./pages/settings/AddSpeciality";
import AddEmployee from "./pages/AddEmployee";
import ManageEmployee from "./pages/employees/ManageEmployee";
import AdminManagement from "./pages/AdminManagement";

function App() {
  return (
    <BrowserRouter>
      <RoleProvider>
        <AuthProvider>
          <DepartmentProvider>
            <Toaster position="top-right" />
            <Routes>
          {/* Public Routes - Redirect to dashboard if logged in */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

          {/* Protected Routes - Require authentication */}
          <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Students */}
            <Route path="/students/add" element={<AddStudent />} />
            <Route path="/students/edit/:id" element={<EditStudent />} />
            <Route path="/students/show" element={<ShowStudents />} />
            <Route path="/students/details/:id" element={<StudentDetails />} />
            <Route path="/students/fees/:id" element={<StudentFeeDetails />} />
            <Route path="/students/fee-details/:id" element={<StudentFeeDetails />} />

            {/* Fees */}
            <Route path="/fees/add" element={<AddFee />} />
            <Route path="/fees/show" element={<ShowFees />} />
            <Route path="/fees/upcoming" element={<UpcomingFees />} />
            <Route path="/fees/details/:id" element={<FeeDetails />} />

            {/* Change Password */}
            <Route path="/change-password" element={<ChangePassword />} />
            
            {/* Admin Management - Super Admin Only */}
            <Route path="/admin-management" element={<AdminManagement />} />
            
            {/* Settings */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/add-department" element={<AddDepartment />} />
            <Route path="/settings/add-speciality" element={<AddSpeciality />} />
            <Route path="/settings/add-employee" element={<AddEmployee />} />
            
            {/* Employees */}
            <Route path="/employees/manage" element={<ManageEmployee />} />
          </Route>
          </Routes>
          </DepartmentProvider>
        </AuthProvider>
      </RoleProvider>
    </BrowserRouter>
  );
}

export default App;