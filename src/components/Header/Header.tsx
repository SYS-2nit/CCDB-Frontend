import AlertPanel from "./components/AlertPanel";
import HeaderLeft from "./components/HeaderLeft";
import HeaderRight from "./components/HeaderRight";
import "./Header.scss";
import { useState } from "react";

const Header = () => {
  const [showAlertPanel, setShowAlertPanel] = useState(false);

  return (
    <>
      <header className="header">
        <HeaderLeft />
        <HeaderRight onAlertOpen={() => setShowAlertPanel(true)} />
      </header>

      {showAlertPanel && (
        <AlertPanel onClose={() => setShowAlertPanel(false)} />
      )}
    </>
  );
};

export default Header;
