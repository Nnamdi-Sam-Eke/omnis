import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";  // ✅ Import BrowserRouter
import { AuthProvider } from "./AuthContext";  // ✅ Ensure AuthProvider is imported
import Dashboard from "./Dashboard";  // Import your Dashboard component
import Home from "./Home";  // Import your HomePage component

function App() {
  return (
        <div className="min-h-full w-full bg-white dark:bg-gray-900">
          <main className="min-h-full w-full bg-white dark:bg-gray-900">
            <AuthProvider>  {/* ✅ Wrap the entire app once */}
              <Dashboard />
            </AuthProvider>
          </main>
        </div>
  );
  <Router>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />  {/* Dashboard route */}
      <Route path="/Home" element={<Home />} />  {/* Home route */}
    </Routes>
  </Router>
}

export default App;
