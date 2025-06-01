import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import imageCompression from 'browser-image-compression';



const AuthForm = () => {
  const { signup, login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
 const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const fetchUserData = async () => {
    const user = getAuth().currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        console.log("Last login:", docSnap.data().lastLogin);
      }
    }
  };

  const handleSignupClick = () => setShowForm(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        await signup(firstname, lastname, phone, email, password, city, country, profilePicture);
      } else {
        await login(email, password);
        const user = getAuth().currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { lastLogin: serverTimestamp() });
          await fetchUserData();
        }
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || "An unexpected error occurred");
    }
    
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      alert("Password reset email sent!");
      setShowResetPassword(false);
      setError("");
    } catch (err) {
      console.error("Password Reset Error:", err);
      setError(err.message || "Failed to send reset email");
    }
  };

  const getPasswordStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) {
      return "Strong";
    }
    return "Medium";
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case "Weak":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Strong":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };




return (
   <div className="flex flex-col scale-[0.70] origin-center items-center justify-center min-h-screen space-y-4 bg-white py-8 px-4 sm:px-6 sm:py-8 w-full max-w-md lg:max-w-xl xl:max-w-2xl mx-auto overflow-y-auto">

      {!showForm ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-5xl text-gray-800 italic font-light">New to Omnis?</p>
          <button
            onClick={handleSignupClick}
            className="px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Signup
          </button>
        </div>
      ) : showResetPassword ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-900">
          <h2 className="text-3xl font-light mb-6">Reset Your Password</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleResetPassword} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mb-4 p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full"
            >
              Send Password Reset Email
            </button>
          </form>
          <button
            className="text-blue-600 mt-4 hover:underline"
            onClick={() => {
              setShowResetPassword(false);
              setIsSignUp(false);
              setError("");
            }}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-900">
          <h2 className="text-3xl font-light mb-6 mt-8">
            {isSignUp ? "Create Your Omnis Account" : "Welcome Back!"}
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-4">
            {isSignUp && (
              <>
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  required
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Location/City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const options = { maxSizeMB: 1, maxWidthOrHeight: 500 };
                      try {
                        const compressedFile = await imageCompression(file, options);
                        const base64 = await imageCompression.getDataUrlFromFile(compressedFile);
                        setProfilePicture(base64); // or upload to storage & set URL
                      } catch (error) {
                        console.error("Image compression error", error);
                      }
                    }
                  }}
                  className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-3 border rounded-lg w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isSignUp && (
              <>
                <p
className="text-sm text-gray-500 mt-2">Password strength: <span className={getStrengthColor(getPasswordStrength())}>{getPasswordStrength()}</span></p>
<div className="relative w-full">
<input
type={showConfirmPassword ? "text" : "password"}
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e) => setConfirmPassword(e.target.value)}
required
className="p-3 border rounded-lg w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
/>
<button
type="button"
onClick={() => setShowConfirmPassword(!showConfirmPassword)}
className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
aria-label={showConfirmPassword ? "Hide password" : "Show password"}
>
{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
</button>
</div>
</>
)}
<button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full" >
{isSignUp ? "Sign Up" : "Login"}
</button>
{!isSignUp && (
<button
type="button"
className="text-blue-600 mt-4 hover:underline w-full"
onClick={() => setShowResetPassword(true)}
>
Forgot Password?
</button>
)}
</form>
<button
className="text-blue-600 mt-4 hover:underline"
onClick={() => setIsSignUp(!isSignUp)}
>
{isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
</button>
</div>
)}
</div>
);
};

export default AuthForm;