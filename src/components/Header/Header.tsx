import React, { useState } from "react";
import "./Header.scss";
import AlertPanel from "./components/AlertPanel";
import HeaderLeft from "./components/HeaderLeft";
import HeaderRight from "./components/HeaderRight";
import { useAlerts } from "./hooks/useAlerts";
import { formatTimeAgo } from "./utils/timeFormatter";

const Header: React.FC = () => {
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const memberId = 3; // 기본 사용자 ID

  const { unreadCount, alerts, isLoading, handleAlertClick, loadUnreadCount } = useAlerts({
    memberId,
    showPanel: showAlertPanel,
  });



  return (
    <>
      <header className="header">
        <HeaderLeft />
        <HeaderRight
          onAlertOpen={() => setShowAlertPanel(true)}
          unreadCount={unreadCount}
        />
      </header>

      {showAlertPanel && (
        <AlertPanel
          onClose={() => setShowAlertPanel(false)}
          alerts={alerts}
          isLoading={isLoading}
          onAlertClick={handleAlertClick}
          formatTimeAgo={formatTimeAgo}
          memberId={memberId}
          loadUnreadCount={loadUnreadCount}
        />
      )}
    </>
  );
};

export default Header;
