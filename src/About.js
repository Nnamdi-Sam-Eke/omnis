// About.js
import React from 'react';

const About = () => {
  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
        <div className="flex flex-col bg-white shadow-lg rounded-lg p-4 dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">About</h2>
      <p className="mt-4 text-gray-900 dark:text-white">
        Welcome to our Digital Twin App, designed to give you personalized predictions, weather updates, and real-time scenario simulations. Our app learns from your interactions to provide more relevant suggestions over time. It’s designed to be your digital twin 
                companion, helping you make informed decisions with ease. Whether you're seeking the latest 
                weather updates, navigating through a map, or simulating various scenarios, we're here to assist 
                you every step of the way. We aim to bring data-driven solutions to everyday problems.
      </p>
      <h3 className="mt-6 text-xl font-bold text-gray-700 dark:text-gray-300">Features</h3>
      <ul className="mt-2 text-gray-600 dark:text-gray-400">
        <li>Real-time weather data and forecasts</li>
        <li>Geolocation and map integrations</li>
        <li>Personalized scenario simulations</li>
        <li>AI-driven suggestions based on your behavior</li>
      </ul>
      <h3 className="mt-6 text-xl font-bold text-gray-700 dark:text-gray-300">Contact</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">For inquiries or support, reach out to us at: <a href="mailto:support@digitaltwin.com" className="text-blue-500">support@digitaltwin.com</a></p>
      </div>
    </div>
  );
};

export default About;
