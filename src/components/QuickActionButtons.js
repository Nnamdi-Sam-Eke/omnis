import { motion } from "framer-motion";
import React from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "+ New Scenario",
      bgColor: "bg-primary",
      textColor: "text-black",
      hoverColor: "hover:bg-primary/90",
      shadowColor: "hover:shadow-blue-500/50",
      glow: "rgba(59, 130, 246, 0.6)", // blue
      onClick: () => navigate("/new-scenario"),
    },
    {
      label: "📂 Saved Scenarios",
      bgColor: "bg-secondary",
      textColor: "text-black",
      hoverColor: "hover:bg-secondary/90",
      shadowColor: "hover:shadow-emerald-500/50",
      glow: "rgba(16, 185, 129, 0.6)", // green
      onClick: () => navigate("/saved-scenarios"),
    },
    {
      label: "💬 Open Partner Chat",
      bgColor: "bg-accent",
      textColor: "text-black",
      hoverColor: "hover:bg-accent/90",
      shadowColor: "hover:shadow-pink-500/50",
      glow: "rgba(236, 72, 153, 0.6)", // pink
      onClick: () => navigate("/partner-chat"),
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          whileHover={{
            scale: 1.05,
            boxShadow: `0 0 15px 4px ${action.glow}`,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className={clsx(
            action.bgColor,
            action.hoverColor,
            action.textColor,
            action.shadowColor,
            "rounded-2xl px-6 py-3 text-lg shadow-md transition duration-300 ease-in-out"
          )}
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
// This component renders quick action buttons with hover effects and navigation.
// Each button has a unique style and navigates to different routes when clicked.
// The buttons use Framer Motion for smooth animations on hover and tap.