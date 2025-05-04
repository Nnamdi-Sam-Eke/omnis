import React, { useState, useEffect } from "react";
import { FiThumbsUp, FiThumbsDown, FiPenTool } from "react-icons/fi";
import emailjs from "emailjs-com";

function FeedbackButton() {
  const [isFeedbackFormVisible, setIsFeedbackFormVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");

  const toggleFeedbackForm = () => {
    setIsFeedbackFormVisible(!isFeedbackFormVisible);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();

    if (!feedback.trim() || !category || rating === null) {
      setValidationMessage("Please fill in all fields before submitting.");
      return;
    }

    emailjs.sendForm(
      'service_lfch17n',
      'template_zb3uq0x',
      e.target,
      'Ru_HJfV9Y-llO0KHQ'
    ).then((result) => {
        console.log("✅ Email sent:", result.text);
        setValidationMessage("Thank you for your feedback!");
        setFeedback("");
        setCategory("");
        setRating(null);
        setIsFeedbackFormVisible(false);
    }, (error) => {
        console.error("❌ Email error:", error.text);
        setValidationMessage("Something went wrong. Please try again.");
    });

    e.target.reset();
  };

  useEffect(() => {
    if (validationMessage) {
      const timer = setTimeout(() => setValidationMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [validationMessage]);

  return (
    <div>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 bg-opacity-50 backdrop-blur-sm right-6 z-[9999]" title="Feedback Button">
        <button
          onClick={toggleFeedbackForm}
          className="bg-blue-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg"
        >
          <FiPenTool />
        </button>
      </div>

      {/* Toast Message */}
      {validationMessage && (
        <div className="fixed bottom-24 right-4 bg-black/80 text-white text-sm px-4 py-2 rounded shadow-lg z-[9999] transition-opacity animate-fade">
          {validationMessage}
        </div>
      )}

      {/* Background Overlay with Blur */}
      {isFeedbackFormVisible && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]" onClick={toggleFeedbackForm}></div>
      )}

      {/* Feedback Form */}
      {isFeedbackFormVisible && (
        <div className="fixed bottom-20 right-6 z-[9999] bg-white backdrop-blur-sm dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-80 border-2 border-blue-300">
          <h2 className="text-lg font-bold mb-4 text-blue-700 dark:text-blue-400">
            Submit Feedback
          </h2>

          <form onSubmit={handleFeedbackSubmit}>
            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
                Select Category
              </label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="">Choose a category</option>
                <option value="General">General</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Performance">Performance</option>
                <option value="Feature Request">Feature Request</option>
              </select>
            </div>

            {/* Rating */}
            <div className="mb-4 flex items-center space-x-6">
              <input type="hidden" name="rating" value={rating ? "Positive" : rating === false ? "Negative" : ""} />
              <button
                type="button"
                onClick={() => setRating(true)}
                className={`text-2xl transition ${
                  rating === true
                    ? "text-green-500"
                    : "text-gray-500 hover:text-green-600"
                }`}
              >
                <FiThumbsUp />
              </button>
              <button
                type="button"
                onClick={() => setRating(false)}
                className={`text-2xl transition ${
                  rating === false
                    ? "text-red-500"
                    : "text-gray-500 hover:text-red-600"
                }`}
              >
                <FiThumbsDown />
              </button>
            </div>

            {/* Feedback Text */}
            <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Your Feedback
            </label>
            <textarea
              name="message"
              className="w-full h-24 border dark:border-gray-600 rounded p-2 mb-4 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
              placeholder="Enter your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            {/* Buttons */}
            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={toggleFeedbackForm}
                className="text-red-600 hover:text-red-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default FeedbackButton;
