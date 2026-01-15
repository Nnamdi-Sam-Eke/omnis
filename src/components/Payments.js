import React, { useState, useEffect } from 'react';
import { Download, FileText, CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

// =====================================================
// COMPONENT 1: Enhanced SubscriptionHistory
// =====================================================
const SubscriptionHistory = ({ subscriptions }) => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const safeSubscriptions = subscriptions || [];

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      succeeded: { color: 'bg-green-500', icon: CheckCircle, text: 'Paid' },
      active: { color: 'bg-green-500', icon: CheckCircle, text: 'Active' },
      failed: { color: 'bg-red-500', icon: XCircle, text: 'Failed' },
      pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pending' },
      cancelled: { color: 'bg-gray-500', icon: AlertCircle, text: 'Cancelled' },
      refunded: { color: 'bg-gray-500', icon: AlertCircle, text: 'Refunded' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const filteredSubscriptions = safeSubscriptions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  if (loading) {
    return (
      <div className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50">
      <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400 mb-6">Subscription History</h2>

      {/* Filter buttons */}
      {safeSubscriptions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {['all', 'active', 'succeeded', 'failed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {safeSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <p className="dark:text-gray-100 text-gray-600">No subscriptions found.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Start a subscription to see your history here.
          </p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <p className="dark:text-gray-100 text-gray-600">
            No {filter} subscriptions found.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Plan</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Amount</th>
                <th className="text-left p-2 text-gray-700 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map(({ id, date, plan, amount, status }) => (
                <tr key={id} className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2 dark:text-gray-300">
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="p-2 dark:text-gray-300">{plan}</td>
                  <td className="p-2 dark:text-gray-300 font-semibold">${amount.toFixed(2)}</td>
                  <td className="p-2">
                    <StatusBadge status={status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Failed payments warning */}
      {safeSubscriptions.some(s => s.status === 'failed') && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 dark:text-red-300 font-semibold">
                Failed Payment Detected
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPONENT 2: Enhanced ReceiptGenerator
// =====================================================
const ReceiptGenerator = ({ subscriptions }) => {
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const safeSubscriptions = subscriptions || [];

  // Select first available subscription by default
  useEffect(() => {
    if (safeSubscriptions.length > 0 && !selectedId) {
      setSelectedId(safeSubscriptions[0].id);
    }
  }, [safeSubscriptions, selectedId]);

  const generateTextReceipt = () => {
    const subscription = safeSubscriptions.find(sub => sub.id === selectedId);
    if (!subscription) return;

    const receiptText = `
═══════════════════════════════════════
           PAYMENT RECEIPT
═══════════════════════════════════════

Receipt ID: ${subscription.id}
Date: ${new Date(subscription.date).toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}

───────────────────────────────────────
SUBSCRIPTION DETAILS
───────────────────────────────────────
Plan:              ${subscription.plan}
Amount:            $${subscription.amount.toFixed(2)}
Status:            ${subscription.status.toUpperCase()}
Transaction ID:    ${subscription.id}

───────────────────────────────────────
BILLING SUMMARY
───────────────────────────────────────
Subtotal:          $${subscription.amount.toFixed(2)}
Tax:               $0.00
───────────────────────────────────────
Total Paid:        $${subscription.amount.toFixed(2)}

═══════════════════════════════════════
Thank you for your business!

Questions? Contact: support@company.com
═══════════════════════════════════════
    `.trim();

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

  const generateHTMLReceipt = () => {
    const subscription = safeSubscriptions.find(sub => sub.id === selectedId);
    if (!subscription) return;

    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${subscription.id}</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .receipt {
      background: white;
      padding: 40px;
      border: 2px solid #333;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .section {
      margin: 20px 0;
    }
    .section-title {
      font-weight: bold;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total {
      border-top: 2px solid #333;
      margin-top: 20px;
      padding-top: 10px;
      font-size: 18px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #333;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="company-name">YOUR COMPANY NAME</div>
      <div>Receipt #${subscription.id}</div>
    </div>

    <div class="section">
      <div class="section-title">PAYMENT INFORMATION</div>
      <div class="row">
        <span>Date:</span>
        <span>${new Date(subscription.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
      <div class="row">
        <span>Status:</span>
        <span>${subscription.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">SUBSCRIPTION DETAILS</div>
      <div class="row">
        <span>Plan:</span>
        <span>${subscription.plan}</span>
      </div>
      <div class="row">
        <span>Amount:</span>
        <span>$${subscription.amount.toFixed(2)}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">BILLING SUMMARY</div>
      <div class="row">
        <span>Subtotal:</span>
        <span>$${subscription.amount.toFixed(2)}</span>
      </div>
      <div class="row">
        <span>Tax:</span>
        <span>$0.00</span>
      </div>
      <div class="row total">
        <span>Total Paid:</span>
        <span>$${subscription.amount.toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>Questions? Contact us at support@company.com</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${subscription.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50">
      <h2 className="text-2xl font-bold mb-4 text-amber-600 mb-6">Receipt Generator</h2>

      {safeSubscriptions.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <p className="dark:text-gray-100 text-gray-600">No receipts available.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Complete a payment to generate receipts.
          </p>
        </div>
      ) : (
        <>
          <p className="dark:text-gray-100 mb-4">
            Select a subscription and download your receipt
          </p>
          
          <div className="space-y-4">
            {/* Subscription selector */}
            <select
              value={selectedId || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {safeSubscriptions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {new Date(sub.date).toLocaleDateString()} - {sub.plan} - ${sub.amount.toFixed(2)}
                </option>
              ))}
            </select>

            {/* Download buttons */}
            <div className="flex gap-3">
              <button
                onClick={generateTextReceipt}
                disabled={!selectedId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition ${
                  selectedId
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <FileText className="w-5 h-5" />
                Download TXT
              </button>
              
              <button
                onClick={generateHTMLReceipt}
                disabled={!selectedId}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white transition ${
                  selectedId
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                Download HTML
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// =====================================================
// COMPONENT 3: Payment Methods Display
// =====================================================
const PaymentMethods = ({ paymentMethods }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const safeMethods = paymentMethods || [];

  if (loading) {
    return (
      <div className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
          <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border dark:bg-gray-800 p-6 rounded-xl shadow-lg transition hover:shadow-blue-500/50">
      <h2 className="text-2xl font-bold mb-4 text-purple-600 mb-6">Payment Methods</h2>

      {safeMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-3" />
          <p className="dark:text-gray-100 text-gray-600">No saved card details available.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Add Payment Method
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {safeMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                <div>
                  <p className="font-semibold dark:text-white">{method.brand} •••• {method.last4}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================
// DEMO PAGE - Shows all components together
// =====================================================
const Payments = () => {
  // Mock data for demo
  const mockSubscriptions = [
    {
      id: 'sub_1234567890',
      date: '2024-01-15',
      plan: 'Pro Plan',
      amount: 29.99,
      status: 'succeeded'
    },
    {
      id: 'sub_0987654321',
      date: '2023-12-15',
      plan: 'Pro Plan',
      amount: 29.99,
      status: 'succeeded'
    },
    {
      id: 'sub_1122334455',
      date: '2023-11-15',
      plan: 'Basic Plan',
      amount: 9.99,
      status: 'failed'
    }
  ];

  const mockPaymentMethods = [
    {
      id: 'pm_1',
      brand: 'Visa',
      last4: '4242',
      expMonth: '12',
      expYear: '2025',
      isDefault: true
    }
  ];

  return (
    <div className="min-h-screen rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
       
        <div className="grid grid-cols-1 gap-6">
          <SubscriptionHistory subscriptions={mockSubscriptions} />
          <ReceiptGenerator subscriptions={mockSubscriptions} />
        </div>

        <PaymentMethods paymentMethods={mockPaymentMethods} />
      </div>
    </div>
  );
};

export default Payments;
export { SubscriptionHistory, ReceiptGenerator, PaymentMethods };