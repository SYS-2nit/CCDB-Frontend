import React from "react";

interface SeverityDotProps {
  color: "yellow" | "red" | "black";
}

const SeverityDot: React.FC<SeverityDotProps> = ({ color }) => {
  return <span className={`severity-dot severity-dot--${color}`} />;
};

export default SeverityDot;
