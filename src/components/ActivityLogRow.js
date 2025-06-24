import React from "react";

const ActivityLogRow = ({ log }) => {
  const { activityType, description, timestamp, deviceInfo } = log;

  // Format timestamp to be more user-friendly
  const formatTimestamp = (date) => {
    if (!date) return "N/A";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    // Show relative time for recent activities
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    
    // Show full date for older activities
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get activity type icon
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'login':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        );
      case 'logout':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case 'profile updated':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'password changed':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        );
      case 'email changed':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'account created':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'plan upgraded':
        return (
          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'plan downgraded':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Get device icon for login/logout activities
  const getDeviceIcon = (deviceType) => {
    if (!deviceType) return null;
    
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
          </svg>
        );
      case 'tablet':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  // Get browser emoji for login/logout activities
  const getBrowserEmoji = (browser) => {
    if (!browser) return '';
    
    const browserName = browser.toLowerCase();
    if (browserName.includes('chrome')) return '🌐';
    if (browserName.includes('firefox')) return '🦊';
    if (browserName.includes('safari')) return '🧭';
    if (browserName.includes('edge')) return '📘';
    if (browserName.includes('opera')) return '🎭';
    return '🌐';
  };

  // Get activity priority for styling
  const getActivityPriority = (type) => {
    const highPriority = ['password changed', 'email changed', 'plan upgraded', 'plan downgraded'];
    const mediumPriority = ['login', 'profile updated'];
    
    if (highPriority.includes(type.toLowerCase())) return 'high';
    if (mediumPriority.includes(type.toLowerCase())) return 'medium';
    return 'low';
  };

  const priority = getActivityPriority(activityType);

  return (
    <tr className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
      priority === 'high' ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''
    }`}>
      {/* Activity Type with Icon */}
      <td className="py-4 px-4 whitespace-normal break-words">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${
            priority === 'high' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            priority === 'medium' ? 'bg-blue-100 dark:bg-blue-900/30' :
            'bg-gray-100 dark:bg-gray-800'
          }`}>
            {getActivityIcon(activityType)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {activityType}
            </div>
            {priority === 'high' && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                Security Event
              </div>
            )}
          </div>
        </div>
      </td>
      
      {/* Description with Device Info */}
      <td className="py-4 px-4 whitespace-normal break-words">
        <div className="text-sm text-gray-800 dark:text-gray-200">
          {description}
        </div>
        {deviceInfo && (activityType.toLowerCase() === 'login' || activityType.toLowerCase() === 'logout') && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getDeviceIcon(deviceInfo.deviceType)}
            <span>{getBrowserEmoji(deviceInfo.browser)}</span>
            <span>{deviceInfo.browser}</span>
            {deviceInfo.os && (
              <>
                <span>•</span>
                <span>{deviceInfo.os}</span>
              </>
            )}
          </div>
        )}
      </td>
      
      {/* Timestamp */}
      <td className="py-4 px-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatTimestamp(timestamp)}
        </div>
        {timestamp && (
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </td>
    </tr>
  );
};

export default ActivityLogRow;