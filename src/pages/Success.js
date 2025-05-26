// pages/success.tsx
export default function SuccessPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Subscription Successful 🎉</h1>
      <p>Thank you for subscribing to Omnis Pro!</p>
      <a href="/dashboard" className="mt-6 inline-block bg-black text-white px-4 py-2 rounded">
        Go to Dashboard
      </a>
    </div>
  );
}
