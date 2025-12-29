import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Utility function to check token validity
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp && payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  
  if (token && isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && !isTokenValid(token)) {
    console.warn('Token expired, clearing localStorage');
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');
    // Don't redirect here, let the 401 response handle it
  }
  
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Clear auth data and redirect to login for all 401 errors
      console.warn('Authentication failed:', error.response?.data?.message || 'Unauthorized');
      
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);



// API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  //change password

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response;
  }
};

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response;
  },

  getAll: async () => {
    const response = await api.get('/admin');
    return response;
  },

  add: async (adminData) => {
    const response = await api.post('/admin/add', adminData);
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/${id}`);
    return response;
  }
};

export const studentAPI = {
  getAll: async () => {
    const response = await api.get('/students/show-students');
    return response;
  },

  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response;
  },

  getByStudentId: async (studentId) => {
    const response = await api.get(`/students/${studentId}/fees`);
    return response;
  },

  create: async (studentData) => {
    const response = await api.post('/students/add-student', studentData);
    return response;
  },

  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response;
  }
};

// In-memory seat tracking
let seatCounts = {
  'MD Anaesthesia': { total: 6, occupied: 0 },
  'MD Biochemistry': { total: 4, occupied: 0 },
  'MD Medicine': { total: 5, occupied: 0 },
  'MD Microbiology': { total: 4, occupied: 0 },
  'MD Paediatrics': { total: 4, occupied: 0 },
  'MD Pathology': { total: 6, occupied: 0 },
  'MD Pharmacology': { total: 3, occupied: 0 },
  'MD Physiology': { total: 3, occupied: 0 },
  'MD Psychiatry': { total: 3, occupied: 0 },
  'MD Radiodiagnosis': { total: 2, occupied: 0 },
  'MD Skin': { total: 2, occupied: 0 },
  'MD Community Medicine': { total: 4, occupied: 0 },
  'MD TB & CH/Respiratory Medicine': { total: 3, occupied: 0 },

  'MS Anatomy': { total: 4, occupied: 0 },
  'MS ENT': { total: 4, occupied: 0 },
  'MS Obs & Gyn': { total: 2, occupied: 0 },
  'MS Ophthalmology': { total: 4, occupied: 0 },
  'MS Orthopaedics': { total: 4, occupied: 0 },
  'MS Surgery': { total: 9, occupied: 0 },

  // mds department 

  'MDS Conservation and Endodontics': { total: 5, occupied: 0 },
  'MDS Orthodontics & Dentofacial Orthopedics': { total: 5, occupied: 0 },
  'MDS Pedodontics & Preventive Dentistry': { total: 4, occupied: 0 },
  'MDS Prosthodontics & Crown Bridge': { total: 5, occupied: 0 },
  'MDS Oral & Maxillofacial Surgery': { total: 5, occupied: 0 },
  'MDS Periodontology': { total: 5, occupied: 0 },
  'MDS Oral Medicine & Radiology': { total: 3, occupied: 0 },
  'MDS Oral Pathology & Microbiology': { total: 5, occupied: 0 },
  'MDS Public Health Dentistry': { total: 3, occupied: 0 },

  'Nursing ANM': { total: 50, occupied: 0 },
  'Nursing GNM': { total: 100, occupied: 0 },
  'Nursing BSC': { total: 100, occupied: 0 },
  'Nursing MSC': { total: 50, occupied: 0 }
};

export const seatAPI = {
  getMDSeatCounts: async () => {
    try {
      // Fetch all students to calculate occupied seats
      const studentsResponse = await studentAPI.getAll();
      const students = studentsResponse.data.data || studentsResponse.data || [];

      // Calculate occupied seats for each speciality
      const updatedSeatCounts = { ...seatCounts };

      // Reset occupied counts
      Object.keys(updatedSeatCounts).forEach(speciality => {
        updatedSeatCounts[speciality].occupied = 0;
      });

      // Count occupied seats from database
      students.forEach(student => {
        const studentSpeciality = student.section || student.speciality;
        if (studentSpeciality && updatedSeatCounts[studentSpeciality]) {
          updatedSeatCounts[studentSpeciality].occupied += 1;
        }
      });

      // console.log('Updated seat counts from database:', updatedSeatCounts);
      return { data: updatedSeatCounts };
    } catch (error) {
      // console.error('Error fetching seat counts:', error);
      return { data: { ...seatCounts } };
    }
  },

  updateSeatCount: (speciality) => {
    // This method is now deprecated as we fetch real-time data from database
    // console.log(`Seat count update requested for ${speciality} - using real-time data instead`);
  },

  checkSeatAvailability: async (branch, speciality) => {
    // console.log('checkSeatAvailability called with:', { branch, speciality });

    if ((branch !== 'MD' && branch !== 'MS' && branch !== 'MDS' && branch !== 'Nursing') || !speciality) {
      // console.log('Not MD/MS/MDS/Nursing or no speciality, returning available: true');
      return { available: true };
    }

    try {
      const response = await seatAPI.getMDSeatCounts();
      const seatData = response.data[speciality];

      // console.log('Seat data for', speciality, ':', seatData);

      if (!seatData) {
        // console.log('No seat data found, returning available: true');
        return { available: true };
      }

      const isAvailable = seatData.occupied < seatData.total;
      const remaining = seatData.total - seatData.occupied;

      // console.log('Availability check:', {
      //   occupied: seatData.occupied,
      //   total: seatData.total,
      //   available: isAvailable,
      //   remaining: remaining
      // });

      return {
        available: isAvailable,
        occupied: seatData.occupied,
        total: seatData.total,
        remaining: remaining
      };
    } catch (error) {
      // console.error('Error checking seat availability:', error);
      return { available: true };
    }
  }
};

export const feeAPI = {
  getAll: async () => {
    const response = await api.get('/fees');
    return response;
  },

  getById: async (feeId) => {
    const response = await api.get(`/fees/${feeId}`);
    return response;
  },

  getByStudentId: async (studentId) => {
    const response = await api.get(`/students/${studentId}/fees`);
    return response;
  },

  create: async (feeData) => {
    const response = await api.post('/fees', feeData);
    return response;
  },

  payFee: async (feeId, paymentData = {}) => {
    const response = await api.put(`/fees/${feeId}/pay`, {
      paymentMethod: paymentData.paymentMethod || 'Cash',
      paidAmount: paymentData.paidAmount
    });
    return response;
  },

  update: async (feeId, feeData) => {
    const response = await api.put(`/fees/${feeId}`, feeData);
    return response;
  },

  delete: async (feeId) => {
    const response = await api.delete(`/fees/${feeId}`);
    return response;
  },

  getDueFees: async () => {
    const response = await api.get('/fees/due');
    return response;
  },

  getUpcomingFees: async () => {
    const response = await api.get('/fees/upcoming');
    return response;
  }
};

export const notificationAPI = {
  sendEmail: async (emailData) => {
    const response = await api.post('/notifications/send-email', emailData);
    return response;
  },

  sendSMS: async (smsData) => {
    const response = await api.post('/notifications/send-sms', smsData);
    return response;
  },

  makeCall: async (callData) => {
    const response = await api.post('/notifications/make-call', callData);
    return response;
  },

  sendBulkNotifications: async (bulkData) => {
    const response = await api.post('/notifications/send-bulk', bulkData);
    return response;
  }
};

export const departmentAPI = {
  getAll: async () => {
    const response = await api.get('/departments');
    return response;
  },

  create: async (departmentData) => {
    const response = await api.post('/departments', departmentData);
    return response;
  },

  update: async (id, departmentData) => {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response;
  }
};

export const specialityAPI = {
  getAll: async () => {
    const response = await api.get('/specialities');
    return response;
  },

  getByDepartment: async (departmentId) => {
    const response = await api.get(`/specialities/department/${departmentId}`);
    return response;
  },

  create: async (specialityData) => {
    const response = await api.post('/specialities', specialityData);
    return response;
  },

  update: async (id, specialityData) => {
    const response = await api.put(`/specialities/${id}`, specialityData);
    return response;
  },

  updateSeats: async (id, seatData) => {
    const response = await api.put(`/specialities/${id}/seats`, seatData);
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/specialities/${id}`);
    return response;
  }
};

export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response;
  },

  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response;
  },

  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response;
  },

  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response;
  }
};

// export { seatAPI };
export default api;