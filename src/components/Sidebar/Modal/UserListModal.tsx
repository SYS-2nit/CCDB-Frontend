import "./UserListModal.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface Props {
  members: {
    id: number;
    username: string;
    email: string;
    company: string;
  }[];
  onClose: () => void;
}

const UserListModal: React.FC<Props> = ({ members, onClose }) => {
  return (
    <div className="user-modal-backdrop" onClick={onClose}>
      <div className="user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="user-modal__title">회원 목록</div>

        <div className="user-modal__list">
          {members.map((m) => (
            <div key={m.id} className="user-modal__item">
              <div className="user-modal__name">{m.username}</div>
              <div className="user-modal__email">{m.email}</div>
              <div className="user-modal__company">{m.company}</div>
            </div>
          ))}
        </div>

        <button className="user-modal__close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default UserListModal;
