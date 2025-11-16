import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="glass shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold gradient-text float-animation">AI Fitness 🏋️‍♂️</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium btn-pulse"
            >
              🏠 Home
            </Link>
            <Link
              to="/exercise-ai"
              className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium btn-pulse"
            >
              🤖 Exercise AI
            </Link>
            <Link
              to="/profile"
              className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium btn-pulse"
            >
              👤 Profile
            </Link>
            <Link
              to="/settings"
              className="text-white hover:text-blue-300 px-3 py-2 rounded-md text-sm font-medium btn-pulse"
            >
              ⚙️ Settings
            </Link>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium btn-pulse"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
