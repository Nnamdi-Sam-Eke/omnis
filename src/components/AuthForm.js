import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import imageCompression from 'browser-image-compression';
import favicon from '../images/favicon1.png';

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
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setIsSubmitting(false);
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
      setIsSubmitting(false);
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
    <div className=" scale-75 max-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-4 py-12">
      <div className="flex flex-col md:flex-row max-w-6xl w-full max-h-[600px] shadow-2xl rounded-xl overflow-hidden">

        {/* Logo Section */}
        <div className="flex md:w-1/3 w-full md:max-h-[600px] bg-gradient-to-br from-blue-50 to-green-50 items-center justify-center p-4">
          <div className="text-center">
            <img src={favicon} alt="Omnis Logo" className="h-[300px] mx-auto md:h-[300px]" />
            <p className="text-xl font-semibold mt-4 text-gray-700">Welcome to Omnis</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-2/3 p-8 space-y-8 rounded-xl shadow-lg bg-white mx-auto overflow-y-auto max-h-[600px]">
          {showResetPassword ? (
            <div>
              <h2 className="text-2xl font-light mb-4 text-center">Reset Your Password</h2>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full transform transition-transform active:scale-95"
                >
                  Send Password Reset Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setIsSignUp(false);
                    setError("");
                  }}
                  className="w-full text-blue-600 hover:underline mt-2"
                >
                  Back to Login
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transform transition-transform active:scale-95 ${
                    isSignUp ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transform transition-transform active:scale-95 ${
                    !isSignUp ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setIsSignUp(false)}
                >
                  Log In
                </button>
              </div>
              <h2 className="text-center text-2xl font-light">
                {isSignUp ? "Create Your Omnis Account" : "Welcome Back!"}
              </h2>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {isSignUp && (
                  <>
                    <input type="text" placeholder="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} required className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg " />
                    <input type="text" placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} required className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" />
                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" />
                    <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg" />
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
                            setProfilePicture(base64);
                          } catch (error) {
                            console.error("Image compression error", error);
                          }
                        }
                      }}
                      className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                    />
                  </>
                )}

                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg " />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {isSignUp && (
                  <>
                    <p className="text-sm text-gray-500">
                      Password strength: <span className={getStrengthColor(getPasswordStrength())}>{getPasswordStrength()}</span>
                    </p>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500">
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full transform transition-transform active:scale-95"
                  disabled={isSubmitting}
                >
                  {isSignUp
                    ? "Sign Up"
                    : isSubmitting
                    ? "Logging in..."
                    : "Log In"}
                </button>

                {!isSignUp && (
                  <button type="button" onClick={() => setShowResetPassword(true)} className="w-full text-sm text-blue-600 mt-2 hover:underline">
                    Forgot Password?
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
// This code is a React component for an authentication form that allows users to sign up or log in.