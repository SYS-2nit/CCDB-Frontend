import React, { useEffect, useState } from "react";
import "./Modal.scss";

interface FieldItem {
  label: string;
  placeholder?: string;
  type?: "text" | "select" | "password" | "button-group" | "date" | "table";
  options?: string[];
  tableData?: { [key: string]: string }[];
  tableHeaders?: string[];
}

interface ModalProps {
  title: string;
  onClose?: () => void;
  onConfirm?: () => void;
  fields?: FieldItem[];
  confirmText?: string;
  cancelText?: string;
  theme?: "light" | "dark";
}

const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  onConfirm,
  fields = [],
  confirmText = "확인",
  cancelText = "취소",
  theme = "light",
}) => {
  const [selected, setSelected] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSelect = (label: string, value: string) => {
    setSelected((prev) => ({ ...prev, [label]: value }));
  };

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`modal ${theme}`}>
        {/* 헤더 */}
        <div className="modal__header">
          <div className="modal__title">
            <h2>{title}</h2>
          </div>
          <button className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className="modal__body">
          {fields.map((field, i) => (
            <div className="modal__row" key={i}>
              <div className="modal__row-header">
                <label>{field.label}</label>
              </div>

              {/* 필드 렌더링*/}
              {field.type === "button-group" && field.options ? (
                <div className="button-group">
                  {field.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`button-group__btn ${
                        selected[field.label] === opt ? "active" : ""
                      }`}
                      onClick={() => handleSelect(field.label, opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : field.type === "date" ? (
                <input type="date" placeholder={field.placeholder} />
              ) : field.type === "select" ? (
                <select defaultValue="">
                  <option value="" disabled>
                    {field.placeholder}
                  </option>
                  {field.options?.map((opt, idx) => (
                    <option key={idx}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "table" && field.tableHeaders ? (
                <div className="modal__table-wrapper">
                  <table className="modal__table">
                    <thead>
                      <tr>
                        {field.tableHeaders.map((header, idx) => (
                          <th key={idx}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {field.tableData?.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {field.tableHeaders?.map((header, colIdx) => (
                            <td key={colIdx}>{row[header] || "Data"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <input
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div className="modal__footer">
          <button className="cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className="confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
