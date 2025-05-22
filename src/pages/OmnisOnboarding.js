// src/components/OmnisOnboarding.jsx
import React, { useState } from 'react';
import Joyride, { EVENTS, STATUS } from 'react-joyride';

const OmnisOnboarding = () => {
  const [run, setRun] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      target: '.analytics-tab',
      content: '📊 This is the Analytics Tab. View insights, predictions, and trends here.',
      spotlightPadding: 10,
    },
    {
      target: '.sidebar-toggle',
      content: '📁 This is the Sidebar Toggle. Click here to navigate across Omnis.',
    },
    {
      target: '.partner-chat',
      content: '💬 Meet Partner Chat — your intelligent assistant inside Omnis.',
    },
    {
      target: '.new-scenario-btn',
      content: '🚀 Start a new simulation scenario by clicking here.',
    },
    {
      target: '.saved-scenarios-tab',
      content: '💾 Access your saved simulations here for easy retrieval and analysis.',
    },
    {
      target: '.notifications-icon',
      content: '🔔 Get alerts about anomalies, updates, and insights.',
    },
    {
      target: '.profile-dropdown',
      content: '👤 Manage your account, settings, and preferences here.',
    },
    {
      target: '.creators-corner',
      content: "🧠 Explore Creator's Corner for exclusive advanced features and content.",
    },
    {
      target: '.help-support',
      content: '❓ Need assistance? Access documentation and support here.',
    },
  ];

  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + 1);
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      setStepIndex(0);
      localStorage.setItem('onboarded', 'true');
    }
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        stepIndex={stepIndex}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: '#007FFF',
            backgroundColor: '#001F33',
            overlayColor: 'rgba(0, 0, 0, 0.7)',
            primaryColor: '#00C49A',
            textColor: '#FFFFFF',
            zIndex: 1000,
            spotlightShadow: '0 0 0 4px rgba(0,255,255,0.5)',
          },
        }}
      />

      {run && (
        <div className="fixed z-[1001] bottom-8 right-8 flex items-center space-x-3 bg-white text-black px-4 py-3 rounded-lg shadow-lg border border-blue-400 max-w-sm transition-opacity duration-300">
          <img
            src="/favicon.ico"
            alt="Omnis Mascot"
            className="w-10 h-10 rounded-full border border-blue-500"
          />
          <p className="text-sm font-medium">{steps[stepIndex]?.content}</p>
        </div>
      )}
    </>
  );
};

export default OmnisOnboarding;
