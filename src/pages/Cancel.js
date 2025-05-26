// pages/cancel.tsx
export default function CancelPage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Checkout Cancelled</h1>
      <p>No worries — you can subscribe anytime.</p>
      <a href="/pricing" className="mt-6 inline-block bg-gray-800 text-white px-4 py-2 rounded">
        Return to Pricing
      </a>
    </div>
  );
}
