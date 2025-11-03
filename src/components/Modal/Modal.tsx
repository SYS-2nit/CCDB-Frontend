import React, { useEffect, useState } from "react";
import "./Modal.scss";
import InfoIcon from "@/assets/general/info.svg";
import Button from "../Button/Button";

export interface FieldItem {
  label: string;
  placeholder?: string;
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "select"
    | "radio"
    | "checkbox"
    | "textarea"
    | "button-group"
    | "date"
    | "datetime"
    | "file"
    | "table"
    | "switch";
  options?: string[];
  tableData?: { [key: string]: string }[];
  tableHeaders?: string[];
  showRegister?: boolean;
  maxBytes?: number;
  helperText?: string;
}

interface ModalProps {
  title: string;
  onReset?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
  fields?: FieldItem[];
  confirmText?: string;
  cancelText?: string;
  theme?: "light" | "dark";
  resetTrigger?: number;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const Modal: React.FC<ModalProps> = ({
  title,
  onReset,
  onClose,
  onConfirm,
  fields = [],
  confirmText = "확인",
  cancelText = "취소",
  theme = "light",
  resetTrigger,
  children,
  size = "md",
}) => {
  const [inputs, setInputs] = useState<{
    [key: string]: string | string[] | boolean;
  }>({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    setInputs({});
  }, [resetTrigger]);

  const handleChange = (label: string, value: string | string[] | boolean) => {
    setInputs((prev) => ({ ...prev, [label]: value }));
  };

  const handleRegister = (label: string) => {
    console.log(`[등록 완료] ${label}:`, inputs[label]);
  };

  const getByteLength = (str: string) => new TextEncoder().encode(str).length;

  return (
    <div className={`modal-overlay ${theme}`}>
      <div className={`modal ${theme} modal--${size}`}>
        {/* 헤더 */}
        <div className="modal__header">
          <h2>{title}</h2>
          <button className="modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 바디 */}
        <div className="modal__body">
          {fields.map((field, i) => (
            <div className="modal__row" key={i}>
              <div className="modal__row-header">{field.label}</div>

              {field.type === "table" && field.tableHeaders ? (
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
                <div className="modal__input-wrapper">
                  {/* 안내문 */}
                  {field.helperText && (
                    <p className="modal__helper">
                      <img src={InfoIcon} alt="Info Icon" /> {field.helperText}
                    </p>
                  )}

                  {/* 입력폼 렌더링 */}
                  {(() => {
                    switch (field.type) {
                      case "textarea":
                        return (
                          <textarea
                            placeholder={field.placeholder}
                            maxLength={field.maxBytes}
                            value={(inputs[field.label] as string) || ""}
                            onChange={(e) =>
                              handleChange(field.label, e.target.value)
                            }
                          />
                        );
                      case "select":
                        return (
                          <select
                            value={(inputs[field.label] as string) || ""}
                            onChange={(e) =>
                              handleChange(field.label, e.target.value)
                            }
                          >
                            <option value="">선택하세요</option>
                            {field.options?.map((opt, idx) => (
                              <option key={idx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        );
                      case "radio":
                        return (
                          <div className="modal__radio-group">
                            {field.options?.map((opt, idx) => (
                              <label key={idx}>
                                <input
                                  type="radio"
                                  name={field.label}
                                  value={opt}
                                  checked={inputs[field.label] === opt}
                                  onChange={() =>
                                    handleChange(field.label, opt)
                                  }
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        );
                      case "checkbox":
                        return (
                          <div className="modal__checkbox-group">
                            {field.options?.map((opt, idx) => (
                              <label key={idx}>
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={
                                    Array.isArray(inputs[field.label])
                                      ? (
                                          inputs[field.label] as string[]
                                        ).includes(opt)
                                      : false
                                  }
                                  onChange={(e) => {
                                    const prev =
                                      (inputs[field.label] as string[]) || [];
                                    if (e.target.checked) {
                                      handleChange(field.label, [...prev, opt]);
                                    } else {
                                      handleChange(
                                        field.label,
                                        prev.filter((v) => v !== opt)
                                      );
                                    }
                                  }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        );
                      case "switch":
                        return (
                          <label className="modal__switch">
                            <input
                              type="checkbox"
                              checked={!!inputs[field.label]}
                              onChange={(e) =>
                                handleChange(field.label, e.target.checked)
                              }
                            />
                            <span className="slider"></span>
                          </label>
                        );
                      case "file":
                        return (
                          <input
                            type="file"
                            onChange={(e) =>
                              handleChange(
                                field.label,
                                e.target.files?.[0]?.name || ""
                              )
                            }
                          />
                        );
                      case "date":
                      case "datetime":
                        return (
                          <input
                            type={
                              field.type === "datetime"
                                ? "datetime-local"
                                : "date"
                            }
                            value={(inputs[field.label] as string) || ""}
                            onChange={(e) =>
                              handleChange(field.label, e.target.value)
                            }
                          />
                        );
                      case "button-group":
                        return (
                          <div className="modal__button-group">
                            {field.options?.map((opt, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant={
                                  inputs[field.label] === opt
                                    ? "primary"
                                    : "white"
                                }
                                text={opt}
                                onClick={() => handleChange(field.label, opt)}
                              />
                            ))}
                          </div>
                        );
                      default:
                        return (
                          <p className="modal__text-value">
                            {field.placeholder || "-"}
                          </p>
                        );
                    }
                  })()}

                  {/* 글자수 카운트 & 등록 버튼 */}
                  {(field.showRegister || field.maxBytes) && (
                    <div className="modal__byte-row">
                      {field.maxBytes && (
                        <span className="byte-count">
                          {getByteLength((inputs[field.label] as string) || "")}
                          /{field.maxBytes}byte
                        </span>
                      )}
                      {field.showRegister && (
                        <Button
                          size="sm"
                          variant="primary"
                          text="등록"
                          onClick={() => handleRegister(field.label)}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {children && <div className="modal__custom-content">{children}</div>}
        </div>

        {/* 푸터 */}
        <div className="modal__footer">
          <Button
            text={cancelText}
            size="sm"
            variant="white"
            onClick={() => {
              if (onReset) onReset();
              else if (onClose) onClose();
            }}
          />
          <Button
            text={confirmText}
            size="sm"
            variant="primary"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default Modal;
