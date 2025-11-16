import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    organization: user?.organization || '',
    age: '',
    weight: '',
    height: '',
    bmr: user?.bmr || 0,
    profilePic: user?.profilePic || ''
  });
  const [isEditing, setIsEditing] = useState(false);

  // Update profileData when user prop changes
  useEffect(() => {
    setProfileData(prevData => ({
      ...prevData,
      name: user?.name || '',
      email: user?.email || '',
      organization: user?.organization || '',
      age: user?.age || '',
      weight: user?.weight || '',
      height: user?.height || '',
      bmr: user?.bmr || 0,
      profilePic: user?.profilePic || ''
    }));
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-jwt-token') {
        const response = await fetch('http://localhost:5003/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const serverData = await response.json();
          setProfileData(prevData => ({ ...prevData, ...serverData }));
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...serverData }));
          return;
        }
      }
      const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
      setProfileData(prevData => ({ ...prevData, ...lsUser }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      const lsUser = JSON.parse(localStorage.getItem('user') || '{}');
      setProfileData(prevData => ({ ...prevData, ...lsUser }));
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  // Upload avatar to server when editing
  const handleAvatarUpload = async (e) => {
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
      const newPic = res.data.profilePic;
      setProfileData({ ...profileData, profilePic: newPic });
      const updatedUser = { ...(JSON.parse(localStorage.getItem('user') || '{}')), profilePic: newPic };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload avatar');
    }
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: profileData.name,
        organization: profileData.organization,
        age: profileData.age,
        weight: profileData.weight,
        height: profileData.height,
        profilePic: profileData.profilePic
      };

      if (token && token !== 'demo-jwt-token') {
        const response = await fetch('http://localhost:5003/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const updatedUser = await response.json();
          localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...updatedUser }));
          alert('Profile updated successfully! ✅');
          setIsEditing(false);
          return;
        }
      }

      localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...payload }));
      alert('Profile updated successfully! ✅');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      localStorage.setItem('user', JSON.stringify({ ...(JSON.parse(localStorage.getItem('user') || '{}')), ...profileData }));
      alert('Profile updated locally! ✅');
      setIsEditing(false);
    }
  };

  // Update BMR directly from Profile
  const saveBmr = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-jwt-token') {
        await axios.put('http://localhost:5003/api/profile/bmr', { bmr: parseInt(profileData.bmr || 0) }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      const userLS = JSON.parse(localStorage.getItem('user') || '{}');
      userLS.bmr = parseInt(profileData.bmr || 0);
      localStorage.setItem('user', JSON.stringify(userLS));
      alert('BMR updated! ✅');
    } catch (err) {
      console.error('Update BMR failed:', err);
      alert('Failed to update BMR');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold gradient-text mb-8 float-animation">Profile 👤</h1>

        <div className="glass rounded-lg shadow-md p-6 card-hover">
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={profileData.profilePic || 'https://via.placeholder.com/150'}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-white/30 float-animation"
              />
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 cursor-pointer btn-pulse">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-white mt-4">{profileData.name}</h2>
            <p className="text-white/70">{profileData.email}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                ) : (
                  <p className="text-white">{profileData.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Email</label>
                <p className="text-white">{profileData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Organization</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="organization"
                    value={profileData.organization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                ) : (
                  <p className="text-white">{profileData.organization || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Age</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="age"
                    value={profileData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                ) : (
                  <p className="text-white">{profileData.age || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="weight"
                    value={profileData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                ) : (
                  <p className="text-white">{profileData.weight || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Height (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="height"
                    value={profileData.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                  />
                ) : (
                  <p className="text-white">{profileData.height || 'Not set'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">BMR (kcal/day)</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="bmr"
                      value={profileData.bmr}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                    />
                    <button onClick={saveBmr} className="px-3 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-md btn-pulse">Save</button>
                  </div>
                ) : (
                  <p className="text-white">{profileData.bmr || 0}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-white/20 rounded-md text-white hover:bg-white/10 btn-pulse"
                  >
                    ❌ Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white rounded-md btn-pulse"
                  >
                    💾 Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-md btn-pulse"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;