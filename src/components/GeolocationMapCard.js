import React, { useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";

const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const googleMapsLibraries = ["places"];

const GeolocationMapCard = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const mapContainerStyle = {
    width: "100%",
    height: "250px",
    borderRadius: "10px",
    overflow: "hidden",
  };

  const defaultCenter = { lat: 6.5765376, lng: 3.3521664 };

  // Load Google Maps API once
  const { isLoaded } = useLoadScript({
    googleMapsApiKey,
    libraries: googleMapsLibraries,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          console.error("❌ Error fetching geolocation: ", error);
        }
      );
    } else {
      console.error("❌ Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (!isCollapsed) {
      setMapKey((prevKey) => prevKey + 1);
    }
  }, [isCollapsed]);

  return (
    <div className="bg-white shadow-lg hover:shadow-blue-500/50 transition dark:bg-gray-800 shadow-lg rounded-lg p-4 border text-blue-500 dark:text-blue-300 mb-2 transition-all duration-300 max-w-full">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-400 w-full text-left font-semibold transition-all duration-200"
      >
        {isCollapsed ? "Show Map ▼" : "Hide Map ▲"}
      </button>

      {!isCollapsed && isLoaded && (
        <div key={mapKey} className="w-full transition-all duration-300 ease-in-out mt-2">
          <GoogleMap mapContainerStyle={mapContainerStyle} center={userLocation || defaultCenter} zoom={userLocation ? 18 : 10}>
            {userLocation && (
              <>
                <Marker position={userLocation} onClick={() => setInfoWindowOpen(true)} />
              </>
            )}
            {userLocation && infoWindowOpen && (
              <InfoWindow position={userLocation} onCloseClick={() => setInfoWindowOpen(false)}>
                <div className="text-gray-800 dark:text-white text-sm font-semibold">
                  📍 Your Current Location
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default GeolocationMapCard;
