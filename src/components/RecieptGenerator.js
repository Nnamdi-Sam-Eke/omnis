import React, { useState } from 'react';

const ReceiptGenerator = ({ subscriptions }) => {
  const safeSubscriptions = subscriptions || [];
  const [selectedId, setSelectedId] = useState(null);

  const handleDownload = () => {
    const subscription = safeSubscriptions.find(sub => sub.id === selectedId);
    if (!subscription) return;

    const receiptText = `
      Receipt
      ----------
      Date: ${new Date(subscription.date).toLocaleDateString()}
      Plan: ${subscription.plan}
      Amount: $${subscription.amount.toFixed(2)}
      Status: ${subscription.status}
    `;

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${subscription.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white  border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
            role="region"
            aria-labelledby="sub-History">
    <section>
      <h2 className="text-xl font-semibold mb-4 text-green-500">Receipt Generator</h2>
      <p className=' dark:text-gray-100'>Please click on the button below to generate your reciept</p>
      <div className="max-w-md mt-8">
    
        <button
          disabled={!selectedId}
          className={`px-4 py-2 rounded text-white ${
            selectedId ? 'bg-blue-600 hover:bg-green-700' : 'bg-blue-400 cursor-not-allowed'
          }`}
          onClick={handleDownload}
        >
          Download Receipt
        </button>
      </div>
    </section>
    </div>
  );
};

export default ReceiptGenerator;
