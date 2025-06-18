import React, { useEffect, useState } from 'react';
import { getAuth, updatePassword, signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path to your firebase config
import { useAuth } from '../AuthContext';
import { Eye, EyeOff } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const { user } = useAuth(); // Authenticated Firebase user
  const [userData, setUserData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [reauthenticating, setReauthenticating] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [lastActivity, setLastActivity] = useState('Loading...');
  // Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  // Dummy 2FA state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const auth = getAuth(); // Declare auth once at component level

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user data');
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    if (!user?.uid) return;

    const usersRef = collection(db, 'users');
    // Query the latest lastLogin for current user
    const q = query(
      usersRef,
      orderBy('lastLogin', 'desc'),
      limit(1)
    );

    const unsubscribeLastLogin = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        if (doc && doc.data().lastLogin) {
          const lastLoginDate = new Date(doc.data().lastLogin.toDate());
          const now = new Date();
          const diffMins = Math.floor((now - lastLoginDate) / (1000 * 60));
          if (diffMins < 60) setLastActivity(`${diffMins} mins ago`);
          else if (diffMins < 1440) setLastActivity(`${Math.floor(diffMins / 60)} hours ago`);
          else setLastActivity(`${Math.floor(diffMins / 1440)} days ago`);
        } else {
          setLastActivity('No login data');
        }
      } else {
        setLastActivity('No login data');
      }
    });

    return () => unsubscribeLastLogin();
  }, [user?.uid]);

  const reauthenticate = async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('User not authenticated');
    }

    const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);

    try {
      await reauthenticateWithCredential(firebaseUser, credential);
      return true;
    } catch (error) {
      console.error('Reauthentication failed:', error.message);
      toast.error('Reauthentication failed. Please check your password.');
      return false;
    }
  };

  const handleConfirm = async () => {
    if (!auth.currentUser) return;

    try {
      const user = auth.currentUser;
      const sessionRef = doc(db, 'sessions', user.uid);

      if (actionToConfirm === 'signout') {
        await signOut(auth);
        toast.success('Signed out from this session.');
        window.location.reload();
      }
      else if (actionToConfirm === 'signout_all') {
        await deleteDoc(sessionRef); // Removes session from Firestore
        await signOut(auth);
        toast.success('Signed out from all sessions.');
        window.location.reload();
      }
      else if (actionToConfirm === 'delete_account') {
        if (!currentPassword) {
          toast.error('Please enter your current password to confirm.');
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        await deleteDoc(doc(db, 'users', user.uid));
        await deleteDoc(sessionRef);
        await deleteUser(user);

        toast.success('Your account has been deleted.');
        navigate('/goodbye');
      }

      setShowConfirmModal(false);
      setActionToConfirm(null);
      setReauthenticating(false);
      setCurrentPassword('');

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'An error occurred. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(firebaseUser, newPassword);
      toast.success('Password updated successfully!');
      setNewPassword('');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setReauthenticating(true); // show reauthentication form
        toast.error('Please reauthenticate to change your password.');
      } else {
        console.error('Password update error:', error.message);
        toast.error('Error updating password: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Summary', 'Security', 'Sessions', 'Danger Zone'];

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-6">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
      
      <h1 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-6 mb-6">Account Overview</h1>

      <div className="flex gap-4 items-center justify-center mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-green-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'Summary' && userData && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-300 mb-2">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <strong>User ID:</strong>
                <span className="break-all">{showUserId ? user?.uid || 'N/A' : '••••••••••••••••••••••••'}</span>
                <button
                  onClick={() => setShowUserId((prev) => !prev)}
                  className="text-blue-500 hover:text-blue-700"
                  aria-label="Toggle User ID visibility"
                  type="button"
                >
                  {showUserId ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div><strong>First Name:</strong> {user?.firstName || 'N/A'}</div>
              <div><strong>Last Name:</strong> {user?.lastName || 'N/A'}</div>
              <div><strong>Email:</strong> {user?.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {userData?.phone || 'N/A'}</div>
              <div><strong>City:</strong> {userData?.city || 'N/A'}</div>
              <div><strong>Country:</strong> {user?.country || 'N/A'}</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="mt-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            type="button"
          >
            Edit in Profile
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'Security' && (
        <div className="p-4 sm:p-6 bg-white dark:bg-gray-900 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-300 mb-4">
            Security
          </h2>
          <div className="space-y-6 max-w-md">
            {/* New Password Input */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="new-password"
                  className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Two-Factor Toggle */}
            <label className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 focus:ring-blue-500 rounded"
                checked={twoFAEnabled}
                onChange={() => setTwoFAEnabled((prev) => !prev)}
              />
              <span>Enable Two-Factor Authentication</span>
            </label>

            {/* Submit Button */}
            <button
              onClick={handlePasswordChange}
              type="button"
              disabled={loading}
              className={`w-full sm:w-auto px-5 py-2 rounded-lg text-white font-medium transition-colors ${
                loading
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'Sessions' && (
        <div>
          <h2 className="text-lg font-semibold text-green-600 dark:text-green-300 mb-4">Active Sessions</h2>
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Last Activity: {lastActivity}
          </div>
          <button
            onClick={() => {
              setActionToConfirm('signout');
              setShowConfirmModal(true);
            }}
            className="mr-3 mt-8 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            type="button"
          >
            Sign Out from This Session
          </button>
          <button
            onClick={() => {
              setActionToConfirm('signout_all');
              setShowConfirmModal(true);
            }}
            className="px-4 mt-8 py-2 bg-red-800 text-white rounded hover:bg-red-900"
            type="button"
          >
            Sign Out from All Sessions
          </button>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'Danger Zone' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
          <p className="text-sm text-red-700 dark:text-red-400 max-w-xl">
            Warning: Deleting your account is irreversible. All your data will be permanently removed.
            This action cannot be undone.
          </p>

          <button
            onClick={() => {
              setActionToConfirm('delete_account');
              setReauthenticating(true); // Enable reauthentication immediately
              setShowConfirmModal(true);
            }}
            className="px-6 py-3 bg-red-700 text-white rounded hover:bg-red-800"
            type="button"
          >
            Delete Account
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full p-6 text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {actionToConfirm === 'signout' && 'Confirm Sign Out'}
              {actionToConfirm === 'signout_all' && 'Confirm Sign Out from All Sessions'}
              {actionToConfirm === 'delete_account' && 'Confirm Account Deletion'}
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {actionToConfirm === 'signout' &&
                'Are you sure you want to sign out from this session?'}
              {actionToConfirm === 'signout_all' &&
                'Are you sure you want to sign out from all sessions? This will log you out everywhere.'}
              {actionToConfirm === 'delete_account' &&
                'This action is irreversible. Are you absolutely sure you want to delete your account?'}
            </p>

            {/* If reauthentication needed for delete, show current password input */}
            {actionToConfirm === 'delete_account' && reauthenticating && (
              <div className="mb-4">
                <label htmlFor="current-password" className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
                  Enter Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full border rounded p-2 pr-10 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoComplete="current-password"
                    placeholder="Current password"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                type="button"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setActionToConfirm(null);
                  setReauthenticating(false);
                  setCurrentPassword('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;