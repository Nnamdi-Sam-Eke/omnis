import { useState } from "react";
import { useAuth } from "../AuthContext"; // Import Auth Context
import { useNavigate } from "react-router-dom"; // For navigation
import { Loader } from "lucide-react"; // Import spinner icon

const Logout = () => {
  const { logout } = useAuth(); // ✅ Get logout function from context
  const navigate = useNavigate();
  const [localLogoutMessage, setLocalLogoutMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Add state for overlay

  const handleLogout = async () => {
    try {
      console.log("Attempting to log out..."); // Debugging log
      setIsLoggingOut(true); // Start showing overlay + spinner

      await logout(); // ✅ Ensure this function is correctly called

      setLocalLogoutMessage("You have been logged out successfully.");

      setTimeout(() => {
        navigate("/login"); // ✅ Redirect to login
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Logout failed:", error.message);
      setLocalLogoutMessage("Logout failed. Please try again.");
      setIsLoggingOut(false); // Stop overlay if there's an error
    }
  };

  return (
    <div>
      <button onClick={handleLogout} className="bg-white text-red-600 dark:text-red-400">
        Log Out
      </button>

      {/* Display logout message if it exists */}
      {/* {localLogoutMessage && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          <p className="text-lg font-semibold bg-green-100 text-green-800 px-4 py-2 rounded-md">
            {localLogoutMessage}
          </p>
          <button
            onClick={() => {
              setLocalLogoutMessage(""); // Hide message
              navigate("/login"); // Redirect immediately if OK is clicked
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            OK
          </button>
        </div> */}
      {/* )} */}

      {/* Overlay + spinner while logging out */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="animate-spin text-white w-12 h-12" />
            <p className="text-white text-lg">Logging out...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Logout;
