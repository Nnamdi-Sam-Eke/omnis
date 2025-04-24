import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebase";
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
        console.log("Last login:", docSnap.data().lastLogin);
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

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-gray-100">
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
          <h2 className="text-3xl font-extrabold mb-6">Reset Your Password</h2>
          {error && (
            <p className="text-red-500 mb-4">
              {String(error)}
            </p>
          )}
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
          <h2 className="text-3xl font-extrabold mb-6">
            {isSignUp ? "Create Your Omnis Account" : "Welcome Back!"}
          </h2>
          {error && (
            <p className="text-red-500 mb-4">
              {String(error)}
            </p>
          )}
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
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
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
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="p-3 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white py-3 rounded-full"
            >
              {isSignUp ? "Sign Up" : "Log In"}
            </button>
          </form>
          <div className="flex space-x-4 mt-4">
            <button className="text-blue-600 hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
            <button className="text-blue-600 hover:underline" onClick={() => setShowResetPassword(true)}>
              Forgot Password?
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
