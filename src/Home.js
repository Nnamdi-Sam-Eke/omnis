import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Tooltip from "./components/Tooltip";

function Home() {
  const navigate = useNavigate(); // React Router navigation
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");

  // 🔹 Use Case Data
  const useCases = [
    { title: "Business Analysts", desc: "Leverage AI to simulate different business strategies and optimize outcomes." },
    { title: "Students & Researchers", desc: "Test hypotheses and analyze scenarios in a controlled AI environment." },
    { title: "Investors & Traders", desc: "Predict market trends and simulate different trading strategies for better decisions." },
    { title: "Product Designers", desc: "Visualize user interactions and optimize product features before launching." },
  ];

  // 🔹 Steps Data
  const steps = [
    { title: "Input Your Scenario", desc: "Describe your situation and let the AI understand the context." },
    { title: "Run Simulations", desc: "Our AI processes multiple scenarios to generate insightful predictions." },
    { title: "Get Insights", desc: "Receive actionable insights and make informed decisions instantly." }
  ];

  // Toggle Dark Mode
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle("dark", !isDarkMode);
  };

  // 🔹 Hero Section Component
  const HeroSection = () => (
    <div className="flex flex-col lg:flex-row items-center justify-between p-6 sm:p-12 md:p-16 lg:p-20 min-h-screen dark:bg-black">
      {/* Text Content */}
      <div className="lg:w-1/2 space-y-6">
        <h2 className=" transition text-4xl dark:text-blue-500 sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 max-w-2xl">
          Revolutionizing Scenario Simulations with Digital Twin Intelligence.
        </h2>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-2xl mb-6 p-4 text-gray-700 dark:text-gray-200">
          Experience the power of AI-driven simulations to make informed decisions and explore endless possibilities.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 sm:p-8">
  <Tooltip text="Join our Discord community for live support!">
    <a
      href="#"
      className="w-full sm:w-auto mb-4 sm:mb-0 hover:shadow-blue-500/50 transition px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-2xl shadow-lg hover:bg-blue-700"
    >
      Join on Discord
    </a>
  </Tooltip>
  <p className="mt-14"></p>
  <Tooltip text="Follow us on X for updates!">
    <a
      href="#"
      className="w-full sm:mt-20 sm:w-auto hover:shadow-blue-500/50 transition px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-xl font-semibold bg-white text-blue-600 border-2 border-blue-600 rounded-2xl hover:shadow-lg"
    >
      Join on X
    </a>
  </Tooltip>
</div>


      </div>

      {/* Image */}
      {/* <div className="lg:w-1/2 mt-8 lg:mt-0">
        <img src="/assets/images/motif.jpg" alt="Motif" />
      </div> */}
    </div>
  );

  // 🔹 Omnis Section with Animated Spiral Circles
  const OmnisSection = () => (
    <section className="py-32 bg-black text-white flex flex-col rounded-t-3xl md:flex-row items-center justify-between px-6 sm:px-16 dark:bg-white dark:text-black">
      <div className="max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-light mb-6 text-gray-200 dark:text-gray-900">
          What is <br />
          <span className="p-2 sm:p-4 font-bold text-4xl sm:text-5xl text-blue-400">
            <u>Omnis?</u>
          </span>
        </h2>
        <p className="text-xl sm:text-2xl text-gray-200 dark:text-gray-900 font-semibold">
          Omnis is our AI-powered simulation tool designed to help users explore multiple possible futures. Whether you're a business strategist, a student, or an investor, Omnis provides dynamic scenario analysis to optimize decision-making.
        </p>
      </div>

      <div className="px-6 mt-4 relative w-[300px] sm:w-[400px] lg:w-[500px] h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-r from-blue-600 to-green-500 rounded-full animated-circle"
            style={{
              top: `${50 + 40 * Math.sin((i / 12) * 2 * Math.PI)}%`,
              left: `${50 + 40 * Math.cos((i / 12) * 2 * Math.PI)}%`,
              animation: `spiralMove 4s ease-in-out ${i * 0.2}s infinite`
            }}
          />
        ))}
      </div>

      <style jsx="true">{`
        @keyframes spiralMove {
          0% { transform: translateY(50px) scale(0.5); opacity: 0; }
          50% { transform: translateY(-10px) scale(1); opacity: 1; }
          100% { transform: translateY(-50px) scale(0.5); opacity: 0; }
        }
        .animated-circle {
          animation: spiralMove 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );

  // 🔹 Steps Section (pauses on hover)
  // This section will auto-play through the steps, pausing on hover.
  // It uses a combination of useState and useEffect to manage the current step and the auto-play interval.

  // ——— StepsSection.js ———
  const StepsSection = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const intervalRef = useRef(null);
  
    const AUTO_PLAY_INTERVAL = 3000; // 3s between steps (was 2s)
  
    const startAuto = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentStep(s => (s + 1) % steps.length);
      }, AUTO_PLAY_INTERVAL);
    };
    const stopAuto = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  
    useEffect(() => {
      startAuto();
      return () => stopAuto();
    }, []);
  
    return (
      <section
        className="py-32 bg-white text-center dark:bg-black"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text:black dark:text-white">How It Works</h2>
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
          <div className="relative w-full h-48">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`absolute top-0 left-0 right-0 transition-opacity duration-1000 ${
                  i === currentStep ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
              >
                <div className="py-8 px-6 h-48 bg-gray-900 rounded-3xl shadow-lg transform transition duration-500 hover:scale-105 hover:shadow-blue-500/50">
                  <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-green-400">{step.title}</h3>
                  <p className="text-white">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 flex space-x-2">
            {steps.map((_, i) => (
              <span
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`cursor-pointer w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'bg-blue-600 w-4 h-4' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };
  
  // ——— UseCasesSection.js ———
  const UseCasesSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);
    const touchStartX = useRef(0);
  
    const AUTO_PLAY_INTERVAL = 5000; // 5s between slides (was 4s)
  
    const startAuto = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex(i => (i + 1) % useCases.length);
      }, AUTO_PLAY_INTERVAL);
    };
    const stopAuto = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  
    useEffect(() => {
      startAuto();
      return () => stopAuto();
    }, []);
  
    const handleTouchStart = e => (touchStartX.current = e.touches[0].clientX);
    const handleTouchEnd = e => {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (delta > 50) setCurrentIndex(i => (i - 1 + useCases.length) % useCases.length);
      else if (delta < -50) setCurrentIndex(i => (i + 1) % useCases.length);
    };
  
    return (
      <section
        className="py-32 p-12 bg-gray-900 text-center text-white dark:bg-black"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-white">Who Can Benefit?</h2>
        <div className="relative w-full max-w-2xl mx-auto h-64 overflow-hidden">
          {useCases.map((uc, idx) => (
            <div
              key={idx}
              className={`absolute w-full p-8 rounded-3xl shadow-lg mb-12 bg-gray-800 transition-all duration-1000 transform ${
                idx === currentIndex
                  ? 'translate-x-0 opacity-100'
                  : idx < currentIndex
                  ? '-translate-x-full opacity-0'
                  : 'translate-x-full opacity-0'
              }`}
            >
              <h3 className="text-2xl sm:text-3xl font-semibold text-green-400">{uc.title}</h3>
              <p className="text-white mt-4 text-lg sm:text-xl">{uc.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  // 🔹 Interactive Demo / Video Section
  const InteractiveDemoSection = () => (
    <section className="py-32 bg-gray-900 text-white text-center">
      <h2 className="text-5xl font-bold mb-12 text-blue-500">Experience It Yourself</h2>
      <div className="flex flex-col items-center space-y-8">
        <Tooltip text="Demo coming soon!">
          <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition">
            Try a Mini Demo (Coming Soon)
          </button>
        </Tooltip>
        <div className="w-full max-w-3xl h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          <span className="text-white">[ Placeholder for Explainer Video ]</span>
        </div>
      </div>
    </section>
  );

  // 🔹 Testimonial Section (dark mode bg)
  const TestimonialSection = () => (
    <section className="py-32 bg-gray-100 text-center dark:bg-black">
      <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-blue-500">What Our Users Are Saying</h2>
      <div className="flex flex-wrap justify-center">
        {[
          { quote: "Omnis has transformed the way I approach decision-making.", name: "John Doe", role: "Business Analyst" },
          { quote: "I used to rely on gut feeling, but now I have the power of data-driven insights with Omnis.", name: "Jane Smith", role: "Product Designer" }
        ].map((t, i) => (
          <div
            key={i}
            className="max-w-md mx-4 p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg mb-12"
          >
            <p className="text-gray-700 dark:text-gray-200 mb-4">"{t.quote}"</p>
            <h3 className="font-semibold text-lg text-green-400">{t.name}</h3>
            <p className="text-blue-400">{t.role}</p>
          </div>
        ))}
      </div>
    </section>
  );

  // 🔹 Call to Action & Footer
  const CallToActionSection = () => (
    <section className="py-32 bg-gray-100 text-center dark:bg-black">
      <h2 className="text-5xl font-bold mb-12 text-blue-600 dark:text-white">Join the Future</h2>
      <p className="text-gray-900 max-w-2xl mx-auto mb-8 dark:text-white">
        Be part of the next big thing. Sign up for early access and stay updated.
      </p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
  <Tooltip text="Sign up for our beta program!">
    <a
      href="#"
      className="w-full sm:w-auto mb-4 sm:mb-0 hover:shadow-blue-500/50 transition px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-500"
    >
      Sign Up for Beta
    </a>
  </Tooltip>
  <Tooltip text="Join our community for support and updates!">
    <a
      href="#"
      className="w-full sm:w-auto hover:shadow-blue-500/50 transition px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold bg-green-500 text-white rounded-2xl shadow-lg hover:bg-green-400"
    >
      Join the Community
    </a>
  </Tooltip>
</div>
      

    </section>
  );

  return (
    <>
      <HeroSection />
      <OmnisSection />
      <StepsSection />
      <UseCasesSection />
      <InteractiveDemoSection />
      <TestimonialSection />
      <CallToActionSection />
    </>
  );
}

export default Home;
