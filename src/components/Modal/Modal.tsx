import React from "react";
import "./Modal.scss";

interface FieldItem {
  label: string;
  placeholder: string;
  type?: string;
}

interface ModalProps {
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  fields: FieldItem[];
}

const Modal: React.FC<ModalProps> = ({ title, onClose, onConfirm, fields }) => {
  return (
    <div className="db-modal-overlay">
      <div className="db-modal">
        <h2 className="db-modal__title">{title}</h2>
        <hr />
        {fields.map((field, i) => (
          <div className="db-modal__row" key={i}>
            <label>{field.label}</label>
            <input
              type={field.type || "text"}
              placeholder={field.placeholder}
            />
          </div>
        ))}

        <div className="db-modal__buttons">
          <button className="cancel" onClick={onClose}>
            취소
          </button>
          <button className="confirm" onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
