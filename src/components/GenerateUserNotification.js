export function generateUserNotifications(userData, sessionDocs = []) {
  const notifications = [];

  if (userData.lastLogin) {
    notifications.push({
      id: "lastLogin",
      activityType: "Last Login",
      title: "Last Login",
      message: "You logged into your account",
      type: "info",
      timestamp: userData.lastLogin.toDate(),
    });
  }

  if (userData.createdAt) {
    notifications.push({
      id: "accountCreated",
      activityType: "Account Created",
      title: "Account Created",
      message: "You created your Omnis account",
      type: "success",
      timestamp: userData.createdAt.toDate(),
    });
  }

  if (userData.profileUpdated) {
    notifications.push({
      id: "profileUpdated",
      activityType: "Profile Updated",
      title: "Profile Updated",
      message: "You made changes to your profile",
      type: "info",
      timestamp: userData.profileUpdated.toDate(),
    });
  }

  if (userData.passwordChanged) {
    notifications.push({
      id: "passwordChanged",
      activityType: "Password Changed",
      title: "Password Changed",
      message: "You updated your account password",
      type: "info",
      timestamp: userData.passwordChanged.toDate(),
    });
  }

  if (userData.emailChanged) {
    notifications.push({
      id: "emailChanged",
      activityType: "Email Changed",
      title: "Email Changed",
      message: "You changed your email address",
      type: "info",
      timestamp: userData.emailChanged.toDate(),
    });
  }

  if (userData.accountDeleted) {
    notifications.push({
      id: "accountDeleted",
      activityType: "Account Deleted",
      title: "Account Deleted",
      message: "You deleted your account",
      type: "alert",
      timestamp: userData.accountDeleted.toDate(),
    });
  }

  if (userData.sessionEnded) {
    notifications.push({
      id: "sessionEnded",
      activityType: "Session Ended",
      title: "Session Ended",
      message: "Your session ended",
      type: "info",
      timestamp: userData.sessionEnded.toDate(),
    });
  }

  if (userData.planUpgraded) {
    notifications.push({
      id: "planUpgraded",
      activityType: "Plan Upgraded",
      title: "Plan Upgraded",
      message: `You upgraded your plan to "${userData.planUpgraded.to || 'a higher tier'}"`,
      type: "success",
      timestamp: userData.planUpgraded.timestamp.toDate(),
    });
  }

  if (userData.planDowngraded) {
    notifications.push({
      id: "planDowngraded",
      activityType: "Plan Downgraded",
      title: "Plan Downgraded",
      message: `You downgraded your plan to "${userData.planDowngraded.to || 'a lower tier'}"`,
      type: "alert",
      timestamp: userData.planDowngraded.timestamp.toDate(),
    });
  }

  if (userData.trialStartedAt && userData.hasUsedSimulationTrial) {
    notifications.push({
      id: "trialStarted",
      activityType: "Trial Started",
      title: "Trial Started",
      message: "You started your 7-day free trial",
      type: "info",
      timestamp: userData.trialStartedAt.toDate(),
    });

    const trialEnd = new Date(userData.trialStartedAt.toDate().getTime() + 7 * 24 * 60 * 60 * 1000);
    if (trialEnd < new Date()) {
      notifications.push({
        id: "trialEnded",
        activityType: "Trial Ended",
        title: "Trial Ended",
        message: "Your 7-day free trial ended",
        type: "alert",
        timestamp: trialEnd,
      });
    }
  }

  if (userData.paymentFailed) {
    notifications.push({
      id: "paymentFailed",
      activityType: "Payment Failed",
      title: "Payment Failed",
      message: "A payment attempt failed. Please update your billing info.",
      type: "alert",
      timestamp: userData.paymentFailed.toDate(),
    });
  }

  if (userData.reportDownloaded) {
    notifications.push({
      id: "reportDownloaded",
      activityType: "Report Downloaded",
      title: "Report Downloaded",
      message: "You downloaded a simulation report",
      type: "info",
      timestamp: userData.reportDownloaded.toDate(),
    });
  }

  if (sessionDocs.length > 1) {
    const mostRecent = sessionDocs[sessionDocs.length - 1];
    const sessionData = mostRecent.data();
    const sessionTime = sessionData.createdAt?.toDate?.() || new Date();

    notifications.push({
      id: "multiDeviceLogin",
      activityType: "Multi-Device Login",
      title: "Multi-Device Login",
      message: "Your account was logged in from multiple devices",
      type: "alert",
      timestamp: sessionTime,
    });
  }

  return notifications;
}
