import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const GoodbyePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">Goodbye!</h1>
        <p className="text-lg">
          Your account has been successfully deleted. We're sad to see you go, but we wish you all the best. 💛
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you change your mind, you're always welcome to create a new account.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </button>
      </div>
    </div>
  );
};

export default GoodbyePage;