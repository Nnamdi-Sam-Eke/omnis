// components/widgets/ActivityFeed.js
import React from 'react';

const ActivityFeed = () => (
  <div className="bg-white h-80 border dark:bg-gray-800 mt-6 p-8 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-blue-500 dark:text-blue-300">Recent Activity</h3>
    <ul className='mt-6'>
      <li className="border-b py-3">User John created a new post</li>
      <li className="border-b py-3">System updated successfully</li>
      <li className="border-b py-3">New comment on your post</li>
      <li className="border-b py-3">User Sarah joined the platform</li>
    </ul>
  </div>
);

export default ActivityFeed;

// Compare this snippet from components/widgets/GeolocationMapCard.js:
// import React from 'react';
