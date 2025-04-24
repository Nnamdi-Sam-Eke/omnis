import React, { useId } from 'react';

/**
 * Accessible Tooltip component
 * - Shows tooltip on hover and focus
 * - Provides aria-describedby for screen readers
 */
const Tooltip = ({
  text,
  position = 'top',
  children,
  backgroundColor = 'bg-black',
  textColor = 'text-white',
  fontSize = 'text-xs',
}) => {
  const id = useId();
  const positions = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  return (
    <div className="relative inline-block group">
      {/* Trigger element */}
      <span
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help focus:outline-none"
      >
        {children}
      </span>

      {/* Tooltip bubble */}
      <div
        role="tooltip"
        id={id}
        className={`absolute ${positions[position]} hidden group-hover:block group-focus:block ${backgroundColor} ${textColor} ${fontSize} rounded py-1 px-2 z-10 transition-opacity duration-200 ease-in-out opacity-0 group-hover:opacity-100 group-focus:opacity-100`}
      >
        {text}
      </div>
    </div>
  );
};

export default Tooltip;
