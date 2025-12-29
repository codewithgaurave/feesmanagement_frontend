import React, { useState } from 'react';
import { HiOfficeBuilding, HiAcademicCap, HiUserGroup, HiCog } from 'react-icons/hi';
import Swal from 'sweetalert2';

const Settings = () => {
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false);
  const [isAddSpecialityModalOpen, setIsAddSpecialityModalOpen] = useState(false);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [specialityName, setSpecialityName] = useState('');
  const [specialitySeats, setSpecialitySeats] = useState('');
  const [specialityDepartment, setSpecialityDepartment] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfAdding, setDateOfAdding] = useState('');
  const [selectedAccess, setSelectedAccess] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState([]);

  const handleAddDepartment = () => {
    setIsAddDepartmentModalOpen(true);
  };

  const handleSubmitDepartment = () => {
    if (departmentName.trim()) {
      console.log('Adding department:', departmentName);
      setDepartmentName('');
      setIsAddDepartmentModalOpen(false);
      Swal.fire({
        title: 'Success',
        text: `${departmentName} Successfully added`,
        icon: 'success',
      });
    }
  };

  const handleAddSpeciality = () => {
    setIsAddSpecialityModalOpen(true);
  };

  const handleSubmitSpeciality = () => {
    if (specialityName.trim() && specialitySeats.trim() && specialityDepartment.trim()) {
      console.log('adding speciality:', { specialityName, specialitySeats, specialityDepartment });
      setSpecialityName('');
      setSpecialitySeats('');
      setSpecialityDepartment('');
      setIsAddSpecialityModalOpen(false);
      Swal.fire({
        title: 'Success',
        text: `${specialityName} with ${specialitySeats} seats is added successfully`,
        icon: 'success'
      });
    }
  };

  const handleAddEmployee = () => {
    setIsAddEmployeeModalOpen(true);
  };

  const handleSubmitEmployee = () => {
    if (employeeName.trim() && employeeEmail.trim() && employeePassword.trim() && confirmPassword.trim()) {
      if (employeePassword !== confirmPassword) {
        Swal.fire({
          title: 'Error',
          text: 'Passwords do not match',
          icon: 'error'
        });
        return;
      }
      console.log('adding employee:', { employeeName, employeeEmail, selectedAccess, dateOfAdding });
      setEmployeeName('');
      setEmployeeEmail('');
      setEmployeePassword('');
      setConfirmPassword('');
      setDateOfAdding('');
      setSelectedAccess([]);
      setSelectedDepartment([]);
      setIsAddEmployeeModalOpen(false);
      Swal.fire({
        title: 'Success',
        text: `${employeeName} is added successfully`,
        icon: 'success'
      });
    }
  };

  const settingsOptions = [
    {
      title: "Add Department",
      description: "Create new departments for your institution",
      icon: <HiOfficeBuilding className="w-8 h-8" />,
      onClick: handleAddDepartment,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Add Speciality",
      description: "Add new specialities with seat allocation",
      icon: <HiAcademicCap className="w-8 h-8" />,
      onClick: handleAddSpeciality,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Add Employees",
      description: "Register new employees with access permissions",
      icon: <HiUserGroup className="w-8 h-8" />,
      onClick: handleAddEmployee,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <HiCog className="w-6 h-6 mr-3 text-gray-600" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">Manage your institution's configuration and settings</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsOptions.map((option, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={option.onClick}
          >
            <div className={`w-16 h-16 ${option.color} rounded-lg flex items-center justify-center mb-4`}>
              {option.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-gray-600 text-sm">{option.description}</p>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {isAddDepartmentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Department</h3>
            <input
              type="text"
              placeholder="Enter department name"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAddDepartmentModalOpen(false);
                  setDepartmentName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDepartment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Speciality Modal */}
      {isAddSpecialityModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Speciality</h3>
            <div className="space-y-4">
              <select
                value={specialityDepartment}
                onChange={(e) => setSpecialityDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Department</option>
                <option value="mbbs">MBBS</option>
                <option value="md">MD</option>
                <option value="ms">MS</option>
                <option value="bds">BDS</option>
                <option value="mds">MDS</option>
                <option value="nursing">NURSING</option>
              </select>
              <input
                type="text"
                placeholder="Enter speciality name"
                value={specialityName}
                onChange={(e) => setSpecialityName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Enter number of seats"
                value={specialitySeats}
                onChange={(e) => setSpecialitySeats(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setIsAddSpecialityModalOpen(false);
                  setSpecialityName('');
                  setSpecialitySeats('');
                  setSpecialityDepartment('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSpeciality}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-[100%] max-w-[50%] mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Enter Name</label>
              <input
                type="text"
                placeholder="Enter employee name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium mb-2">Enter Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={employeeEmail}
                onChange={(e) => setEmployeeEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium mb-2">Enter Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={employeePassword}
                onChange={(e) => setEmployeePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium mb-2">Enter confirm password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="block text-sm font-medium mb-2">Date of Adding</label>
              <input
                type="date"
                value={dateOfAdding}
                onChange={(e) => setDateOfAdding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Select Departments</label>
                <div className="border border-gray-300 rounded-lg p-3 max-h-45 overflow-y-auto">
                  {['mbbs', 'md', 'ms', 'bds', 'mds', 'nursing'].map((dept) => (
                    <label key={dept} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedDepartment.includes(dept)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDepartment([...selectedDepartment, dept]);
                          } else {
                            setSelectedDepartment(selectedDepartment.filter(item => item !== dept));
                          }
                        }}
                        className="mr-2 focus:outline-none focus:ring-0"
                      />
                      {dept.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Access Permissions</label>
                <div className="space-y-2">
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
                      className="mr-2 focus:outline-none focus:ring-0"
                    />
                    Students Management
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
                      className="mr-2 focus:outline-none focus:ring-0"
                    />
                    Fee Management
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsAddEmployeeModalOpen(false);
                  setEmployeeName('');
                  setEmployeeEmail('');
                  setEmployeePassword('');
                  setConfirmPassword('');
                  setDateOfAdding('');
                  setSelectedAccess([]);
                  setSelectedDepartment([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;