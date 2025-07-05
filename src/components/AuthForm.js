import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react";
import imageCompression from "browser-image-compression";
import PulseBackground from "./PulseBackground"; // 👈 new


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
        return "text-red-400";
      case "Medium":
        return "text-yellow-400";
      case "Strong":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden">
      <PulseBackground />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center px-4 py-12 h-full">


        <div className="w-full md:w-2/3 p-8 space-y-8 rounded-xl shadow-lg bg-white/5 backdrop-blur-sm mx-auto overflow-y-auto max-h-[600px] text-white">
          {showResetPassword ? (
            <div>
              <h2 className="text-2xl font-light mb-4 text-center">Reset Your Password</h2>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <form onSubmit={handleResetPassword} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border border-white/20 rounded-lg bg-white/10 text-white placeholder-white/50"
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
                  className="w-full text-blue-400 hover:underline mt-2"
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
                    isSignUp ? "bg-blue-600 text-white" : "bg-white/20 text-white"
                  }`}
                  onClick={() => setIsSignUp(true)}
                >
                  Sign Up
                </button>
                <button
                  className={`px-4 py-2 rounded-full text-sm font-medium transform transition-transform active:scale-95 ${
                    !isSignUp ? "bg-blue-600 text-white" : "bg-white/20 text-white"
                  }`}
                  onClick={() => setIsSignUp(false)}
                >
                  Log In
                </button>
              </div>
              <h2 className="text-center text-2xl font-light">
                {isSignUp ? "Create Your Omnis Account" : "Welcome Back!"}
              </h2>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                {isSignUp && (
                  <>
                    <input type="text" placeholder="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} required className="input bg-white/10 text-white placeholder-white/50 border-white/20" />
                    <input type="text" placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} required className="input bg-white/10 text-white placeholder-white/50 border-white/20" />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input bg-white/10 text-white placeholder-white/50 border-white/20" />
                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="input bg-white/10 text-white placeholder-white/50 border-white/20" />
                    <input type="text" placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} required className="input bg-white/10 text-white placeholder-white/50 border-white/20" />
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
                      className="input bg-white/10 text-white placeholder-white/50 border-white/20"
                    />
                  </>
                )}

                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input bg-white/10 text-white placeholder-white/50 border-white/20" />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input pr-10 bg-white/10 text-white placeholder-white/50 border-white/20"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white/50">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {isSignUp && (
                  <>
                    <p className="text-sm">
                      Password strength: <span className={getStrengthColor(getPasswordStrength())}>{getPasswordStrength()}</span>
                    </p>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input pr-10 bg-white/10 text-white placeholder-white/50 border-white/20"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white/50">
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
    ? (isSubmitting ? "Creating your Omnis account..." : "Sign Up")
    : (isSubmitting ? "Logging in..." : "Log In")}
</button>


                {!isSignUp && (
                  <button type="button" onClick={() => setShowResetPassword(true)} className="w-full text-sm text-blue-400 mt-2 hover:underline">
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
