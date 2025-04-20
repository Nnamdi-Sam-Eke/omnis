// components/ReauthModal.jsx
import React, { useState } from "react";
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

const ReauthModal = ({ onSuccess, onClose }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleReauth = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !password) return;

    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      onSuccess(); // Call delete logic here
    } catch (err) {
      setError("Reauthentication failed. Check your password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Confirm Identity</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Please re-enter your password to continue.</p>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded dark:bg-gray-700 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleReauth}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReauthModal;
