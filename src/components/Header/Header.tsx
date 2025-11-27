import React, { useState } from "react";
import "./Header.scss";
import AlertPanel from "./components/AlertPanel";
import HeaderLeft from "./components/HeaderLeft";
import HeaderRight from "./components/HeaderRight";
import { useAlerts } from "./hooks/useAlerts";
import { formatTimeAgo } from "./utils/timeFormatter";

/*
 ******************************************************************
 공동 작성자: 최영준, 오수경
 ******************************************************************
 */

const Header: React.FC = () => {
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  const { unreadCount, alerts, isLoading, handleAlertClick, loadUnreadCount } = useAlerts({
    showPanel: showAlertPanel,
  });



  return (
    <>
      <header className="header">
        <HeaderLeft />        
        <HeaderRight
          unreadCount={unreadCount}
          onAlertOpen={() => setShowAlertPanel(true)}
        />
      </header>

      {showAlertPanel && (
        <AlertPanel
          onClose={() => setShowAlertPanel(false)}
          alerts={alerts}
          isLoading={isLoading}
          onAlertClick={handleAlertClick}
          formatTimeAgo={formatTimeAgo}
          loadUnreadCount={loadUnreadCount}
        />
      )}
    </>
  );
};

export default Header;
