import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState("documentation");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleTabKeyDown = (e, tab) => {
    if (e.key === "Enter" || e.key === " ") {
      setActiveTab(tab);
    }
    if (e.key === "ArrowRight") {
      const tabs = ["documentation", "tutorials", "tools", "FAQs", "downloads"];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    }
    if (e.key === "ArrowLeft") {
      const tabs = ["documentation", "tutorials", "tools", "FAQs", "downloads"];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex]);
    }
  };

  // Tooltip text for each tab
  const tabTooltips = {
    documentation: "View guides, API docs, and manuals",
    tutorials: "Learn how to use Omnis step-by-step",
    tools: "Explore helpful resources and utilities",
    FAQs: "Find answers to common questions",
    downloads: "Access templates, whitepapers, and software",
  };

   const [loading, setLoading] = React.useState(true);
  
  
  
    // Timer to switch off loading after 4 seconds (on mount)
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 4000);
      return () => clearTimeout(timer);
    }, []);
  
    // If subscriptions is undefined, show loading state
   if (loading) {
      return (
        <div className="animate-pulse mx-auto w-10/12  space-y-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      );
    }
  

  return (
    <div className="p-6 bg-gray-100 min-h-screen dark:bg-gray-900">
      <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mt-10 mb-4">
        Docs, Guides, maybe FAQs?
      </h2>

      {/* Tabs */}
      <div role="tablist" aria-label="Resource Sections" className="mt-6">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">
          {['documentation', 'tutorials', 'tools', 'FAQs', 'downloads'].map((tab, index) => (
            <button
              key={tab}
              role="tab"
              id={`tab-${tab}`}
              title={tabTooltips[tab]} // <---- Tooltip added here
              aria-selected={activeTab === tab}
              aria-controls={`panel-${tab}`}
              tabIndex={index === 0 ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(e) => handleTabKeyDown(e, tab)}
              className={`text-sm md:text-base font-semibold py-2 px-3 md:px-6 rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white border-2 border-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-green-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* (rest of your code remains the same) */}

        <div className="p-8"></div>

        {/* Tab Panels */}
        <div className="transition-all duration-300 ease-in-out mt-6">
          {activeTab === 'documentation' && (
            <Suspense fallback={<div>Loading...</div>}>
              <div role="tabpanel" id="panel-documentation" aria-labelledby="tab-documentation" className="mx-auto md:w-10/12 lg:w-full">
                {/* Documentation */}
                <div 
                  className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all"
                  title="Browse getting started guides, API references, and manuals."
                >
                  <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Documentation</h3>
                  <ul className="mt-8 space-y-2">
                    <li><a href="#" className="text-blue-500 hover:underline" title="Start here to learn the basics">Getting Started</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="Explore detailed API references">API Reference</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="User manuals for better understanding">User Manual</a></li>
                  </ul>
                </div>
              </div>
            </Suspense>
          )}

          {activeTab === 'tutorials' && (
            <Suspense fallback={<div>Loading...</div>}>
              <div role="tabpanel" id="panel-tutorials" aria-labelledby="tab-tutorials" className="mx-auto md:w-10/12 lg:w-full">
                {/* Tutorials */}
                <div 
                  className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all"
                  title="Learn with step-by-step tutorials."
                >
                  <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Tutorials</h3>
                  <ul className="mt-8 space-y-2">
                    <li><a href="#" className="text-blue-500 hover:underline" title="Beginner friendly tutorials">Beginner's Guide</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="Advanced topics and best practices">Advanced Techniques</a></li>
                  </ul>
                </div>
              </div>
            </Suspense>
          )}

          {activeTab === 'tools' && (
            <Suspense fallback={<div>Loading...</div>}>
              <div role="tabpanel" id="panel-tools" aria-labelledby="tab-tools" className="mx-auto md:w-10/12 lg:w-full">
                {/* Tools */}
                <div 
                  className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all"
                  title="Explore useful tools and utilities."
                >
                  <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Tools</h3>
                  <ul className="mt-8 space-y-2">
                    <li><a href="#" className="text-blue-500 hover:underline" title="Build resources with ease">Resource Builder</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="Analyze data and insights">Analytics Tool</a></li>
                  </ul>
                </div>
              </div>
            </Suspense>
          )}

          {activeTab === 'FAQs' && (
            <Suspense fallback={<div>Loading...</div>}>
              <div role="tabpanel" id="panel-FAQs" aria-labelledby="tab-FAQs" className="mx-auto md:w-10/12 lg:w-full space-y-4">
                <h3 className="text-xl font-semibold text-green-500 dark:text-green-500">Frequently Asked Questions</h3>

                {[
                  {
                    question: "What is Omnis and what does it do?",
                    answer:
                      "Omnis is an AI-powered platform that helps individuals and businesses make better, data-informed decisions through scenario analysis, multi-path scenario evaluation, predictive modeling, and personalized insights."
                  },
                  {
                    question: "Who is Omnis for?",
                    answer:
                      "Omnis is designed for decision-makers across industries—founders, teams, professionals, and anyone seeking to turn complexity into clarity."
                  },
                  {
                    question: "Is Omnis free to use?",
                    answer:
                      "Omnis offers a free tier with core features, and additional premium features will be available under paid plans."
                  },
                  {
                    question: "How does Omnis learn from me?",
                    answer:
                      "Omnis learns from your interactions over time—like your inputs, feedback, and choices—to deliver more relevant, context-aware suggestions."
                  },
                  {
                    question: "Is my data safe with Omnis?",
                    answer:
                      "Yes. We prioritize your data privacy and security using best-in-class encryption and user-controlled data permissions."
                  },
                  {
                    question: "Can I integrate Omnis with other tools?",
                    answer:
                      "Future versions of Omnis will support integrations with popular productivity, analytics, and collaboration tools."
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-blue-500/30 transition-all"
                    title="Click to expand the answer"
                  >
                    <button
                      role="button"
                      tabIndex={0}
                      aria-expanded={openFaqIndex === idx}
                      aria-controls={`faq-${idx}`}
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full text-left flex justify-between items-center text-base md:text-lg font-medium text-blue-600 dark-text-blue-400"
                    >
                      {faq.question}
                      <span className="ml-2 text-xl">
                        {openFaqIndex === idx ? <ChevronUp /> : <ChevronRight />}
                      </span>
                    </button>
                    {openFaqIndex === idx && (
                      <p id={`faq-${idx}`} className="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </Suspense>
          )}

          {activeTab === 'downloads' && (
            <Suspense fallback={<div>Loading...</div>}>
              <div role="tabpanel" id="panel-downloads" aria-labelledby="tab-downloads" className="mx-auto md:w-10/12 lg:w-full">
                {/* Downloads */}
                <div 
                  className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all"
                  title="Download important resources and files."
                >
                  <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Downloads</h3>
                  <ul className="mt-8 space-y-2">
                    <li><a href="#" className="text-blue-500 hover:underline" title="Download templates for your work">Download Templates</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="Get software tools and packages">Download Software</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="Read our whitepaper document">Download Whitepaper</a></li>
                    <li><a href="#" className="text-blue-500 hover:underline" title="Download the user guide for reference">Download User Guide</a></li>
                  </ul>
                </div>
              </div>
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
