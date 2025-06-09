import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutSplash = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const messages = ["Logging you out...", "Redirecting you to login page..."];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [fade, setFade] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Typing effect
  useEffect(() => {
    const text = messages[currentMessageIndex];
    setDisplayText(""); // reset display text
    setShowCursor(true); // show cursor when typing starts
    let i = 0;

    const typingInterval = setInterval(() => {
      if (i <= text.length) {
        setDisplayText(text.substring(0, i));
        i++;
      } else {
        clearInterval(typingInterval);
        // Hide cursor after typing is complete
        setTimeout(() => setShowCursor(false), 1000);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentMessageIndex]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [showCursor]);

  // Control sequence
  useEffect(() => {
    const sequence = async () => {
      await new Promise((res) => setTimeout(res, 2000));
      setFade(false); // fade out

      await new Promise((res) => setTimeout(res, 500));
      setCurrentMessageIndex(1); // switch message
      setFade(true); // fade in

      await new Promise((res) => setTimeout(res, 2000));
      await logout();
      navigate("/login");
    };

    sequence();
  }, [logout, navigate]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50">
      <div className="flex flex-col items-center space-y-6 scale-100 origin-center">
        <Loader className="animate-spin text-white w-16 h-16" />
        <p
          className={`text-white text-2xl font-light tracking-wide select-none transition-opacity duration-1000 ${
            fade ? "opacity-100" : "opacity-0"
          }`}
        >
          {displayText}
          <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
            |
          </span>
        </p>
      </div>
    </div>
  );
};

export default LogoutSplash;