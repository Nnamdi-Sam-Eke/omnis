import React from "react";
import { formatDistanceToNow } from "date-fns";

const ActivityLogRow = ({ log }) => {
  const { activityType, description, timestamp } = log;

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="py-3 px-4 whitespace-normal break-words text-sm text-gray-900 dark:text-gray-100">
        {activityType}
      </td>
      <td className="py-3 px-4 whitespace-normal break-words text-sm text-gray-800 dark:text-gray-200">
        {description}
      </td>
      <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
        {timestamp?.toDate ? formatDistanceToNow(timestamp.toDate(), { addSuffix: true }) : "N/A"}
      </td>
    </tr>
  );
};

export default ActivityLogRow;
