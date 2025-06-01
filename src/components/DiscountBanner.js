import React from "react";

export default function DiscountBanner({ discountEndDate, onClose }) {
  const remainingDays = Math.ceil(
    (discountEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (remainingDays <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-4 z-50 flex justify-between items-center shadow-lg">
      <p>
        🎁 20% discount available! Upgrade within {remainingDays}{" "}
        day{remainingDays > 1 ? "s" : ""} to claim it.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => (window.location.href = "/upgrade")}
          className="bg-white text-green-600 px-4 py-1 rounded hover:bg-gray-100"
        >
          Upgrade Now
        </button>
        <button
          onClick={onClose}
          aria-label="Dismiss discount banner"
          className="text-white hover:text-gray-200 font-bold text-xl leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
