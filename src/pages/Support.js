import React, { useState, Suspense, lazy } from 'react';
import { ChevronRight, ChevronUp } from 'react-feather';

// Lazy loading the contact form component
const ContactForm = lazy(() => import('../components/ContactForm'));

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('FAQs');
  const [openFaqIndex, setOpenFaqIndex] = useState({ categoryIdx: null, faqIdx: null });

  // FAQs Data with categories
  const faqCategories = [
    {
      category: 'General',
      faqs: [
        {
          question: "What is Omnis and what does it do?",
          answer:
            "Omnis is an AI-powered platform that helps individuals and businesses make better, data-informed decisions through scenario analysis, multi-path scenario evaluation, predictive modeling, and personalized insights."
        },
        {
          question: "Who is Omnis for?",
          answer:
            "Omnis is designed for decision-makers across industries—founders, teams, professionals, and anyone seeking to turn complexity into clarity."
        }
      ]
    },
    {
      category: 'Account',
      faqs: [
        {
          question: "Is Omnis free to use?",
          answer:
            "Omnis offers a free tier with core features, and additional premium features will be available under paid plans."
        },
        {
          question: "How do I reset my password?",
          answer:
            "To reset your password, click 'Forgot Password' on the login page and follow the instructions sent to your email."
        }
      ]
    },
    {
      category: 'Security',
      faqs: [
        {
          question: "Is my data safe with Omnis?",
          answer:
            "Yes. We prioritize your data privacy and security using best-in-class encryption and user-controlled data permissions."
        },
        {
          question: "How can I enable two-factor authentication?",
          answer:
            "You can enable two-factor authentication in your account settings. Just follow the steps under 'Security Settings.'"
        }
      ]
    }
  ];

  const tabLabels = {
    FAQs: 'FAQs',
    Contact: 'Contact Us'
  };

  const isOpen = (categoryIdx, faqIdx) =>
    openFaqIndex.categoryIdx === categoryIdx && openFaqIndex.faqIdx === faqIdx;

  const handleFaqToggle = (categoryIdx, faqIdx) => {
    if (isOpen(categoryIdx, faqIdx)) {
      setOpenFaqIndex({ categoryIdx: null, faqIdx: null });
    } else {
      setOpenFaqIndex({ categoryIdx, faqIdx });
    }
  };

  return (
    <div className="p-6">
      {/* Tabs Navigation */}
      <div role="tablist" className="flex flex-wrap gap-4 justify-center mt-8 sm:justify-start mb-4 sm:mb-6">
        {Object.keys(tabLabels).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls={`${tab}-panel`}
            id={`${tab}-tab`}
            onClick={() => setActiveTab(tab)}
            title={`Go to ${tabLabels[tab]}`}
            className={`px-4 py-2 sm:px-5 sm:py-2 rounded-full font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === tab
                ? 'bg-blue-500 text-white border border-blue-700'
                : 'bg-gray-300 text-gray-800 hover:bg-green-300'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="relative grid h-full grid-cols-1 msm:grid-cols-2 lg:grid-cols-1 gap-6 transition-all">
        {/* FAQs Tab */}
        {activeTab === 'FAQs' && (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <div id="FAQs-panel" role="tabpanel" aria-labelledby="FAQs-tab" className="space-y-4">
              <h3 className="text-xl font-semibold text-green-500 dark:text-green-500">Frequently Asked Questions</h3>
              {faqCategories.map((category, categoryIdx) => (
                <div key={categoryIdx} className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-500">{category.category}</h4>
                  {category.faqs.map((faq, faqIdx) => (
                    <div
                      key={faqIdx}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-blue-500/30 transition-all"
                      title="Click to expand the answer"
                    >
                      <button
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen(categoryIdx, faqIdx)}
                        aria-controls={`faq-${categoryIdx}-${faqIdx}`}
                        onClick={() => handleFaqToggle(categoryIdx, faqIdx)}
                        onKeyDown={e =>
                          (e.key === 'Enter' || e.key === ' ') && handleFaqToggle(categoryIdx, faqIdx)
                        }
                        className="w-full text-left flex justify-between items-center text-base md:text-lg font-medium text-blue-600 dark:text-blue-400"
                      >
                        {faq.question}
                        <span className="ml-2 text-xl">
                          {isOpen(categoryIdx, faqIdx) ? <ChevronUp /> : <ChevronRight />}
                        </span>
                      </button>
                      {isOpen(categoryIdx, faqIdx) && (
                        <p
                          id={`faq-${categoryIdx}-${faqIdx}`}
                          className="mt-3 text-sm md:text-base text-gray-700 dark:text-gray-300"
                        >
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Suspense>
        )}

        {/* Contact Tab */}
        {activeTab === 'Contact' && (
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-40">
                <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            }
          >
            <div id="Contact-panel" role="tabpanel" aria-labelledby="Contact-tab" className="space-y-4">
              <h3 className="text-xl font-semibold text-green-500 dark:text-green-500">Contact Us</h3>
              <ContactForm />
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
