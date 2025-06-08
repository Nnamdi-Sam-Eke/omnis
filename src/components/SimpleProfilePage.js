import React, { useState, useEffect } from 'react';
// Import Firebase storage, auth, and firestore modules
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Remove `storage`
import { useAuth } from "../AuthContext";
import { storage } from '../firebase';
import { getAuth } from 'firebase/auth';
import { db, auth } from '../firebase';  // adjust path if needed
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import imageCompression from 'browser-image-compression';


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
  const [image, setImage] = useState(null); // Declare the image state variable
  const [imageUrl, setImageUrl] = useState(''); // Store uploaded image URL
  const [progress, setProgress] = useState(0); // Track upload progress
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  
  

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [showPopUp, setShowPopUp] = useState(null);
  const { currentUser } = useAuth();
  const auth = getAuth();

  // Handle image file selection
  // Handle image file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        const options = {
            maxSizeMB: 0.3,  // reduce to ~300KB max
            maxWidthOrHeight: 800,
            useWebWorker: true
        };
        try {
            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(compressedFile);
        } catch (error) {
            console.error('Error compressing the image', error);
        }
    }
};


// Handle profile picture save to Firestore
const saveProfilePicture = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
      alert('No user is logged in.');
      return;
  }

  if (imageBase64) {
      try {
          const userRef = doc(db, 'users', user.uid);  // dynamically gets the user’s document
          await updateDoc(userRef, {
            profilePicture: imageBase64,
        });
        alert('Profile picture updated successfully!');
        
        // ✅ Update the main profile picture too
        setProfilePicture(imageBase64);
        
        // ✅ Clear preview and file input after saving
        setImageBase64(null);
        setImagePreview(null);
        

      } catch (error) {
          console.error('Error saving profile picture: ', error);
          alert('Error updating profile picture.');
      }
  } else {
      alert('Please select an image.');
  }
};
  

  // Update the upload function to use the new Firebase modular API
  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image to upload.");
      return;
    }
  
    if (!user) {
      alert("You need to be logged in to upload an image.");
      return;
    }
  
    const storageRef = ref(storage, `images/${user.uid}/${image.name}`);
    const uploadTask = uploadBytesResumable(storageRef, image);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Failed to upload image.");
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref());
        setImageUrl(downloadURL);
        alert("Image uploaded successfully!");
  
        // Optionally update Firestore with the new image URL
        await updateUserImage(downloadURL);
      }
    );
  };
  

  const updateUserImage = async (downloadURL) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        imageUrl: downloadURL, // Save image URL to Firestore
      });
    } catch (error) {
      console.error("Error updating user document:", error);
    }
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                if (data.profilePicture) {
                    setImagePreview(data.profilePicture);
                }
            } else {
                console.log('No such document!');
            }
        }
    };

    fetchProfilePicture();
}, []);

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
              setCity(userData.city || "");
              setCountry(userData.country || "");

              // 👉 Add this to handle profile picture
              setProfilePicture(userData.profilePicture || null);
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
    <div className='animate-fade-in max-w-lg mx-auto bg-white border p-8 bg-white dark:bg-gray-900 mb-20 mt-16 rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all'>
      <div className="animate-fade-in max-w-lg mx-auto bg-white border p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-blue-500/50 transition-all">
        <h2 className="text-2xl font-semibold text-green-500">Profile details</h2>

        {/* Avatar Card */}
        <div className="p-4">
          <div className="">
          <div className="bg-gray-100 border dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
          {profilePicture ? (
            <img
            src={profilePicture}
            alt="User Avatar"
            className="border-4 dark:text-white border-gray-500 dark:border-gray-300 w-24 h-24 mx-auto rounded-full transform transition-transform duration-300 hover:scale-105"
        />
    ) : (
        <div className="w-24 h-24 mx-auto rounded-full bg-gray-300 animate-pulse" />
    )}

    <h2 className="text-xl font-semibold mt-3 text-gray-900 dark:text-white">
        {firstName || "John"} {lastName || "Doe"}
    </h2>
    <button
        onClick={() => document.getElementById("file-input").click()}
        className="mt-2 text-sm text-blue-500 hover:underline"
    >
        Update Profile Picture
    </button>
</div>

            <input
                type="file"
                accept="image/*"
                id="file-input"
                onChange={handleImageChange}
                className="hidden"
            />
            {/* {imagePreview && (
                <div>
                    <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full mb-4"
                    />
                </div>
            )} */}
            {errorMessage && (
                <div className="text-red-500 text-sm mb-2">{errorMessage}</div>
            )}
            <button
                onClick={saveProfilePicture}
                className="bg-blue-600 text-white py-2 px-4 ml-8 mt-10 rounded-2xl hover:bg-blue-900 transition"
            >
                Save
            </button>
        </div>
      </div>
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