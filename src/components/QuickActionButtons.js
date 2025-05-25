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
      glowClass: "from-blue-400 via-blue-300 to-blue-500",
      onClick: () => navigate("/new-scenario"),
    },
    {
      label: "📂 Saved Scenarios",
      bgColor: "bg-secondary",
      hoverColor: "hover:bg-secondary/90",
      glowClass: "from-emerald-400 via-emerald-300 to-emerald-500",
      onClick: () => navigate("/saved-scenarios"),
    },
    {
      label: "💬 Open Partner Chat",
      bgColor: "bg-accent",
      hoverColor: "hover:bg-accent/90",
      glowClass: "from-pink-400 via-pink-300 to-pink-500",
      onClick: () => navigate("/partner-chat"),
    },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-8">
      {actions.map((action, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.05 }}
          className="relative rounded-2xl p-[2px] transition-transform duration-300"
        >
          {/* Glowing border layer */}
          <div
            className={clsx(
              "absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              `bg-gradient-to-br ${action.glowClass}`
            )}
          ></div>

          {/* Button */}
          <button
            onClick={action.onClick}
            className={clsx(
              "relative z-10 group",
              action.bgColor,
              action.hoverColor,
              "text-black dark:text-white rounded-2xl px-6 py-3 text-lg font-medium transition-colors duration-300"
            )}
          >
            {action.label}
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default QuickActions;
