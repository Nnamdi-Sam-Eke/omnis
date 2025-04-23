// components/ReauthModal.jsx
import React, { useState } from "react";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

const ReauthModal = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const handleReauth = async () => {
    if (!user) {
      setError("No authenticated user found.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const providerId = user.providerData[0]?.providerId;

      if (providerId === "password") {
        if (!password) {
          setError("Password is required.");
          setLoading(false);
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      } else if (providerId === "google.com") {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        setError("Unsupported authentication method.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setPassword("");
      setError("");
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(
        err.code === "auth/wrong-password"
          ? "Incorrect password."
          : "Reauthentication failed. Try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Confirm Identity</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          {user?.providerData[0]?.providerId === "password"
            ? "Please enter your password to continue."
            : "Please confirm using your provider to continue."}
        </p>

        {user?.providerData[0]?.providerId === "password" && (
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded dark:bg-gray-700 mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleReauth}
            className={`px-4 py-2 bg-red-600 text-white rounded transition ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
            }`}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReauthModal;
