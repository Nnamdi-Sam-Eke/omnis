import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [localLogoutMessage, setLocalLogoutMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(true);
  const [fade, setFade] = useState(true);

  const handleLogout = async () => {
  try {
    toast.info("You are being logged out.", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      theme: "dark",
    });

    setIsLoggingOut(true);
    setLocalLogoutMessage("Logging you out...");
    setFade(true);

    setTimeout(() => {
      setFade(false); // Start fade out
      setTimeout(async () => {
        setLocalLogoutMessage("Redirecting you to login page...");
        setFade(true);

        await logout(500); // Delay actual sign-out by 500ms

        setTimeout(() => {
          navigate("/login");
        }, 1000); // Navigate after another delay
      }, 500); // After fade out
    }, 2000); // After initial message
  } catch (error) {
    console.error("Logout failed:", error.message);
    toast.error("Logout failed. Please try again.", {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
    setIsLoggingOut(false);
  }
};
  // Ensure the logout function is called with a delay
  // to allow the UI to update before navigating away
  // const handleLogout = async () => {
  //   setIsLoggingOut(true);
  //   setLocalLogoutMessage("Logging you out...");
  //   setFade(true); 

  return (
    <div>
      <button
        onClick={handleLogout}
        className="bg-white text-red-600 dark:text-red-400 px-4 py-2 rounded"
      >
        Log Out
      </button>

      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-4 scale-[0.75] origin-center">
            <Loader className="animate-spin text-white w-12 h-12" />
            <p
              className={`text-white text-lg transition-opacity duration-500 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {localLogoutMessage}
            </p>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Logout;
