import React from "react";

// DB 추가/삭제 모달
interface DBModalProps {
  title: string;
  onClose: () => void;
}

const DBModal: React.FC<DBModalProps> = ({ title, onClose }) => {
  const placeholders =
    title === "DB 추가"
      ? [
          "추가할 DB의 이름을 입력해주세요.",
          "추가할 DB의 IP를 입력해주세요.",
          "추가할 DB의 포트번호를 입력해주세요.",
          "추가할 DB의 계정을 입력해주세요.",
          "추가할 DB의 비밀번호를 입력해주세요.",
        ]
      : [
          "삭제할 DB의 이름을 입력해주세요.",
          "삭제할 DB의 비밀번호를 입력해주세요.",
        ];

  return (
    <div className="db-modal-overlay">
      <div className="db-modal">
        <h2 className="db-modal__title">{title}</h2>
        {placeholders.map((ph, i) => (
          <div className="db-modal__row" key={i}>
            <label>
              {i === 0 ? "Name" : i === 1 ? "Password" : `Field ${i + 1}`}
            </label>
            <input type="text" placeholder={ph} />
          </div>
        ))}
        <div className="db-modal__buttons">
          <button className="cancel" onClick={onClose}>
            취소
          </button>
          <button className="confirm">확인</button>
        </div>
      </div>
    </div>
  );
};

export default DBModal;
