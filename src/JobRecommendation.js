// src/components/JobRecommendations.js

import React, { useState } from 'react';
import axios from 'axios';

const JobRecommendations = () => {
  const [userId, setUserId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
      setError('Please enter a valid user ID.');
      return;
    }

    try {
      setError(null);
      const response = await axios.post('http://localhost:5000/recommend', {
        user_id: parsedUserId,
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommendations. Please try again later.');
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Job Recommendations</h1>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={fetchRecommendations}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Get Recommendations
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-4">
        {recommendations.map((job) => (
          <li key={job.job_id} className="border p-4 rounded shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-700">{job.description}</p>
            <p className="text-sm text-gray-500 mt-1">
              {job.company} — {job.location}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobRecommendations;
