import { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore"; // Fixed import
import { db } from "../firebase"; // adjust path if needed
import { getAuth } from "firebase/auth";

const AuthForm = () => {
  const { signup, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const fetchUserData = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Last login:", userData.lastLogin);
      } else {
        console.log("No such document!");
      }
    }
  };

  const handleSignupClick = () => setShowForm(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signup(firstname, lastname, phone, email, password, location, country);
      } else {
        const userCredential = await login(email, password);
        const auth = getAuth();
        const user = auth.currentUser;
  
        // ✅ Update Firestore with lastLogin timestamp
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            lastLogin: serverTimestamp(), // Set lastLogin to current timestamp
          });
          
          // Fetch the user data after successful login (optional)
          fetchUserData(); 
        }
      }
  
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Auth Error:", error.message);
      setError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      alert("Password reset email sent!");
      setShowResetPassword(false);
    } catch (error) {
      console.error("❌ Password Reset Error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-100">
      {showForm ? (
        showResetPassword ? (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-900">
            <h2 className="text-3xl font-extrabold mb-6 font-serif">Reset Your Password</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleResetPassword} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-700 hover:shadow-lg transition-transform transform hover:scale-105"
              >
                Send Password Reset Email
              </button>
            </form>
            <button
              className="text-blue-600 mt-4 font-medium hover:underline"
              onClick={() => {
                setShowResetPassword(false);
                setIsSignUp(false);
              }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-900">
            <h2 className="text-3xl font-extrabold   justify-center ml-8 mb-6 font-serif">
              {isSignUp ? "Create Your Omnis Account" : "Welcome Back!"}
            </h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              {isSignUp && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                    required
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    required
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Location/City"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mb-4 p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-700 hover:shadow-lg transition-transform transform hover:scale-105"
              >
                {isSignUp ? "Sign Up" : "Log In"}
              </button>
            </form>
            <button
              className="text-blue-600 mt-4 font-medium hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
            <button
              className="text-blue-600 mt-2 font-medium hover:underline"
              onClick={() => setShowResetPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-100">
          <p className="text-5xl text-gray-800 italic font-light font-cursive">
            New to Omnis?
          </p>
          <button
            onClick={handleSignupClick}
            className="px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full hover:bg-blue-700 shadow-lg hover:shadow-blue-500 transition-transform transform hover:scale-105"
          >
            Signup
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
