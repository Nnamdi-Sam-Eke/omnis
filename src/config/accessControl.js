const accessControl = {
  free: [
    'dashboard',
    'analyticsOverview',
    'darkMode',
  ],
  pro: [
    'dashboard',
    'analyticsOverview',
    'analyticsFull',
    'simulate',
    'exportData',
    'darkMode',
  ],
  enterprise: [
    'dashboard',
    'analyticsOverview',
    'analyticsFull',
    'simulate',
    'advancedAI',
    'exportData',
    'prioritySupport',
    'customIntegrations',
    'userManagement',
    'darkMode',
  ],
};

export default accessControl;
// This configuration defines the access control for different user tiers in the application.
// Each tier has access to a specific set of features, allowing for a clear distinction between free, pro, and enterprise users.