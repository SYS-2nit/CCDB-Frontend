import React, { useEffect } from "react";
import "./Modal.scss";

interface FieldItem {
  label: string;
  placeholder: string;
  type?: "text" | "select" | "password";
  options?: string[];
}

interface ModalProps {
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  fields?: FieldItem[];
  buttonText?: string;
  cancelText?: string;
  theme?: "light" | "dark";
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  onConfirm,
  fields = [],
  buttonText = "확인",
  cancelText = "취소",
  theme = "light",
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`modal ${theme}`}>
        {/* Header */}
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div
          className={`modal__body ${
            fields.length > 2 ? "two-column" : "single-column"
          }`}
        >
          {fields.map((field, i) => (
            <div className="modal__row" key={i}>
              <label>{field.label}</label>
              {field.type === "select" ? (
                <select defaultValue="">
                  <option value="" disabled>
                    {field.placeholder}
                  </option>
                  {field.options?.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          <button className="cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm" onClick={onConfirm}>
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
