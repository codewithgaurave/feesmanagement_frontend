import React from 'react';
import { HiCog } from 'react-icons/hi';

const Settings = () => {
  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <HiCog className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Application Settings</h2>
        <p className="text-gray-600">Settings configuration will be implemented here.</p>
      </div>
    </div>
  );
};

export default Settings;