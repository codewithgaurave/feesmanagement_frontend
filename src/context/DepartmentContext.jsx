import React, { createContext, useContext, useState } from 'react';

const DepartmentContext = createContext();

export const useDepartments = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartments must be used within a DepartmentProvider');
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const [departments, setDepartments] = useState([
    'MBBS',
    'MD', 
    'MS',
    'BDS',
    'MDS',
    'Nursing'
  ]);

  const addDepartment = (departmentName) => {
    if (departmentName.trim() && !departments.includes(departmentName.trim())) {
      setDepartments([...departments, departmentName.trim()]);
    }
  };

  const updateDepartment = (index, newName) => {
    if (newName.trim()) {
      const updatedDepartments = [...departments];
      updatedDepartments[index] = newName.trim();
      setDepartments(updatedDepartments);
    }
  };

  return (
    <DepartmentContext.Provider value={{
      departments,
      addDepartment,
      updateDepartment,
      setDepartments
    }}>
      {children}
    </DepartmentContext.Provider>
  );
};