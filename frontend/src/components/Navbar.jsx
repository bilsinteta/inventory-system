import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser, FiPackage, FiTruck, FiGrid, FiSettings } from 'react-icons/fi';
import ProfileModal from './ProfileModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo & Menu */}
            <div className="flex items-center gap-12">
              <Link to="/dashboard" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform duration-300">
                  📦
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                  Inventory
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1.5 rounded-xl border border-gray-200/50">
                {navLinks.map((link) => {
                  // Approximate matching for better UX (e.g. /dashboard matches /)
                  const isActive = location.pathname === link.path || (link.path === '/dashboard' && location.pathname === '/');
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                    >
                      <link.icon size={16} />
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 shadow-inner">
                  <FiUser size={18} />
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                  <span className="text-xs text-secondary-500 font-medium tracking-wide uppercase">{user?.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="group p-2.5 rounded-xl text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  title="Profile Settings"
                >
                  <FiSettings size={20} className="group-hover:rotate-45 transition-transform" />
                </button>

                <button
                  onClick={handleLogout}
                  className="group p-2.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  title="Logout"
                >
                  <FiLogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
};

export default Navbar;