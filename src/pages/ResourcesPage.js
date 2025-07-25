import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, ChevronUp, BookOpen, Video, Wrench, HelpCircle, Download, ArrowRight, Sparkles, Zap } from "lucide-react";

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

  const tabIcons = {
    documentation: BookOpen,
    tutorials: Video,
    tools: Wrench,
    FAQs: HelpCircle,
    downloads: Download,
  };

  const [loading, setLoading] = React.useState(true);
  
  // Timer to switch off loading after 3 seconds (reduced for better UX)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  // If loading, show modern loading state with purple theme
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-4">
        <div className="animate-pulse mx-auto w-full max-w-6xl space-y-8 mt-20">
          <div className="h-20 bg-gradient-to-r from-purple-200 via-indigo-200 to-blue-200 dark:from-purple-800/30 dark:via-indigo-800/30 dark:to-blue-800/30 rounded-3xl shadow-sm" />
          <div className="h-16 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-800/30 dark:via-purple-800/30 dark:to-pink-800/30 rounded-2xl shadow-sm" />
          <div className="h-96 bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-800/20 dark:via-indigo-800/20 dark:to-blue-800/20 rounded-3xl shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="text-center mb-12 mt-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-400 dark:via-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                Resource Center
              </h2>
              <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive documentation, tutorials, and tools to help you succeed with{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">Omnis</span>
            </p>
          </div>
        </div>

        {/* Enhanced Tabs with purple theme */}
        <div role="tablist" aria-label="Resource Sections" className="mb-8">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {['documentation', 'tutorials', 'tools', 'FAQs', 'downloads'].map((tab, index) => {
              const Icon = tabIcons[tab];
              return (
                <button
                  key={tab}
                  role="tab"
                  id={`tab-${tab}`}
                  title={tabTooltips[tab]}
                  aria-selected={activeTab === tab}
                  aria-controls={`panel-${tab}`}
                  tabIndex={index === 0 ? 0 : -1}
                  onClick={() => setActiveTab(tab)}
                  onKeyDown={(e) => handleTabKeyDown(e, tab)}
                  className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 shadow-sm border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm md:text-base">
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Panels with enhanced styling */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === 'documentation' && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
              <div role="tabpanel" id="panel-documentation" aria-labelledby="tab-documentation" className="mx-auto md:w-10/12 lg:w-full">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-xl">
                      <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Documentation</h3>
                      <p className="text-gray-600 dark:text-gray-400">Complete guides and references</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "Getting Started", desc: "Start here to learn the basics", badge: "Popular" },
                      { title: "API Reference", desc: "Explore detailed API references", badge: "Technical" },
                      { title: "User Manual", desc: "User manuals for better understanding", badge: "Essential" }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 border border-purple-200/30 dark:border-purple-700/30"
                        title={item.desc}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-900 dark:text-white font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {item.title}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                            {item.badge}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Suspense>
          )}

          {activeTab === 'tutorials' && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
              <div role="tabpanel" id="panel-tutorials" aria-labelledby="tab-tutorials" className="mx-auto md:w-10/12 lg:w-full">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl">
                      <Video className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">Tutorials</h3>
                      <p className="text-gray-600 dark:text-gray-400">Step-by-step learning paths</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "Beginner's Guide", desc: "Beginner friendly tutorials", duration: "30 min" },
                      { title: "Advanced Techniques", desc: "Advanced topics and best practices", duration: "45 min" },
                      { title: "Video Walkthroughs", desc: "Interactive video tutorials", duration: "60 min" }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-xl hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/20 dark:hover:to-blue-900/20 transition-all duration-200 border border-indigo-200/30 dark:border-indigo-700/30"
                        title={item.desc}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-900 dark:text-white font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {item.title}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                            {item.duration}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Suspense>
          )}

          {activeTab === 'tools' && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
              <div role="tabpanel" id="panel-tools" aria-labelledby="tab-tools" className="mx-auto md:w-10/12 lg:w-full">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl">
                      <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">Tools</h3>
                      <p className="text-gray-600 dark:text-gray-400">Helpful utilities and resources</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "Resource Builder", desc: "Build resources with ease", status: "New" },
                      { title: "Analytics Tool", desc: "Analyze data and insights", status: "Beta" },
                      { title: "AI Assistant", desc: "Get AI-powered help", status: "Featured" }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 border border-purple-200/30 dark:border-purple-700/30"
                        title={item.desc}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-900 dark:text-white font-medium group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {item.title}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full">
                            {item.status}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Suspense>
          )}

          {activeTab === 'FAQs' && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
              <div role="tabpanel" id="panel-FAQs" aria-labelledby="tab-FAQs" className="mx-auto md:w-10/12 lg:w-full space-y-4">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Find answers to common questions</p>
                </div>

                {[
                  {
                    question: "What is Omnis and what does it do?",
                    answer: "Omnis is an AI-powered platform that helps individuals and businesses make better, data-informed decisions through scenario analysis, multi-path scenario evaluation, predictive modeling, and personalized insights."
                  },
                  {
                    question: "Who is Omnis for?",
                    answer: "Omnis is designed for decision-makers across industries—founders, teams, professionals, and anyone seeking to turn complexity into clarity."
                  },
                  {
                    question: "Is Omnis free to use?",
                    answer: "Omnis offers a free tier with core features, and additional premium features will be available under paid plans."
                  },
                  {
                    question: "How does Omnis learn from me?",
                    answer: "Omnis learns from your interactions over time—like your inputs, feedback, and choices—to deliver more relevant, context-aware suggestions."
                  },
                  {
                    question: "Is my data safe with Omnis?",
                    answer: "Yes. We prioritize your data privacy and security using best-in-class encryption and user-controlled data permissions."
                  },
                  {
                    question: "Can I integrate Omnis with other tools?",
                    answer: "Future versions of Omnis will support integrations with popular productivity, analytics, and collaboration tools."
                  }
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-purple-200/50 dark:border-purple-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    title="Click to expand the answer"
                  >
                    <button
                      role="button"
                      tabIndex={0}
                      aria-expanded={openFaqIndex === idx}
                      aria-controls={`faq-${idx}`}
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full text-left flex justify-between items-center p-6 text-base md:text-lg font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <div className={`transform transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-0' : ''}`}>
                        {openFaqIndex === idx ? (
                          <ChevronUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openFaqIndex === idx && (
                      <div id={`faq-${idx}`} className="px-6 pb-6">
                        <div className="h-px bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-700 dark:to-indigo-700 mb-4" />
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Suspense>
          )}

          {activeTab === 'downloads' && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
              <div role="tabpanel" id="panel-downloads" aria-labelledby="tab-downloads" className="mx-auto md:w-10/12 lg:w-full">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                      <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Downloads</h3>
                      <p className="text-gray-600 dark:text-gray-400">Resources and files to get started</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "Download Templates", desc: "Download templates for your work", size: "2.5 MB" },
                      { title: "Download Software", desc: "Get software tools and packages", size: "45 MB" },
                      { title: "Download Whitepaper", desc: "Read our whitepaper document", size: "1.2 MB" },
                      { title: "Download User Guide", desc: "Download the user guide for reference", size: "850 KB" }
                    ].map((item, idx) => (
                      <a
                        key={idx}
                        href="#"
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-xl hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-200 border border-indigo-200/30 dark:border-indigo-700/30"
                        title={item.desc}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-900 dark:text-white font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {item.title}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                            {item.size}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                  </div>
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