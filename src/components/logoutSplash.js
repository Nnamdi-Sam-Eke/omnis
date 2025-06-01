import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [fade, setFade] = useState(true);
  const [typingIndex, setTypingIndex] = useState(0);
  const [fullText, setFullText] = useState("");

  useEffect(() => {
    if (!fullText) return;

    const interval = setInterval(() => {
      setMessage((prev) => prev + fullText[typingIndex]);
      setTypingIndex((prev) => prev + 1);
    }, 40);

    if (typingIndex === fullText.length) clearInterval(interval);
    return () => clearInterval(interval);
  }, [typingIndex, fullText]);

  const typeMessage = (text) => {
    setMessage("");
    setTypingIndex(0);
    setFullText(text);
  };

  const handleLogout = async () => {
    toast.info("You are being logged out.", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      pauseOnHover: false,
      draggable: false,
      theme: "dark",
    });

    setIsLoggingOut(true);
    setFade(true);
    typeMessage("Logging you out...");

    try {
      await logout();

      setTimeout(() => {
        setFade(false); // fade out
        setTimeout(() => {
          typeMessage("Redirecting to login page...");
          setFade(true); // fade in again

          setTimeout(() => {
            navigate("/login");
          }, 2000); // time before navigating
        }, 600); // time to wait before showing redirect message
      }, 2500); // duration to show first message
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
          <div className="flex flex-col items-center space-y-4">
            <Loader className="animate-spin text-white w-12 h-12" />
            <p
              className={`text-white text-lg transition-opacity duration-500 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
            >
              {message}
            </p>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Logout;
