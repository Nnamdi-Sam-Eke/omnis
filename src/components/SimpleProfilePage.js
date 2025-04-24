import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const ProfileSkeleton = () => (
  <div className="animate-pulse max-w-lg mx-auto border p-8 mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
    <div className="h-6 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mb-6" />
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
      <div className="w-24 h-24 mx-auto rounded-full bg-gray-300 dark:bg-gray-700 mb-4" />
      <div className="h-4 w-3/4 mx-auto bg-gray-300 dark:bg-gray-600 rounded mb-2" />
      <div className="h-4 w-1/2 mx-auto bg-gray-300 dark:bg-gray-600 rounded" />
    </div>
    <div className="mt-6 space-y-4">
      <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
      <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded" />
      <div className="h-4 w-2/3 bg-gray-300 dark:bg-gray-700 rounded" />
    </div>
    <div className="mt-6 h-10 w-1/2 bg-gray-300 dark:bg-gray-700 rounded mx-auto" />
  </div>
);

const ProfilePage = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [showPopUp, setShowPopUp] = useState(null);

  useEffect(() => {
    if (showPopUp) {
      const timer = setTimeout(() => setShowPopUp(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopUp]);
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
  
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          setFirstName(userData.firstname || "");
          setLastName(userData.lastname || "");
          setBio(userData.bio || "");
          setEmail(userData.email || "");
          setPhone(userData.phone || "");
          setCity(userData.location?.city || "");
          setCountry(userData.location?.country || "");
        } else {
          console.error("No user data found in Firestore!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      } finally {
        // Always show skeleton for at least 1.2 seconds
        setTimeout(() => setInitialLoading(false), 2000);
      }
    };
  
    setInitialLoading(true); // ✅ always trigger skeleton on remount
    fetchUserData();
  }, [user]);
  

  const handleSaveChanges = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstname: firstName,
        lastname: lastName,
        bio: bio,
        email: email,
        phone: phone,
        location: { city: city, country: country },
      });
      setShowPopUp("profileUpdated");
      setIsEditable(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
      setShowPopUp("error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditable(true);

  const handleUpdateProfilePic = () => {
    setLoading(true);
    setTimeout(() => {
      setShowPopUp("comingSoon");
      setLoading(false);
    }, 2000);
  };

  if (initialLoading) return <ProfileSkeleton />;

  if (loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="w-12 h-12 border-8 border-green-500 border-t-transparent rounded-full animate-[spin_1s_linear_reverse_infinite]"></div>
        </div>
      </div>
    );

  if (!userData) return <p className="text-center text-red-500">User data not found.</p>;

  return (
    <div className="relative">
      {showPopUp && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {showPopUp === "profileUpdated" && "Profile updated successfully!"}
          {showPopUp === "comingSoon" && "Feature coming soon!"}
          {showPopUp === "error" && "Error occurred while updating profile!"}
        </div>
      )}

      <div className="animate-fade-in max-w-lg mx-auto border p-8 mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all">
        <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">Profile details</h2>

        {/* Avatar Card */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          <img
            src="profile.jpg"
            alt="User Avatar"
            className="border-4 border-gray-500 dark:border-gray-300 w-24 h-24 mx-auto rounded-full transform transition-transform duration-300 hover:scale-105"
          />
          <h2 className="text-xl font-semibold mt-3 text-gray-900 dark:text-white">
            {firstName || "John"} {lastName || "Doe"}
          </h2>
          <button
            onClick={handleUpdateProfilePic}
            className="mt-2 text-sm text-blue-500 hover:underline"
          >
            Update Profile Picture
          </button>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">
            {["personal", "contact", "address"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm md:text-base font-semibold py-2 px-3 md:px-6 rounded-full transition-all ${
                  activeTab === tab
                    ? "bg-blue-500 text-white border-2 border-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-green-300"
                }`}
              >
                {tab === "personal" ? "Personal Info" : tab === "contact" ? "Contact Info" : "Address"}
              </button>
            ))}
          </div>

          <div className="transition-all duration-300 ease-in-out">
            {activeTab === "personal" && (
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-4 animate-fade-in">
                <AnimatedInput label="First Name" value={firstName} editable={isEditable} onChange={setFirstName} />
                <AnimatedInput label="Last Name" value={lastName} editable={isEditable} onChange={setLastName} />
                <AnimatedInput label="Bio" value={bio} editable={isEditable} onChange={setBio} isTextArea />
              </div>
            )}
            {activeTab === "contact" && (
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-4 animate-fade-in">
                <AnimatedInput label="Email" value={email} editable={isEditable} onChange={setEmail} />
                <AnimatedInput label="Phone" value={phone} editable={isEditable} onChange={setPhone} />
              </div>
            )}
            {activeTab === "address" && (
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-4 animate-fade-in">
                <AnimatedInput label="City" value={city} editable={isEditable} onChange={setCity} />
                <AnimatedInput label="Country" value={country} editable={isEditable} onChange={setCountry} />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 text-center">
          <button
            onClick={isEditable ? handleSaveChanges : handleEdit}
            className={`px-6 py-2 rounded-lg transition-transform duration-200 ease-in-out ${
              isEditable
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105"
                : "bg-green-500 text-white hover:bg-green-600 hover:scale-105"
            }`}
          >
            {isEditable ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>
    </div>
  );
};
const AnimatedInput = ({ label, value, onChange, editable, isTextArea }) => (
  <div className="mb-4">
    <p className="text-green-600 dark:text-green-400 font-semibold">{label}</p>
    {editable ? (
      isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows="4"
          className="p-2 w-full rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white ring-1 ring-blue-200 focus:ring-2 focus:ring-blue-400 transition duration-200"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="p-2 w-full rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white ring-1 ring-blue-200 focus:ring-2 focus:ring-blue-400 transition duration-200"
        />
      )
    ) : (
      <p className="text-gray-700 dark:text-white">{value || "N/A"}</p>
    )}
  </div>
);

export default ProfilePage;
export { AnimatedInput };