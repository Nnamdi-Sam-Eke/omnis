import React, { useState } from "react";
import { ChevronRight, ChevronUp } from "lucide-react";

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState("documentation");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300 mb-4">Docs, Guides, maybe FAQs?</h2>

      {/* Tabs */}
      <div className="mt-6">
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">
          {["documentation", "tutorials", "tools", "FAQs", "downloads"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm md:text-base font-semibold py-2 px-3 md:px-6 rounded-full transition-all ${
                activeTab === tab
                  ? "bg-blue-500 text-white border-2 border-blue-700"
                  : "bg-gray-200 text-gray-700 hover:bg-green-300"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="p-8"></div>

        {/* Tab Panels */}
        <div className="transition-all duration-300 ease-in-out mt-6">
          {activeTab === "documentation" && (
            <div className="mx-auto md:w-10/12 lg:w-full">
              {/* Documentation */}
              <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all">
                <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Documentation</h3>
                <ul className="mt-8 space-y-2">
                  <li><a href="#" className="text-blue-500 hover:underline">Getting Started</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">API Reference</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">User Manual</a></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "tutorials" && (
            <div className="mx-auto md:w-10/12 lg:w-full">
              {/* Tutorials */}
              <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all">
                <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Tutorials</h3>
                <ul className="mt-8 space-y-2">
                  <li><a href="#" className="text-blue-500 hover:underline">Beginner's Guide</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Advanced Techniques</a></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="mx-auto md:w-10/12 lg:w-full">
              {/* Tools */}
              <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all">
                <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Tools</h3>
                <ul className="mt-8 space-y-2">
                  <li><a href="#" className="text-blue-500 hover:underline">Resource Builder</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Analytics Tool</a></li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "FAQs" && (
            <div className="mx-auto md:w-10/12 lg:w-full space-y-4">
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
                >
                  <button
                    className="w-full text-left flex justify-between items-center text-base md:text-lg font-medium text-blue-600 dark:text-blue-400"
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                    }
                  >
                    {faq.question}
                    <span className="ml-2 text-xl">
                      {openFaqIndex === idx ? <ChevronUp /> : <ChevronRight />}
                    </span>
                  </button>
                  {openFaqIndex === idx && (
                    <p className="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === "downloads" && (
            <div className="mx-auto md:w-10/12 lg:w-full">
              {/* Downloads */}
              <div className="bg-white dark:bg-gray-800 p-4 border rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all">
                <h3 className="text-lg font-semibold text-green-500 dark:text-green-500">Downloads</h3>
                <ul className="mt-8 space-y-2">
                  <li><a href="#" className="text-blue-500 hover:underline">Download Templates</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Download Software</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Download Whitepaper</a></li>
                  <li><a href="#" className="text-blue-500 hover:underline">Download User Guide</a></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
