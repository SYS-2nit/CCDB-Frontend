import React from "react";

interface FieldItem {
  label: string;
  placeholder: string;
  type?: string;
}

interface ModalProps {
  title: string; // 모달 제목
  onClose: () => void; // 닫기 버튼 이벤트
  onConfirm?: () => void; // 확인 버튼 이벤트 (선택)
  fields: FieldItem[]; // 입력 필드 정보 배열
}

const Modal: React.FC<ModalProps> = ({ title, onClose, onConfirm, fields }) => {
  return (
    <div className="db-modal-overlay">
      <div className="db-modal">
        <h2 className="db-modal__title">{title}</h2>

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
