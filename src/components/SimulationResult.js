import React from "react";
import { useOmnisContext } from "../context/OmnisContext"; // Import context to handle feedback
import { FiThumbsUp, FiThumbsDown } from "react-icons/fi";
import { useState } from "react"; // Make sure to import useState here



const ScenarioSimulationCard = ({ results, setResults }) => {
  const { addFeedback } = useOmnisContext(); // Access feedback function from context
  const [clickedButton, setClickedButton] = useState(null); // Track the clicked button
  const [clickedTimestamp, setClickedTimestamp] = useState(null); // Track timestamp of the click for fading


  if (!results || results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg border hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
          Scenario Output
        </h2>
        <p className="text-gray-500 text-center mt-4">No results to display.</p>
      </div>
    );
  }

  const handleReset = () => {
    if (setResults) setResults([]);
  };

 // Handle feedback click and color change
 const handleFeedback = (timestamp, feedback) => {
  console.log(`Feedback button clicked! Timestamp: ${timestamp}, Feedback: ${feedback}`);
  
  setClickedButton(feedback); // Change button color on click

  // Reset the button color after 2 seconds
  setTimeout(() => {
    setClickedButton(null); // Reset color
  }, 5000);

  addFeedback(timestamp, feedback); // Save thumbs up/down feedback
};


  return (
    <div className="bg-white shadow-lg hover:shadow-blue-500/50 dark:bg-gray-900 rounded-lg p-6 border dark:border text-gray-900 dark:text-white text-2xl col-span-2 w-full">
      <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">
        Scenario Output
      </h2>

      {/* 🔹 Scrollable Container for Outputs */}
      <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 p-2 mt-3">
        {results.filter(Boolean).map((result, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full shadow border border-gray-200 dark:border-gray-700 mb-3 group hover:scale-100 transition-transform duration-200"
          >
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-200">
              {result?.query || "Unknown Query"}
            </h4>
            {result?.error ? (
              <p className="text-red-500 text-sm">❌ {result.error}</p>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {formatResponse(result?.response)}
              </div>
            )}

             {/* 🔹 Thumbs Up/Down Buttons for Feedback */}
            <div className="flex justify-start space-x-4 mt-2">
              <button
                className={`${
                  clickedButton === "positive" ? "bg-green-600" : "bg-green-500"
                } hover:bg-green-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105`}
                onClick={() => handleFeedback(result?.timestamp, "positive")}
              >
                <FiThumbsUp className="text-xl" /> {/* FiThumbsUp icon */}
              </button>
              <button
                className={`${
                  clickedButton === "negative" ? "bg-red-600" : "bg-red-500"
                } hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-transform transform hover:scale-105`}
                onClick={() => handleFeedback(result?.timestamp, "negative")}
              >
                <FiThumbsDown className="text-xl" /> {/* FiThumbsDown icon */}
              </button>
            </div>

          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleReset}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-transform transform hover:scale-100 active:scale-95"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// Function to format response correctly
function formatResponse(response) {
  console.log("✅ Full API Response:", response); // ✅ Debugging

  if (!response || typeof response !== "object") {
    return (
      <p className="group-hover:scale-100 text-3xl transition-transform duration-200">
        ❌ Invalid response received.
      </p>
    );
  }

  return (
    <div>
      {/* ✅ AI Response Handling */}
      {response.candidates &&
        response.candidates.length > 0 &&
        response.candidates[0].content.parts.length > 0 && (
          <div className="group hover:scale-105 transition-transform duration-200">
            <p>🤖 <strong>AI Response:</strong></p>
            <p className="text-gray-700 dark:text-gray-300">
              {response.candidates[0].content.parts[0].text}
            </p>
          </div>
        )}

      {/* ✅ Weather Data Formatting */}
      {response.status === "success" &&
        response.data &&
        typeof response.data === "object" &&
        !Array.isArray(response.data) && (
          <div className="mb-3 group hover:scale-105 transition-transform duration-200">
            <p>🌍 <strong>Location:</strong> {response.data.location || "N/A"}</p>
            <p>🌡️ <strong>Temperature:</strong> {response.data.temperature || "N/A"}°C</p>
            <p>⛅ <strong>Condition:</strong> {response.data.description || "N/A"}</p>
            {response.data.icon ? (
              <img src={`https:${response.data.icon}`} alt="Weather Icon" className="w-10 h-10" />
            ) : (
              <p>⚠️ No Weather Icon Available</p>
            )}
          </div>
        )}

      {/* ✅ Weather Forecast Formatting - Fixed for 4-Day Forecast */}
      {response.status === "success" &&
        response.data?.forecast &&
        response.data.forecast.length > 0 && (
          <div className="mt-3">
            <p>📅 <strong>3-Day Forecast:</strong></p>
            {response.data.forecast.slice(0, 4).map((day, idx) => (
              <div
                key={idx}
                className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 group hover:scale-105 transition-transform duration-200"
              >
                <p>📆 <strong>Date:</strong> {day?.date || "N/A"}</p>
                <p>🌡️ <strong>Max Temp:</strong> {day?.day?.maxtemp_c || "N/A"}°C</p>
                <p>🌡️ <strong>Min Temp:</strong> {day?.day?.mintemp_c || "N/A"}°C</p>
                <p>⛅ <strong>Condition:</strong> {day?.day?.condition?.text || "N/A"}</p>
                {day?.day?.condition?.icon ? (
                  <img src={`https:${day.day.condition.icon}`} alt="Forecast Icon" className="w-10 h-10" />
                ) : (
                  <p>⚠️ No Weather Icon Available</p>
                )}
              </div>
            ))}
          </div>
        )}

      {/* ✅ Weather History Data Formatting */}
      {response.status === "success" &&
        response.history &&
        Array.isArray(response.history) &&
        response.history.length > 0 && (
          <div className="mt-3">
            <p>📜 <strong>5-Day Weather History:</strong></p>
            {response.history.slice(0, 5).map((day, idx) => (
              <div
                key={idx}
                className="mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 group hover:scale-105 transition-transform duration-200"
              >
                <p>📆 <strong>Date:</strong> {day?.date || "N/A"}</p>
                <p>🌡️ <strong>Max Temp:</strong> {day?.day?.maxtemp_c || "N/A"}°C</p>
                <p>🌡️ <strong>Min Temp:</strong> {day?.day?.mintemp_c || "N/A"}°C</p>
                <p>⛅ <strong>Condition:</strong> {day?.day?.condition?.text || "N/A"}</p>
                {day?.day?.condition?.icon ? (
                  <img src={`https:${day.day.condition.icon}`} alt="History Icon" className="w-10 h-10" />
                ) : (
                  <p>⚠️ No Weather Icon Available</p>
                )}
              </div>
            ))}
          </div>
        )}

      {/* ✅ Geocoding & Reverse Geocoding Handling */}
      {response.address && typeof response.address === "object" && "lat" in response.address && "lng" in response.address && (
        <div className="group hover:scale-105 transition-transform duration-200">
          <p>📍 <strong>Coordinates:</strong></p>
          <p>🌎 <strong>Latitude:</strong> {response.address.lat}</p>
          <p>🌍 <strong>Longitude:</strong> {response.address.lng}</p>
        </div>
      )}

      {response.address && typeof response.address === "string" && (
        <div className="group hover:scale-105 transition-transform duration-200">
          <p>🏠 <strong>Formatted Address:</strong> {response.address}</p>
        </div>
      )}

      {/* 🔹 Default Fallback Handling ✅ */}
      {(!response.candidates && !response.data && !response.address && !response.history) && (
        <p className="group hover:scale-105 transition-transform duration-200">❌ No structured data available.</p>
      )}
    </div>
  );
}

// ✅ Fix export issue
export default ScenarioSimulationCard;
  
  // In the code above, we have added a new function called  formatResponse  that helps us to format the API response correctly based on the type of data we receive. This function will handle the different types of responses we might receive from the API, such as weather data, geocoding data, and AI responses. 
  // We have also added a new button to provide feedback on the results displayed. When a user clicks the thumbs up or thumbs down button, we call the  handleFeedback  function to save the feedback along with the timestamp of the result. 
  // Finally, we have updated the component to display the formatted response and added a scrollbar to the output container to make it scrollable when the content overflows. 
  // Now, let’s test the updated component in the browser. 
  // Step 4: Test the Updated Component 
  // To test the updated component, run the development server by executing the following command in the terminal: 
  // npm start 
  // Once the server is running, open your web browser and navigate to  http://localhost:3000 . You should see the updated Scenario Simulation Card component with the ability to provide feedback on the results. 
  // Click the “Thumbs Up” or “Thumbs Down” buttons to provide feedback on the results. The feedback will be saved along with the timestamp of the result. 
  // Conclusion 
  // In this tutorial, we learned how to add a feedback feature to a React component using context. We created a new context to manage the feedback state and added functions to save feedback data. We then updated the component to display the feedback buttons and save the feedback data when the buttons are clicked. 
  // By following this tutorial, you should now have a better understanding of how to add feedback functionality to your React components using context. You can extend this feature by adding more feedback options or integrating it with an external service to analyze the feedback data. 
  // If you have any questions or feedback, please let us know in the comments. 
  // Share this: Twitter Twitter Reddit Reddit LinkedIn LinkedIn Facebook Facebook