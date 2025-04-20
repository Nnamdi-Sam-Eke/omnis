import { useState } from "react";

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-3xl bg-white shadow-lg rounded-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Your AI-Powered Decision-Making Companion</h1>
        <p className="text-gray-600 mt-4 text-lg">
          Make better decisions, reduce overthinking, and simulate real-life scenarios with AI.
        </p>
        <p className="text-gray-700 mt-2 font-semibold">Join the waitlist & be the first to try it!</p>
        
        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 rounded-lg border border-gray-300 w-full sm:w-auto flex-grow"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Join Waitlist
            </button>
          </form>
        ) : (
          <p className="mt-4 text-green-600 font-semibold">Thank you! You're on the waitlist. 🎉</p>
        )}
      </div>
    </div>
  );
}