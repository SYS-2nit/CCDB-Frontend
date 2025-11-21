// 알림 모달

const AlertPanel = ({ onClose }: { onClose: () => void }) => (
  <div className="alert-panel__overlay" onClick={onClose}>
    <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
      <div className="alert-panel__header">
        <h3>알림 목록</h3>
        <button className="alert-panel__close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="alert-panel__content">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="alert-item">
            <div className="alert-item__icon">⚠️</div>
            <div className="alert-item__text">
              <strong>그래프 이름</strong>에 경고 발생
              <div className="alert-item__sub">N분 전 · DB명</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AlertPanel;
