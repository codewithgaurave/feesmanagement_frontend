import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI, departmentAPI, specialityAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';
import { HiArrowLeft, HiCheck } from 'react-icons/hi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [departments, setDepartments] = useState([]);
  const [specialities, setSpecialities] = useState([]);
  const [filteredSpecialities, setFilteredSpecialities] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: '',
    speciality: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    admissionDate: '',
    totalFee: '',
    feeType: '',
    tuitionFee: '',
    hostelFee: '',
    securityFee: '',
    miscellaneousFee: '',
    acCharge: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchSpecialities();
    if (id) {
      loadStudentData();
    }
  }, [id]);

  // Filter specialities when department or specialities change
  useEffect(() => {
    if (formData.department && specialities.length > 0) {
      const filtered = specialities.filter(s => 
        s.department && (s.department._id === formData.department || s.department === formData.department)
      );
      setFilteredSpecialities(filtered);
    } else {
      setFilteredSpecialities([]);
    }
  }, [formData.department, specialities]);

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSpecialities = async () => {
    try {
      const response = await specialityAPI.getAll();
      setSpecialities(response.data.data || []);
    } catch (error) {
      console.error('Error fetching specialities:', error);
    }
  };

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getById(id);
      const student = response.data.data || response.data;
      
      console.log('Student data loaded:', student);
      console.log('Student feeType:', student.feeType);
      
      // Format dates for input fields
      const admissionDate = student.admissionDate ? 
        new Date(student.admissionDate).toISOString().split('T')[0] : '';
      const dateOfBirth = student.dateOfBirth ? 
        new Date(student.dateOfBirth).toISOString().split('T')[0] : '';
      
      setFormData({
        name: student.name || '',
        rollNumber: student.rollNumber || '',
        department: student.department?._id || student.department || '',
        speciality: student.speciality?._id || student.speciality || '',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        dateOfBirth: dateOfBirth,
        parentName: student.guardianName || student.parentName || '',
        parentPhone: student.guardianPhone || student.parentPhone || '',
        admissionDate: admissionDate,
        totalFee: student.totalFee || '',
        feeType: student.feeType || '',
        tuitionFee: student.tuitionFee || '',
        hostelFee: student.hostelFee || '',
        securityFee: student.securityFee || '',
        miscellaneousFee: student.miscellaneousFee || '',
        acCharge: student.acCharge || ''
      });
    } catch (error) {
      console.error('Error loading student:', error);
      toast.error('Error loading student data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalFee = () => {
    const tuition = parseFloat(formData.tuitionFee) || 0;
    const hostel = parseFloat(formData.hostelFee) || 0;
    const security = parseFloat(formData.securityFee) || 0;
    const miscellaneous = parseFloat(formData.miscellaneousFee) || 0;
    const ac = parseFloat(formData.acCharge) || 0;
    return tuition + hostel + security + miscellaneous + ac;
  };

  const handleChange = (e) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    
    // Auto-calculate total fee when any fee field changes
    if (['tuitionFee', 'hostelFee', 'securityFee', 'miscellaneousFee', 'acCharge'].includes(e.target.name)) {
      const tuition = parseFloat(newFormData.tuitionFee) || 0;
      const hostel = parseFloat(newFormData.hostelFee) || 0;
      const security = parseFloat(newFormData.securityFee) || 0;
      const miscellaneous = parseFloat(newFormData.miscellaneousFee) || 0;
      const ac = parseFloat(newFormData.acCharge) || 0;
      newFormData.totalFee = (tuition + hostel + security + miscellaneous + ac).toString();
    }
    
    // Filter specialities when department changes
    if (e.target.name === 'department') {
      const selectedDept = departments.find(d => d._id === e.target.value);
      if (selectedDept) {
        const filtered = specialities.filter(s => s.department._id === selectedDept._id);
        setFilteredSpecialities(filtered);
      } else {
        setFilteredSpecialities([]);
      }
      newFormData.speciality = ''; // Reset speciality when department changes
    }
    
    setFormData(newFormData);
  };

  const handleTotalFeeClick = () => {
    const total = calculateTotalFee();
    setFormData({
      ...formData,
      totalFee: total.toString()
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        department: formData.department, // Send department ID
        speciality: formData.speciality, // Send speciality ID
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        admissionDate: formData.admissionDate,
        feeType: formData.feeType,
        tuitionFee: parseFloat(formData.tuitionFee) || 0,
        hostelFee: parseFloat(formData.hostelFee) || 0,
        securityFee: parseFloat(formData.securityFee) || 0,
        miscellaneousFee: parseFloat(formData.miscellaneousFee) || 0,
        acCharge: parseFloat(formData.acCharge) || 0,
        totalFee: parseFloat(formData.totalFee) || 0
      };
      
      await studentAPI.update(id, submitData);
      toast.success('Student updated successfully!');
      navigate('/students/show');
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Error updating student');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <button
          onClick={() => navigate('/students/show')}
          className="bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <HiArrowLeft className="w-4 h-4" />
          <span>Back to Students</span>
        </button>
        <div className="min-w-0 flex-1 text-right mr-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Edit Student</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Update student information</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Roll Number *
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter roll number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {formData.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speciality *
                  </label>
                  <select
                    name="speciality"
                    value={formData.speciality}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Speciality</option>
                    {filteredSpecialities.map(spec => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name} ({spec.totalSeats} seats)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-6">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="mt-4 sm:mt-6 sm:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address"
              />
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter parent/guardian name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Phone Number *
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  value={formData.parentPhone}
                  onChange={handleChange}
                  maxLength="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter parent phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admission Date *
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Type *
                </label>
                <select
                  name="feeType"
                  value={formData.feeType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select fee type</option>
                  <option value="Lump Sum">Lump Sum</option>
                  <option value="Instalment">Instalment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tuition Fee *
                </label>
                <input
                  type="text"
                  name="tuitionFee"
                  value={formData.tuitionFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tuition fee"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel Fee
                </label>
                <input
                  type="text"
                  name="hostelFee"
                  value={formData.hostelFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter hostel fee (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Security Fee
                </label>
                <input
                  type="text"
                  name="securityFee"
                  value={formData.securityFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter security fee (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miscellaneous Fee
                </label>
                <input
                  type="text"
                  name="miscellaneousFee"
                  value={formData.miscellaneousFee}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter miscellaneous fee (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AC Charge
                </label>
                <input
                  type="text"
                  name="acCharge"
                  value={formData.acCharge}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter AC charge (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Fee Amount *
                </label>
                <input
                  type="text"
                  name="totalFee"
                  value={formData.totalFee}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-blue-50 text-blue-900 font-semibold cursor-not-allowed"
                  placeholder="Auto-calculated total fee"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/students/show')}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-400 to-blue-400 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                  <span>Updating Student...</span>
                </>
              ) : (
                <>
                  <HiCheck className="w-4 h-4" />
                  <span className='text-white'>Update Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;