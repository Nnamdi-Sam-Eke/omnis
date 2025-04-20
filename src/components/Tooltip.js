import React from 'react';

const Tooltip = ({ text, position = "top", children, backgroundColor = "bg-black", textColor = "text-white", fontSize = "text-xs" }) => {
  const positions = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div className="relative group">
      <span className="cursor-help" aria-label={text} role="tooltip">
        {/* Tooltip text */}
        <span
          className={`absolute ${positions[position]} hidden group-hover:block ${backgroundColor} ${textColor} ${fontSize} rounded py-1 px-2 z-10 transition-opacity duration-200 ease-in-out opacity-0 group-hover:opacity-100`}
        >
          {text}
        </span>
        {/* Content that will trigger tooltip */}
        {children}
      </span>
    </div>
  );
};

export default Tooltip;
