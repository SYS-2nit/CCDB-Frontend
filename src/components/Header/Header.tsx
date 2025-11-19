import AlertPanel from "./components/AlertPanel";
import HeaderLeft from "./components/HeaderLeft";
import HeaderRight from "./components/HeaderRight";
import "./Header.scss";
import { useState } from "react";

const Header = () => {
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  const [unreadCount] = useState<number>(0);

  return (
    <>
      <header className="header">
        <HeaderLeft />
        {/* <HeaderRight onAlertOpen={() => setShowAlertPanel(true)} /> */}
        <HeaderRight
          unreadCount={unreadCount}
          onAlertOpen={() => setShowAlertPanel(true)}
        />
      </header>

      {showAlertPanel && (
        <AlertPanel onClose={() => setShowAlertPanel(false)} />
      )}
    </>
  );
};

export default Header;
