import { useState } from "react";
import { useAuth } from "../AuthContext"; // Import Auth Context
import { useNavigate } from "react-router-dom"; // For navigation

const Logout = ({ setLogoutMessage }) => {
  const { logout } = useAuth(); // ✅ Get logout function from context
  const navigate = useNavigate();
  const [localLogoutMessage, setLocalLogoutMessage] = useState("");
  const logoutMessage = localLogoutMessage || setLogoutMessage;
  const handleLogout = async () => {
    try {
      console.log("Attempting to log out..."); // Debugging log

      await logout(); // ✅ Ensure this function is correctly called

      setLocalLogoutMessage("You have been logged out successfully.");
      if (setLogoutMessage) {
        setLogoutMessage("You have been logged out successfully.");
      }

      setTimeout(() => {
        navigate("/login"); // ✅ Redirect to login
      }, 2000);

    } catch (error) {
      console.error("Logout failed:", error.message);
      setLocalLogoutMessage("Logout failed. Please try again.");
    }
  };


  return (
    <div>
      <button onClick={handleLogout} className=" bg-white text-red-600 dark:text-red-400">
        Log Out
      </button>

      {localLogoutMessage && (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
          <p className="text-lg font-semibold bg-green-100 text-green-800 px-4 py-2 rounded-md">
            {localLogoutMessage}
          </p>
          <button
            onClick={() => {
              setLocalLogoutMessage(""); // Hide message
              navigate("/login"); // Redirect
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default Logout;