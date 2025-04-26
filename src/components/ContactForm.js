// ../components/ContactForm.js
import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState(null); // To handle submission status

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simulating a form submission (replace with actual logic)
    setFormStatus('loading');
    
    try {
      // Mock delay to simulate submission
      setTimeout(() => {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 1500);
    } catch (error) {
      setFormStatus('error');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-blue-600 dark:text-white mb-6">Contact Us</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-green-500 dark:text-green-500 mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-green-500 dark:text-green-500 mb-2" htmlFor="email">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          />
        </div>

        {/* Subject Field */}
        <div>
          <label className="block text-green-500 dark:text-green-500 mb-2" htmlFor="subject">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          />
        </div>

        {/* Message Field */}
        <div>
          <label className="block text-green-500 dark:text-green-500 mb-2" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={formStatus === 'loading'}
          >
            {formStatus === 'loading' ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        {/* Form Status */}
        {formStatus === 'success' && (
          <div className="text-green-600 mt-4">Your message has been sent successfully!</div>
        )}
        {formStatus === 'error' && (
          <div className="text-red-600 mt-4">Something went wrong, please try again.</div>
        )}
      </form>
    </div>
  );
};

export default ContactForm;
// This code defines a ContactForm component that allows users to send messages. It includes fields for name, email, subject, and message, and handles form submission with simulated loading and success/error states. The form is styled using Tailwind CSS classes for a modern look.
// The component uses React hooks for state management and provides feedback to the user based on the submission status.