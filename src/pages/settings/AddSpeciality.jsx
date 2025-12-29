import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { departmentAPI, specialityAPI, studentAPI } from '../../utils/api';
import api from '../../utils/api';
import { HiArrowLeft, HiPlus, HiX } from 'react-icons/hi';

const AddSpeciality = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeats, setEditingSeats] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    totalSeats: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchSpecialities();
  }, []);

  const fetchSpecialities = async () => {
    try {
      const response = await specialityAPI.getAll();
      const specialitiesData = response.data.data || [];
      
      // Get all students to calculate occupied seats
      const studentsResponse = await studentAPI.getAll();
      const allStudents = studentsResponse.data.data || studentsResponse.data || [];
      
      console.log('=== DEBUGGING SEAT CALCULATION ===');
      console.log('Total students found:', allStudents.length);
      console.log('Students data:', allStudents);
      console.log('Specialities data:', specialitiesData);
      
      // Calculate occupied and available seats for each speciality
      const updatedSpecialities = specialitiesData.map(spec => {
        const studentsInSpeciality = allStudents.filter(student => {
          // Handle both string and ObjectId comparisons
          const studentSpecId = student.speciality?._id || student.speciality;
          return String(studentSpecId) === String(spec._id);
        });
        
        return {
          ...spec,
          occupiedSeats: studentsInSpeciality.length,
          availableSeats: Math.max(0, spec.totalSeats - studentsInSpeciality.length)
        };
      });
      
      setSpecialities(updatedSpecialities);
    } catch (error) {
      console.error('Error fetching specialities:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSeatsEdit = (specialityId, currentSeats) => {
    setEditingSeats({ ...editingSeats, [specialityId]: currentSeats });
  };

  const updateSpecialitySeats = async (specialityId) => {
    try {
      const newSeats = editingSeats[specialityId];
      if (!newSeats || newSeats < 1) {
        toast.error('Please enter valid number of seats');
        return;
      }
      await specialityAPI.updateSeats(specialityId, { totalSeats: parseInt(newSeats) });
      toast.success('Seats updated successfully!');
      setEditingSeats({ ...editingSeats, [specialityId]: undefined });
      fetchSpecialities();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update seats');
    }
  };

  const handleSeatsCancel = (specialityId) => {
    setEditingSeats({ ...editingSeats, [specialityId]: undefined });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        name: formData.name,
        department: formData.department, // Send department ID
        totalSeats: parseInt(formData.totalSeats) || 0
      };
      await specialityAPI.create(submitData);
      toast.success('Speciality added successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', department: '', totalSeats: '' });
      fetchSpecialities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add speciality');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add Speciality</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center space-x-2"
        >
          <HiPlus className="w-4 h-4" />
          <span>Add Speciality</span>
        </button>
      </div>

      {/* Specialities Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Existing Specialities</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speciality Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {specialities.length > 0 ? (
                specialities.map((speciality, index) => (
                  <tr key={speciality._id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {speciality.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {speciality.department?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingSeats[speciality._id] !== undefined ? (
                        <input
                          type="number"
                          value={editingSeats[speciality._id]}
                          onChange={(e) => setEditingSeats({ ...editingSeats, [speciality._id]: e.target.value })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                          min="1"
                        />
                      ) : (
                        speciality.totalSeats
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-red-600 font-medium">{speciality.occupiedSeats || 0}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${
                        (speciality.availableSeats || 0) === 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {speciality.availableSeats || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingSeats[speciality._id] !== undefined ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateSpecialitySeats(speciality._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleSeatsCancel(speciality._id)}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSeatsEdit(speciality._id, speciality.totalSeats)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No specialities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */} 
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New Speciality</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speciality Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter speciality name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  name="totalSeats"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter total seats"
                  min="1"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-70 flex items-center space-x-2"
                >
                  {loading ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <HiPlus className="w-4 h-4" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSpeciality;