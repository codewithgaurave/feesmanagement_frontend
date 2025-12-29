import React, { useState, useEffect } from 'react';
import { HiUserGroup, HiChevronDown, HiEye, HiEyeOff } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { employeeAPI, departmentAPI } from '../utils/api';

const AddEmployee = () => {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dateOfAdding, setDateOfAdding] = useState('');
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const handleDepartmentToggle = (deptId) => {
    if (selectedDepartment.includes(deptId)) {
      setSelectedDepartment(selectedDepartment.filter(item => item !== deptId));
    } else {
      setSelectedDepartment([...selectedDepartment, deptId]);
    }
  };
  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (employeePassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      const employeeData = {
        name: employeeName,
        email: employeeEmail,
        password: employeePassword,
        departments: selectedDepartment,
        accessPermissions: selectedAccess,
        dateOfAdding: dateOfAdding || new Date().toISOString().split('T')[0]
      };

      await employeeAPI.create(employeeData);
      
      toast.success(`${employeeName} added successfully!`);
      
      // Reset form
      setEmployeeName('');
      setEmployeeEmail('');
      setEmployeePassword('');
      setConfirmPassword('');
      setDateOfAdding('');
      setSelectedAccess([]);
      setSelectedDepartment([]);
      
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error(error.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <HiUserGroup className="w-6 h-6 mr-3 text-purple-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Employee</h1>
          </div>
          <button
            onClick={() => navigate('/employees/manage')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
          >
            <span>Manage Employees</span>
          </button>
        </div>
        <p className="text-gray-600">Register new employees with access permissions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={employeePassword}
                  onChange={(e) => setEmployeePassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Departments</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">
                    {selectedDepartment.length > 0
                      ? `${selectedDepartment.length} department(s) selected`
                      : 'Select departments'
                    }
                  </span>
                  <HiChevronDown className={`w-4 h-4 transition-transform ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDepartmentDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {departments && departments.length > 0 ? departments.map((dept) => (
                      <label key={dept._id} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDepartment.includes(dept._id)}
                          onChange={() => handleDepartmentToggle(dept._id)}
                          className="mr-2 focus:outline-none focus:ring-0"
                        />
                        <span className="text-sm">{dept.name}</span>
                      </label>
                    )) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No departments available</div>
                    )}
                  </div>
                )}
              </div>

              {selectedDepartment.length > 0 && departments && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedDepartment.map((deptId) => {
                    const dept = departments.find(d => d._id === deptId);
                    return (
                      <span key={deptId} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {dept?.name}
                        <button
                          type="button"
                          onClick={() => handleDepartmentToggle(deptId)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAccess.includes('students')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccess([...selectedAccess, 'students']);
                      } else {
                        setSelectedAccess(selectedAccess.filter(item => item !== 'students'));
                      }
                    }}
                    className="mr-3 focus:outline-none focus:ring-0 w-4 h-4"
                  />
                  <span className="text-sm font-medium">Students Management</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedAccess.includes('fees')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAccess([...selectedAccess, 'fees']);
                      } else {
                        setSelectedAccess(selectedAccess.filter(item => item !== 'fees'));
                      }
                    }}
                    className="mr-3 focus:outline-none focus:ring-0 w-4 h-4"
                  />
                  <span className="text-sm font-medium">Fee Management</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              {loading ? 'Adding Employee...' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;