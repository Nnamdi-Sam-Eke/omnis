import React, {useEffect} from 'react';

const SubscriptionHistory = ({ subscriptions }) => {
  // Provide default empty array if undefined
  const safeSubscriptions = subscriptions || [];
  const [loading, setLoading] = React.useState(true);



  // Timer to switch off loading after 4 seconds (on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // If subscriptions is undefined, show loading state
 if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white  border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50"
            role="region"
            aria-labelledby="sub-History">
      <h2 className="text-xl font-semibold mb-4 text-green-500">Subscription History</h2>
      {safeSubscriptions.length === 0 ? (
        <p  className=' dark:text-gray-100'>No subscriptions found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Plan</th>
              <th className="text-left p-2">Amount</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {safeSubscriptions.map(({ id, date, plan, amount, status }) => (
              <tr key={id} className="border-b hover:bg-gray-100">
                <td className="p-2">{new Date(date).toLocaleDateString()}</td>
                <td className="p-2">{plan}</td>
                <td className="p-2">${amount.toFixed(2)}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      status === 'active'
                        ? 'bg-green-500'
                        : status === 'cancelled'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
};

export default SubscriptionHistory;
