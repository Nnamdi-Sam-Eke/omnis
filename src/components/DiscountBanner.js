import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDiscount } from "../context/DiscountContext";
import { Link } from "react-router-dom";

export default function DiscountBanner() {
  const { showBanner, discountEndDate } = useDiscount();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedFlag = localStorage.getItem("discountBannerDismissed");
    if (dismissedFlag === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("discountBannerDismissed", "true");
  };

  if (!showBanner || !discountEndDate || dismissed) return null;

  const remainingDays = Math.ceil(
    (discountEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  if (remainingDays <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="discount-banner"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        role="alert"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-3 text-sm font-medium shadow-md bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black dark:text-white dark:from-yellow-600 dark:via-yellow-500 dark:to-yellow-600"
      >
        <p>
          🎁 20% discount available! Upgrade within {remainingDays}{" "}
          day{remainingDays !== 1 ? "s" : ""} to claim it.
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/upgrade"
            className="bg-black text-amber-400 px-4 py-1 rounded font-semibold hover:bg-zinc-900 dark:bg-white dark:text-yellow-800 dark:hover:bg-zinc-200 transition"
            aria-label="Upgrade to claim discount"
          >
            Upgrade Now
          </Link>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss discount banner"
            className="text-black dark:text-white hover:text-red-600 dark:hover:text-red-500 font-bold text-xl leading-none"
          >
            &times;
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
// This component displays a discount banner at the top of the page
// when the user has an active discount available. It shows the number of days