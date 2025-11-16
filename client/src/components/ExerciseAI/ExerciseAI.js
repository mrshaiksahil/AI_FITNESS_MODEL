import React, { useState } from 'react';
import axios from 'axios';

const ExerciseAI = ({ user }) => {
  const [selectedExercise, setSelectedExercise] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [file, setFile] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [result, setResult] = useState(null);

  // Exercise options grid
  const exercises = [
    'pushups', 'pullups', 'squarts', 'russian twist', 
    'leg rises', 'planks', 'lateral rise', 'chest butterfly', 'bicep'
  ];
  
  /*
   * ML MODEL INTEGRATION POINT (Frontend):
   * - You can bypass the backend and call your model directly here.
   * - If you do, set `result` with the structure: { exercise, reps, calories, feedback }.
   * - Then, persist calories for authenticated users by POST /api/calories or for guests via localStorage.
   */

  const handleExerciseSelect = (exercise) => {
    setSelectedExercise(exercise);
    setUploadType('');
    setFile(null);
    setResult(null);
  };

  const handleUploadTypeSelect = (type) => {
    setUploadType(type);
    if (type === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      const video = document.getElementById('camera');
      video.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedExercise || !uploadType) return;

    const formData = new FormData();
    formData.append('exercise', selectedExercise);

    if (uploadType === 'upload' && file) {
      formData.append('file', file);
    } else if (uploadType === 'camera') {
      const video = document.getElementById('camera');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          formData.append('file', blob, 'capture.jpg');
          sendToAI(formData);
        }
      });
      return;
    }
    sendToAI(formData);
  };

  const sendToAI = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5003/api/exercise-ai/analyze', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
      // Persist calories
      if (response.data.calories) {
        if (token && token !== 'demo-jwt-token') {
          await axios.post('http://localhost:5003/api/calories', {
            exercise: selectedExercise,
            calories: response.data.calories
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          const localTotal = parseInt(localStorage.getItem('totalCalories') || '0', 10);
          localStorage.setItem('totalCalories', String(localTotal + response.data.calories));
        }
      }
    } catch (error) {
      console.error('Error analyzing exercise:', error);
      setResult({ error: 'Failed to analyze exercise. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Exercise AI Analysis</h1>

        {!selectedExercise ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select an Exercise</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {exercises.map((exercise) => (
                <button
                  key={exercise}
                  onClick={() => handleExerciseSelect(exercise)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-6 px-6 rounded-lg transition duration-300 capitalize text-xl flex flex-col items-center justify-center"
                >
                  <span className="text-3xl mb-2">💪</span>
                  {exercise}
                </button>
              ))}
            </div>
          </div>
        ) : !uploadType ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">How would you like to upload?</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => handleUploadTypeSelect('upload')}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Upload File
              </button>
              <button
                onClick={() => handleUploadTypeSelect('camera')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
              >
                Use Camera
              </button>
            </div>
            <button
              onClick={() => setSelectedExercise('')}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              ← Back to exercises
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {uploadType === 'upload' ? 'Upload File' : 'Camera Capture'} for {selectedExercise}
            </h2>

            {uploadType === 'upload' ? (
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div className="mb-4">
                <video
                  id="camera"
                  autoPlay
                  className="w-full max-w-md mx-auto border border-gray-300 rounded-md"
                ></video>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Analyze Exercise
              </button>
              <button
                onClick={() => {
                  setUploadType('');
                  stopCamera();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
              >
                Back
              </button>
            </div>

            {result && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Analysis Result</h3>
                {result.error ? (
                  <p className="text-red-600">{result.error}</p>
                ) : (
                  <div>
                    <p><strong>Exercise:</strong> {result.exercise}</p>
                    <p><strong>Reps:</strong> {result.reps}</p>
                    <p><strong>Calories Burned:</strong> {result.calories} kcal</p>
                    <p><strong>Feedback:</strong> {result.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseAI;