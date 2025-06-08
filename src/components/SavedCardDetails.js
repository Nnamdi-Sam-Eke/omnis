import React, { useEffect, useState } from 'react';

const SavedCardDetails = ({ card, onUpdate, onRemove }) => {
  const [loading, setLoading] = useState(true);

  // Timer to switch off loading after 4 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!card) {
    return (
      <div
        className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
        role="region"
        aria-labelledby="saved-card-details"
      >
        <section>
          <h2 className="text-xl font-semibold mb-4 text-green-500">Saved Card Details</h2>
          <p className="dark:text-gray-100">No saved card details available.</p>
        </section>
      </div>
    );
  }

  return (
    <div
      className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
      role="region"
      aria-labelledby="saved-card-details"
    >
      <section>
        <h2 className="text-xl text-green-500 font-semibold mb-4">Saved Card Details</h2>
        <div className="p-4 border rounded shadow-sm max-w-md">
          <p><strong>Cardholder Name:</strong> {card.name}</p>
          <p><strong>Card Number:</strong> **** **** **** {card.last4}</p>
          <p><strong>Expiry:</strong> {card.expiryMonth}/{card.expiryYear}</p>
          <div className="mt-4 space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={onUpdate}
            >
              Update Card
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={onRemove}
            >
              Remove Card
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SavedCardDetails;
