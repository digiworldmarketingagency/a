import React, { useState } from 'react';
import { UserType } from '../types';
import { store } from '../services/store';

// --- Header ---
interface HeaderProps {
  user: UserType | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onNavigate, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const NavItem = ({ page, label }: { page: string, label: string }) => (
    <button 
      onClick={() => { onNavigate(page); setIsMenuOpen(false); }}
      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 w-full text-left"
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
               <span className="font-bold text-xl text-primary">AMPOWERJOBS.com</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8 items-center">
              <button onClick={() => onNavigate('home')} className="text-gray-900 hover:text-primary px-3 py-2 text-sm font-medium">Home</button>
              <button onClick={() => onNavigate('about')} className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">About Us</button>
              <button onClick={() => onNavigate('events')} className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">Events</button>
              <button onClick={() => onNavigate('resources')} className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">Resource Center</button>
              <button onClick={() => onNavigate('jobboard')} className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium">Search Jobs</button>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                {/* Control Center Button */}
                <button 
                  onClick={() => onNavigate('login-corporate')} 
                  className="text-gray-600 hover:text-primary px-3 py-2 text-sm font-medium border border-gray-200 rounded-md hover:border-primary transition-colors flex items-center"
                >
                  <i className="fas fa-briefcase mr-1"></i> Control Center
                </button>

                {/* Registration Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => { setIsRegOpen(!isRegOpen); setIsLoginOpen(false); }}
                    className="text-gray-500 hover:text-primary px-3 py-2 text-sm font-medium flex items-center"
                  >
                    Registration <i className="fas fa-chevron-down ml-1 text-xs"></i>
                  </button>
                  {isRegOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      <button onClick={() => {onNavigate('register-candidate'); setIsRegOpen(false)}} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Candidate</button>
                      <button onClick={() => {onNavigate('register-corporate'); setIsRegOpen(false)}} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Corporate</button>
                    </div>
                  )}
                </div>

                {/* Login Dropdown */}
                <div className="relative">
                  <button 
                     onClick={() => { setIsLoginOpen(!isLoginOpen); setIsRegOpen(false); }}
                     className="bg-primary text-white hover:bg-teal-700 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                     Login <i className="fas fa-chevron-down ml-2 text-xs"></i>
                  </button>
                  {isLoginOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      <button onClick={() => {onNavigate('login-candidate'); setIsLoginOpen(false)}} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Candidate Login</button>
                      <button onClick={() => {onNavigate('login-corporate'); setIsLoginOpen(false)}} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Corporate Login</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                 <span className="text-sm text-gray-600 mr-2">Welcome</span>
                 <button onClick={() => onNavigate('dashboard')} className="text-primary font-medium hover:underline mr-4">Dashboard</button>
                 <button onClick={onLogout} className="text-red-500 hover:text-red-700 text-sm font-medium">Logout</button>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <NavItem page="home" label="Home" />
            <NavItem page="about" label="About Us" />
            <NavItem page="events" label="Upcoming Events" />
            <NavItem page="resources" label="Resource Center" />
            <NavItem page="jobboard" label="Search Jobs" />
            {!user && (
              <>
                <NavItem page="login-corporate" label="Control Center" />
                <div className="border-t border-gray-200 pt-4 pb-3">
                   <div className="px-2 space-y-1">
                      <NavItem page="register-candidate" label="Register Candidate" />
                      <NavItem page="register-corporate" label="Register Corporate" />
                   </div>
                </div>
                <div className="border-t border-gray-200 pt-4 pb-3">
                   <div className="px-2 space-y-1">
                      <NavItem page="login-candidate" label="Candidate Login" />
                      <NavItem page="login-corporate" label="Corporate Login" />
                   </div>
                </div>
              </>
            )}
            {user && (
               <>
                <NavItem page="dashboard" label="Dashboard" />
                <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-red-600 font-medium">Logout</button>
               </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Footer ---
interface FooterProps {
    onNavigate?: (page: string) => void;
}
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if(onNavigate) onNavigate(page);
  };

  return (
    <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
            <h3 className="text-lg font-bold mb-4">AMPOWERJOBS.com</h3>
            <p className="text-gray-400 text-sm">Empowering careers, connecting futures. The bridge between talent and opportunity.</p>
            </div>
            <div>
            <h4 className="text-md font-semibold mb-4 text-gray-300">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={handleNav('home')} className="hover:text-white hover:underline">Home</button></li>
                <li><button onClick={handleNav('about')} className="hover:text-white hover:underline">About Us</button></li>
                <li><button onClick={handleNav('events')} className="hover:text-white hover:underline">Events</button></li>
                <li><button onClick={handleNav('resources')} className="hover:text-white hover:underline">Resource Center</button></li>
                <li><button onClick={handleNav('register-candidate')} className="hover:text-white hover:underline">Registration</button></li>
            </ul>
            </div>
            <div>
            <h4 className="text-md font-semibold mb-4 text-gray-300">Contact</h4>
            <p className="text-sm text-gray-400">info@ampindia.org</p>
            <p className="text-sm text-gray-400">+91 123 456 7890</p>
            </div>
            <div>
            <h4 className="text-md font-semibold mb-4 text-gray-300">Follow Us</h4>
            <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook fa-lg"></i></a>
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-linkedin fa-lg"></i></a>
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter fa-lg"></i></a>
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-pinterest fa-lg"></i></a>
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-telegram fa-lg"></i></a>
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram fa-lg"></i></a>
                <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-youtube fa-lg"></i></a>
            </div>
            </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            &copy; 2024 AMPOWERJOBS.com. All rights reserved.
        </div>
        </div>
    </footer>
  );
};

// --- Admin Sidebar ---
export const AdminSidebar: React.FC<{ activeTab: string, setActiveTab: (t: string) => void, userType: UserType }> = ({ activeTab, setActiveTab, userType }) => {
  // Defined vertical menu buttons as requested
  const menuItems = [
    { id: 'master', label: 'Master', icon: 'fa-database' },
    { id: 'approvals', label: 'Approvals', icon: 'fa-check-circle' },
    { id: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
    { id: 'job-posting', label: 'Job Posting', icon: 'fa-briefcase' },
    { id: 'blog', label: 'Blog', icon: 'fa-pen-fancy' },
    { id: 'email-marketing', label: 'E Mail Marketing', icon: 'fa-envelope' },
    { id: 'manage-events', label: 'Manage Events', icon: 'fa-calendar-alt' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen hidden md:block">
      <div className="p-4 font-bold text-xl border-b border-gray-700">
          Control Center
      </div>
      <div className="mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-6 py-4 hover:bg-gray-800 flex items-center ${activeTab === item.id ? 'bg-primary border-r-4 border-accent' : ''}`}
          >
            <i className={`fas ${item.icon} w-6`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};