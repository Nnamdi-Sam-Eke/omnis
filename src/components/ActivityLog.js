import React, { useState } from "react";

// Toast component
const ToastMessage = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
};

const ActivityLog = () => {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleDownloadLog = () => {
    setLoading(true);

    // Simulate log download delay (3 seconds)
    setTimeout(() => {
      setLoading(false);
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }, 3000);
  };

  return (
    <div className="relative">
      {/* ✅ Toast Message */}
      <ToastMessage message="Activity log downloaded successfully!" visible={showToast} />

      {/* ✅ Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-12 h-12 border-8 border-green-500 border-t-transparent rounded-full animate-[spin_1s_linear_reverse_infinite]"></div>
          </div>
        </div>
      )}

      {/* ✅ Main Card */}
      <div className="bg-white border-2 h-96 dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-blue-500/50 transition">
        <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">Activity Log</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
          Your recent activities will be displayed here.
        </p>
        <button
          onClick={handleDownloadLog}
          disabled={loading}
          className={`w-full hover:scale-105 justify-center ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 px-8 rounded mt-4 transition`}
        >
          {loading ? "Downloading..." : "Download Log"}
        </button>
      </div>
    </div>
  );
};

export default ActivityLog;
