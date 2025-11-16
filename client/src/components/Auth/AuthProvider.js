// ... existing code ...
// Add Google OAuth integration
const googleSignIn = async () => {
  try {
    const result = await signInWithGoogle();
    // Save user data to MongoDB
    await axios.post('/api/users', {
      uid: result.user.uid,
      email: result.user.email,
      name: result.user.displayName
    });
  } catch (error) {
    console.error(error);
  }
};
// ... existing code ...