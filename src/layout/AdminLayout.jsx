import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import { HiMenu, HiX } from 'react-icons/hi';
// import logo from '../assets/logo.png';

const AdminLayout = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile(); // Initial check
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [sidebarOpen]);




  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div
          className={`fixed left-0 right-0 bg-black/50 transition-opacity duration-300 z-[9996] ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          style={{
            top: '80px',
            bottom: '0'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-transform duration-300 ease-in-out ${isMobile
          ? `fixed left-0 w-64 z-[9997] ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`
          : 'w-64'
        }`}
        style={{
          top: isMobile ? '80px' : '0',
          height: isMobile ? 'calc(100vh - 80px)' : '100%'
        }}>
        <Sidebar onNavigate={() => { }} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full lg:ml-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-[9998] border-b shadow-sm bg-white/80 backdrop-blur-sm border-slate-200">
          <div className="px-3 py-3 sm:px-4 lg:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Mobile Menu Button */}
                {isMobile && (
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    aria-label="Toggle sidebar"
                  >
                    <div className="transition-transform duration-200">
                      {sidebarOpen ? (
                        <HiX className="w-6 h-6" />
                      ) : (
                        <HiMenu className="w-6 h-6" />
                      )}
                    </div>
                  </button>
                )}
                {/*<div className="flex items-center space-x-3">
                  <div className="w-8 h-8 p-1 rounded-lg bg-gradient-to-br from-college-primary to-college-secondary">
                    <img 
                      src={logo} 
                      alt="Logo" 
                      className="object-contain w-full h-full p-1 rounded-md bg-white/20"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800 font-heading text-elegant">
                    Administrative Dashboard
                    </h1>
                  </div>
                </div>*/}
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                {/* Time and Date */}
                <div className="flex-col items-end hidden sm:flex">
                  <div className="text-xs font-semibold text-gray-700 sm:text-sm">
                    {currentDateTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {currentDateTime.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                {/* Mobile Time Display */}
                <div className="flex flex-col items-end sm:hidden">
                  <div className="text-xs font-semibold text-gray-700">
                    {currentDateTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>

                {/* Admin Profile */}
                <div className="flex items-center px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 space-x-2 sm:space-x-3 bg-gradient-to-r from-[#00a8cc]/10 to-[#0077b6]/10 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-xs sm:text-sm font-semibold text-white rounded-full bg-gradient-to-br from-[#00a8cc] to-[#0077b6]">
                    A
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-gray-700 sm:text-sm font-ui">Admin User</p>
                    <p className="text-xs text-gray-500 font-body">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-2 overflow-y-auto sm:p-4 lg:p-6">
          <div className="max-w-full animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        {/* <footer className="px-2 py-2 border-t sm:px-4 lg:px-6 sm:py-3 bg-white/50 backdrop-blur-sm border-slate-200">
          <div className="flex flex-col items-center justify-between space-y-1 text-xs text-gray-600 sm:flex-row sm:text-sm sm:space-y-0">
            <p className="text-center font-body sm:text-left">© 2024 Fee Management System. All rights reserved.</p>
            <p className="font-ui">Version 1.0.0</p>
          </div>
        </footer> */}
      </div>


    </div>
  );
};

export default AdminLayout; 