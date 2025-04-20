// components/widgets/TaskList.js
import React from 'react';

const TaskList = () => (
  <div className="bg-white border dark:bg-gray-800 p-6 rounded-lg shadow-md">
    <h3 className="text-2xl font-semibold mb-4">Upcoming Tasks</h3>
    <ul>
      <li className="border-b py-3">Prepare for team meeting</li>
      <li className="border-b py-3">Submit the new report</li>
      <li className="border-b py-3">Review system logs</li>
      <li className="border-b py-3">Follow up on user feedback</li>
    </ul>
  </div>
);

export default TaskList;

// Compare this snippet from components/OmnisDashboard.js: