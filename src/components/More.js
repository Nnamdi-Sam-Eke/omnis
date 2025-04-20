// More.js
import React from 'react';

const More = () => {
  return (
    <div className="grid grid-cols-1 gap-4 mt-4">
      <div className="flex flex-col bg-white shadow-lg rounded-lg p-4 dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-blue-500 dark:text-blue-300">More</h2><br />
        <p className="text-gray-600 dark:text-gray-300">
          We are continuously enhancing our app with new features. Keep an eye out for upcoming updates 
          as we introduce more functionalities and expand our services. Our goal is to provide a seamless 
          experience with the latest in AI and data technology to serve you better. Stay tuned for more news 
          and developments!
        </p>
        <ul className="mt-4 space-y-2 text-gray-600 dark:text-gray-400">
          <li><a href="/settings" className="hover:text-blue-500">Settings</a></li>
          <li><a href="/help" className="hover:text-blue-500">Help & FAQs</a></li>
          <li><a href="/privacy-policy" className="hover:text-blue-500">Privacy Policy</a></li>
          <li><a href="/terms" className="hover:text-blue-500">Terms of Service</a></li>
          <li><a href="https://twitter.com/digitaltwinapp" className="hover:text-blue-500">Follow us on Twitter</a></li>
        </ul>
      </div>
    </div>
  );
};

export default More;
