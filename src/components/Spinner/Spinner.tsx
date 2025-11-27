import React from "react";
import "./Spinner.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = "md", message }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner" />
      {message && <div className="spinner-message">{message}</div>}
    </div>
  );
};

export default Spinner;
