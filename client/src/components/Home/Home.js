import React, { useState, useEffect } from 'react';

const Home = ({ user }) => {
  const [bmr, setBmr] = useState(user?.bmr || 0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [notes, setNotes] = useState(localStorage.getItem('fitnessNotes') || '');
  const [showBmrCalculator, setShowBmrCalculator] = useState(!user?.bmr || user.bmr === 0);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: 'male'
  });

  useEffect(() => {
    fetchTotalCalories();
  }, []);

  const fetchTotalCalories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && token !== 'demo-jwt-token') {
        const res = await fetch('http://localhost:5003/api/calories/total', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTotalCalories(data.totalCalories || 0);
          return;
        }
      }
      // Fallback: persist locally for guest/demo
      const localTotal = parseInt(localStorage.getItem('totalCalories') || '0', 10);
      setTotalCalories(localTotal);
    } catch (error) {
      console.error('Error fetching total calories:', error);
      const localTotal = parseInt(localStorage.getItem('totalCalories') || '0', 10);
      setTotalCalories(localTotal);
    }
  };

  const calculateBMR = () => {
    const { age, weight, height, gender } = formData;
    if (!age || !weight || !height) return;

    let calculatedBmr;
    if (gender === 'male') {
      calculatedBmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      calculatedBmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    setBmr(Math.round(calculatedBmr));
  };

  const saveBMR = async () => {
    try {
      const token = localStorage.getItem('token');

      if (token && token !== 'demo-jwt-token') {
        const response = await fetch('http://localhost:5003/api/profile/bmr', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ bmr })
        });

        if (response.ok) {
          const result = await response.json();
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.bmr = result.bmr;
          user.age = formData.age;
          user.weight = formData.weight;
          user.height = formData.height;
          user.gender = formData.gender;
          localStorage.setItem('user', JSON.stringify(user));
          alert('BMR saved to database successfully! ✅');
          setShowBmrCalculator(false);
          return;
        }
      }

      // Fallback to localStorage for guest users or demo mode
      const userLS = JSON.parse(localStorage.getItem('user') || '{}');
      userLS.bmr = bmr;
      userLS.age = formData.age;
      userLS.weight = formData.weight;
      userLS.height = formData.height;
      userLS.gender = formData.gender;
      localStorage.setItem('user', JSON.stringify(userLS));
      alert('BMR saved locally! ✅');
      setShowBmrCalculator(false);
    } catch (error) {
      console.error('Error saving BMR:', error);
      const userLS = JSON.parse(localStorage.getItem('user') || '{}');
      userLS.bmr = bmr;
      userLS.age = formData.age;
      userLS.weight = formData.weight;
      userLS.height = formData.height;
      userLS.gender = formData.gender;
      localStorage.setItem('user', JSON.stringify(userLS));
      alert('BMR saved locally! ✅');
      setShowBmrCalculator(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold gradient-text mb-8 float-animation">Welcome back, {user?.name || 'User'}! 🏋️‍♂️</h1>

        {/* Total Calories Burned */}
        <div className="glass rounded-lg shadow-md p-6 mb-8 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🔥</span> Total Calories Burned
          </h2>
          <div className="text-4xl font-bold text-orange-400">{totalCalories} kcal</div>
        </div>

        {/* Notes Section */}
        <div className="glass rounded-lg shadow-md p-6 mb-8 card-hover">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">📝</span> My Notes
          </h2>
          <textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              localStorage.setItem('fitnessNotes', e.target.value);
            }}
            className="w-full h-32 px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
            placeholder="Write your fitness notes here..."
          ></textarea>
        </div>

        {/* BMR Display */}
        {showBmrCalculator ? (
          <div className="glass rounded-lg shadow-md p-6 card-hover">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <span className="mr-2">⚡</span> BMR Calculator
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                    placeholder="Enter your age"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                    placeholder="Enter your weight"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                    placeholder="Enter your height"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/10 backdrop-blur-sm text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <button
                  onClick={calculateBMR}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-md btn-pulse"
                >
                  ⚡ Calculate BMR
                </button>
              </div>
              <div className="flex flex-col justify-center items-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-white mb-2">Your BMR</h3>
                  <div className="text-3xl font-bold text-yellow-400 mb-4">{bmr} kcal/day</div>
                  {bmr > 0 && (
                    <button
                      onClick={saveBMR}
                      className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-2 px-4 rounded-md btn-pulse"
                    >
                      💾 Save BMR
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-lg shadow-md p-6 card-hover">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">⚡</span> Your BMR
            </h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-4">{bmr} kcal/day</div>
              <button
                onClick={() => setShowBmrCalculator(true)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-2 px-4 rounded-md btn-pulse"
              >
                🔄 Recalculate BMR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
