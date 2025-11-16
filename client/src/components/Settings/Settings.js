import React, { useState } from 'react';
import axios from 'axios';

const Settings = ({ user, toggleDarkMode, darkMode }) => {
  const [bmr, setBmr] = useState(user?.bmr || 0);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Update BMR when user prop changes
  React.useEffect(() => {
    setBmr(user?.bmr || 0);
  }, [user]);

  const handleBmrChange = (e) => {
    setBmr(e.target.value);
  };

  const saveBmr = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-jwt-token') {
        await axios.put('http://localhost:5003/api/profile/bmr', { bmr: parseInt(bmr) }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const userLS = JSON.parse(localStorage.getItem('user') || '{}');
      userLS.bmr = parseInt(bmr);
      localStorage.setItem('user', JSON.stringify(userLS));
      alert('BMR updated successfully! ✅');
    } catch (error) {
      console.error('Error updating BMR:', error);
      alert('Failed to update BMR');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  
  // Profile Picture Upload
  const handleProfilePic = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('avatar', file);
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5003/api/profile/avatar', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });
      const updatedUser = { ...(JSON.parse(localStorage.getItem('user') || '{}')), profilePic: res.data.profilePic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Profile picture updated! ✅');
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload avatar');
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'demo-jwt-token') {
        alert('You must be logged in to change password.');
        return;
      }
      await axios.put('http://localhost:5003/api/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password changed successfully! ✅');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Password change failed:', err);
      alert(err?.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold gradient-text mb-8 float-animation">Settings ⚙️</h1>

        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="glass rounded-lg shadow-md p-6 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🌙</span> Appearance
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  darkMode ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-white/20'
                } btn-pulse`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* BMR Settings */}
          <div className="glass rounded-lg shadow-md p-6 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">🔥</span> BMR Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Basal Metabolic Rate (kcal/day)</label>
                <input
                  type="number"
                  value={bmr}
                  onChange={handleBmrChange}
                  className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  placeholder="Enter your BMR"
                />
              </div>
              <button
                onClick={saveBmr}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 btn-pulse"
              >
                💾 Save BMR
              </button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="glass rounded-lg shadow-md p-6 card-hover">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">👤</span> Account
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img src={user?.profilePic || 'https://via.placeholder.com/80'} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white/30" />
                <label className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md cursor-pointer btn-pulse">
                  Upload Avatar
                  <input type="file" accept="image/*" onChange={handleProfilePic} className="hidden" />
                </label>
              </div>
              <p className="text-sm text-white/70">Email: {user?.email}</p>

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <label className="block text-sm font-medium text-white">Change Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                />
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 btn-pulse">
                  🔒 Update Password
                </button>
              </form>

              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 btn-pulse"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;