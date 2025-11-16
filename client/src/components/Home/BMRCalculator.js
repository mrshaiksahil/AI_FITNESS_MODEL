// ... existing code ...
const calculateBMR = () => {
  // BMR calculation logic
  const bmr = // calculation based on user inputs
  
  // Save to user profile
  axios.patch(`/api/users/${userId}`, { bmr });
  
  return bmr;
};
// ... existing code ...