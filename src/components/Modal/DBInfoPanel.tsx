import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import OracleDBModel from "./OracleDBModel";

// 상세 정보 패널
interface DBInfoPanelProps {
  onBack: () => void;
}

const DBInfoPanel: React.FC<DBInfoPanelProps> = ({ onBack }) => {
  const navigate = useNavigate();

  return (
    <div className="db-info-layout">
      <div className="db-info-left">
        <div className="db-card">
          <h3>DB</h3>
          <p>
            <strong>Type</strong> <span>Oracle Pro</span>
          </p>
          <p>
            <strong>Version</strong> <span>23.0.0.0</span>
          </p>
          <p>
            <strong>IP</strong> <span>localhost / 192.168.122.1</span>
          </p>
          <p>
            <strong>Port</strong> <span>1521</span>
          </p>
        </div>
      </div>

      <div className="db-model-center">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Environment preset="city" />
          <OracleDBModel
            onClick={() => {}}
            onHover={() => {}}
            isZoomed={false}
          />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.0} />
        </Canvas>
      </div>

      <div className="db-info-right">
        <div className="db-card">
          <h3>Resource Map</h3>
          <p>
            <strong>CPU Usage</strong> <span>N%</span>
          </p>
          <p>
            <strong>Disk Usage</strong> <span>N%</span>
          </p>
          <p>
            <strong>Memory Usage</strong> <span>N%</span>
          </p>
        </div>
        <div className="db-buttons">
          <button className="back-btn" onClick={onBack}>
            뒤로가기
          </button>
          <button
            className="connect-btn"
            onClick={() => navigate("/dashboard")}
          >
            접속하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DBInfoPanel;
