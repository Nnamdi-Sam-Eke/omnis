import React from "react";
import favicon from "../images/Gif.png";

const PulseBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    {/* Background Image */}
    <div
      className="w-full h-full bg-cover bg-center bg-no-repeat animate-pulse-shadow blur-sm brightness-100"
      style={{ backgroundImage: `url(${favicon})` }}
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/60" />
  </div>
);

export default PulseBackground;
