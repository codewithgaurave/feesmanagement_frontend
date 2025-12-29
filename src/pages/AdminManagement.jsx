import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { useRole } from '../context/RoleContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const AdminManagement = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'admin',
    permissions: { student: false, fee: false }
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.getAll();
      setAdmins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.create(formData);
      setShowForm(false);
      setFormData({ email: '', password: '', role: 'admin', permissions: { student: false, fee: false } });
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this admin?')) {
      try {
        await adminAPI.delete(id);
        fetchAdmins();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Management</h1>
          <button
            onClick={() => navigate('/settings/add-employee')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Admin
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full p-2 pr-10 border rounded"
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
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.student}
                    onChange={(e) => setFormData({
                      ...formData, 
                      permissions: {...formData.permissions, student: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  Student Management
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.fee}
                    onChange={(e) => setFormData({
                      ...formData, 
                      permissions: {...formData.permissions, fee: e.target.checked}
                    })}
                    className="mr-2"
                  />
                  Fee Management
                </label>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                  Create
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-left">Permissions</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin._id} className="border-t">
                  <td className="px-6 py-4">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      admin.role === 'super_admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {admin.permissions?.student && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-1">Student</span>}
                    {admin.permissions?.fee && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Fee</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(admin._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminManagement;