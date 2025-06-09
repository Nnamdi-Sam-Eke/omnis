import React, { useEffect, useState } from 'react';
import { getAuth, updatePassword, deleteUser } from 'firebase/auth';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path to your firebase config
import { useAuth } from '../AuthContext';
import { Eye, EyeOff } from "lucide-react";
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

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

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
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
    const auth = getAuth();
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
      alert('Reauthentication failed. Please check your password.');
      return false;
    }
  };

  const handleConfirm = async () => {
    try {
      if (actionToConfirm === 'signout') {
        await getAuth().signOut();
        navigate('/login');
      }

      if (actionToConfirm === 'signout_all') {
        // Example backend call to revoke tokens
        // await revokeTokensForUser(user.uid);
        alert('Sign out from all sessions will require backend support.');
        await getAuth().signOut();
        navigate('/login');
      }

      if (actionToConfirm === 'delete_account') {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) throw new Error('User not authenticated');

        // Reauthenticate before delete
        const success = await reauthenticate();
        if (!success) {
          alert('Reauthentication required to delete account.');
          return;
        }

        await deleteUser(firebaseUser);
        alert('Account deleted successfully.');
        navigate('/signup'); // or landing page after delete
      }
    } catch (error) {
      alert('An error occurred: ' + error.message);
    } finally {
      setShowConfirmModal(false);
      setActionToConfirm(null);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword) return;

    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      alert('User not authenticated. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(firebaseUser, newPassword);
      alert('Password updated successfully!');
      setNewPassword('');
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setReauthenticating(true); // show reauthentication form
      } else {
        console.error('Password update error:', error.message);
        alert('Error updating password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Summary', 'Security', 'Sessions', 'Danger Zone'];

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-6">
      <h1 className="text-2xl font-semibold text-blue-600 dark:text-300 mb-6">Account Overview</h1>

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
              <div><strong>Phone:</strong> {userData.phone || 'N/A'}</div>
              <div><strong>City:</strong> {userData?.location?.city || 'N/A'}</div>
              <div><strong>Country:</strong> {userData.country || 'N/A'}</div>
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
        <div>
          <h2 className="text-lg font-semibold text-green-600 dark:text-green-300 mb-4">Security</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-password">New Password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border rounded p-2 pr-10"
                  placeholder="********"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={twoFAEnabled}
                onChange={() => setTwoFAEnabled((prev) => !prev)}
              />
              <span>Enable Two-Factor Authentication</span>
            </label>
            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
              type="button"
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
                    className="w-full border rounded p-2 pr-10"
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
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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
