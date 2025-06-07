import { useState } from "react";

const accessControl = {
  Free: {
    multiPathSimulations: false,
    fullAnalytics: false,
    aiScenarioBuilder: false,
    collaboration: false,
    externalIntegrations: false,
  },
  Pro: {
    multiPathSimulations: true,
    fullAnalytics: true,
    aiScenarioBuilder: true,
    collaboration: true,
    externalIntegrations: true,
  },
  Enterprise: {
    multiPathSimulations: true,
    fullAnalytics: true,
    aiScenarioBuilder: true,
    collaboration: true,
    externalIntegrations: true,
  },
};

export default function useAccessControl(userTier) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Function to check if user has access to a specific feature
  const checkAccess = (feature) => {
    return accessControl[userTier]?.[feature] ?? false;
  };

  // Explicitly open and close modal handlers
  const openModal = () => setShowUpgradeModal(true);
  const closeModal = () => setShowUpgradeModal(false);

  return {
    checkAccess,
    showUpgradeModal,
    openModal,
    closeModal,
  };
}
