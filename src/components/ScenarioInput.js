import { useState, useEffect } from "react";
import { saveUserInteraction } from "../services/userBehaviourService";
import { useMemory } from "../MemoryContext"; // ✅ Import Memory Context
import { db } from "../firebase"; // Import Firestore database
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Import Firestore functions
import { useAuth } from "../AuthContext"; // ✅ Import Auth
import { query, orderBy, getDocs } from "firebase/firestore"; // Import Firestore query functions
import { ChevronRight, ChevronUp } from "lucide-react";

// Component to simulate multiple scenarios
// and store the results in memory
export default function ScenarioInput({ onSimulate }) {
  const [scenarios, setScenarios] = useState([""]);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { memory, saveToFirestore } = useMemory(); // ✅ AI Memory Hook
  const [chatHistory, setChatHistory] = useState([]); // ✅ Store previous interactions
  const { user } = useAuth(); // ✅ Get current user

  useEffect(() => {
    if (user) {
      loadFirestoreMemory(); // ✅ Load memory from Firestore when user logs in
    }
  }, [user]);

  const handleScenarioSubmit = async (query, response) => {
    try {
      const historyEntry = {
        query,
        response,
        timestamp: serverTimestamp(),
      };

      // ✅ Save to Firestore
      await addDoc(collection(db, "chatHistory"), historyEntry);
      console.log("History saved!");
    } catch (error) {
      console.error("Error saving history:", error);
    }
  };

  const loadFirestoreMemory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "users", user.uid, "memory"),
        orderBy("timestamp", "desc") // ✅ Load latest memories first
      );
      const querySnapshot = await getDocs(q);
      const loadedMemory = querySnapshot.docs.map((doc) => doc.data());
      console.log("✅ Firestore Memory Loaded:", loadedMemory);
    } catch (error) {
      console.error("❌ Error loading Firestore memory:", error);
    }
  };

  const getEndpointAndLocation = (query) => {
    let endpoint = "";
    let location = {};

    if (/weather history/i.test(query)) {
      endpoint = "/api/weather-history";
      location = { location: query.replace(/.*(?:weather history for|weather history in|for)\s+/i, "").trim() };
    } else if (/weather alerts|weather warning|storm alert|severe weather/i.test(query)) {
      endpoint = "/api/weather-alerts";
      location = { location: query.replace(/.*(?:weather alerts for|weather alerts in|for)\s+/i, "").trim() };
    } else if (/weather/i.test(query)) {
      endpoint = "/api/weather";
      location = { location: query.replace(/.*(?:weather in)\s+/i, "").trim() };
    } else if (/forecast/i.test(query)) {
      endpoint = "/api/forecast";
      location = { location: query.replace(/.*(?:forecast in| weather forecast for)\s+/i, "").trim() };
    } else if (/geocode/i.test(query)) {
      endpoint = "/api/geocode";
      location = { location: query.replace(/.*(?:geocode)\s+/i, "").trim() };
    } else if (/\d+\.\d+\s*,\s*\d+\.\d+/.test(query)) {
      endpoint = "/api/reverse_geocode";
      const [latitude, longitude] = query.split(",").map(coord => coord.trim());
      location = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
    } else {
      endpoint = "/api/gemini";
      location = { query: query.trim() };
    }

    // frontend/app.js
    // Function to send user input and get decision
    function evaluateDecision(risk, probability, impact) {
      fetch('/api/evaluate_decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          risk: risk,
          probability: probability,
          impact: impact
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.total_score && data.decision) {
          console.log(`Total Score: ${data.total_score}`);
          console.log(`Decision: ${data.decision}`);
        } else {
          console.error("Error in response:", data.error);
        }
      })
      .catch(error => console.error("Error:", error));
    }

    // Example usage: call with values provided by the user (e.g., from input fields)
    evaluateDecision(7, 5, 8);  // Replace with actual user inputs

    return { endpoint, location };
  };

  const handleInputChange = (index, value) => {
    const updatedScenarios = [...scenarios];
    updatedScenarios[index] = value;
    setScenarios(updatedScenarios);
  };

  const handleAddScenario = () => {
    setScenarios([...scenarios, ""]);
  };

  const handleRemoveScenario = (index) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((_, i) => i !== index));
    }
  };

  const handleSimulate = async () => {
    const filteredScenarios = scenarios.filter((scenario) => scenario.trim() !== "");
    if (!filteredScenarios.length) return;
  
    setLoading(true);
    console.log("📊 Simulating scenario:", filteredScenarios);
  
    await saveUserInteraction("test_user_123", "simulate_scenario", { scenarios: filteredScenarios });
  
    const requests = filteredScenarios.map(async (query) => {
      const { endpoint, location } = getEndpointAndLocation(query);
      if (!endpoint || Object.keys(location).length === 0) return null;
  
      const previousContext = memory.slice(-3).map((m) => m.response).join("\n");
  
      try {
        console.log(`📤 Sending request to: ${endpoint} with location:`, location);
  
        const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...location, context: previousContext }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log(`✅ Response from ${endpoint}:`, data);
  
        // 🔥 Save to AI memory context
        saveToFirestore(query, data);
  
        // ✅ Save to chatHistory Firestore collection
        await addDoc(collection(db, "chatHistory"), {
          scenario: query,
          outcome: data,
          timestamp: new Date(),
        });
  
        // ✅ Update local UI state
        setChatHistory((prev) => [...prev, { query, response: data }]);
  
        return { query, response: data };
      } catch (error) {
        console.error(`❌ Error fetching from ${endpoint}:`, error);
        return { query, error: error.message };
      }
    });
  
    const results = await Promise.all(requests.filter(Boolean));
    console.log("🔍 Final results:", results);
    setResults(results);
    setLoading(false);
  
    if (onSimulate) {
      onSimulate(results);
    }
  };
  

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black transition bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-16 h-16 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-12 h-12 border-8 border-green-500 border-t-transparent rounded-full animate-[spin_1s_linear_reverse_infinite]"></div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-blue-500/50 rounded-lg p-6 border text-gray-900 dark:text-white">
        <div className="flex justify-between items-center cursor-pointer p-3 bg-white rounded-md dark:bg-gray-800" onClick={() => setIsOpen(!isOpen)}>
          <h2 className="text-xl font-semibold text-blue-500 dark:text-blue-300">Scenario Input</h2>
          <span className="text-blue-500 dark:text-blue-300 font-medium">{isOpen ? <ChevronUp /> : <ChevronRight />}</span>
        </div>

        {isOpen && (
          <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 overflow-hidden transition-all duration-300 max-h-[300px] opacity-100 mt-4">
            {scenarios.map((scenario, index) => (
              <div key={index} className="mb-4 p-4 rounded-lg shadow-sm border border-gray-300">
                <input
                  type="text"
                  placeholder={`Enter scenario ${index + 1}...`}
                  value={scenario}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleRemoveScenario(index)}
                  disabled={scenarios.length === 1}
                  className="mt-2 px-3 py-2 bg-gray-500 text-white rounded-full hover:scale-105"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1 mt-4">
          <button onClick={handleAddScenario} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:scale-105">Add Scenario</button>
          <button onClick={handleSimulate} disabled={scenarios.every((s) => s.trim() === "")} className="px-4 py-2 bg-green-600 text-white rounded-full hover:scale-105">
            {loading ? "Simulating..." : "Simulate"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 border rounded-lg">
          <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-300">Simulation Results</h3>
          {results.map((result, index) => (
            <div key={index} className="mb-4">
              <h4 className="font-semibold text-blue-500 dark:text-blue-300">{result.query}</h4>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md text-sm">{JSON.stringify(result.response, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
