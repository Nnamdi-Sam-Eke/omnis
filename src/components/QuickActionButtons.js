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
      hoverColor: "hover:bg-primary/90",
      glow: "rgba(59, 130, 246, 0.6)", // blue glow
      onClick: () => navigate("/new-scenario"),
    },
    {
      label: "📂 Saved Scenarios",
      bgColor: "bg-secondary",
      hoverColor: "hover:bg-secondary/90",
      glow: "rgba(16, 185, 129, 0.6)", // green glow
      onClick: () => navigate("/saved-scenarios"),
    },
    {
      label: "💬 Open Partner Chat",
      bgColor: "bg-accent",
      hoverColor: "hover:bg-accent/90",
      glow: "rgba(236, 72, 153, 0.6)", // pink glow
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
            boxShadow: `0 0 20px 5px ${action.glow}`,
          }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className={clsx(
            action.bgColor,
            action.hoverColor,
            "text-black dark:text-white", // 🌓 Theme-aware text color
            "rounded-2xl px-6 py-3 text-lg shadow-md transition-all duration-300 ease-in-out"
          )}
          style={{ transition: "box-shadow 0.3s ease" }} // smooth glow
        >
          {action.label}
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
// This component renders a set of quick action buttons with hover effects and navigation.
// Each button has a unique background color, hover effect, and glow on hover.
// The buttons are responsive and adapt to light/dark themes.