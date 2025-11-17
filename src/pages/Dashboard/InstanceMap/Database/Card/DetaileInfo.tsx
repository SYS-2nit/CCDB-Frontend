import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import DBStatusCard from "./DBStatusCard";
import "./DetaileInfo.scss";
import OracleDBModel from "../OracleDBModel/OracleDBModel";

interface InfoItem {
  label: string;
  value: string;
}

interface DBInfoPanelProps {
  onBack: () => void;
  dbInfo?: InfoItem[];
  metricsInfo?: InfoItem[];
  instanceInfo?: InfoItem[];
  resourceInfo?: InfoItem[];
}

const DBInfoRow: React.FC<InfoItem> = ({ label, value }) => (
  <p>
    <strong>{label}</strong> <span>{value}</span>
  </p>
);

const DBInfoPanel: React.FC<DBInfoPanelProps> = ({
  onBack,
  dbInfo = [
    { label: "Type", value: "Oracle Pro" },
    { label: "Version", value: "23.0.0.0" },
    { label: "DB List", value: "CDB$ROOT" },
    { label: "IP", value: "localhost / 192.168.122.1" },
    { label: "Port", value: "1521" },
  ],
  metricsInfo = [
    { label: "Active Sessions", value: "N.NN" },
    { label: "Lock Wait Sessions", value: "N.NN" },
    { label: "Session Logical Reads", value: "N.NN" },
    { label: "Execute Count", value: "N.NN" },
    { label: "CPU", value: "N.NN" },
    { label: "Disk Usage", value: "N.NN" },
    { label: "Memory Usage", value: "N.NN" },
  ],
  instanceInfo = [
    { label: "Active Sessions", value: "N" },
    { label: "Lock Wait Sessions", value: "N" },
    { label: "Session Logical Reads", value: "N" },
    { label: "Execute Count", value: "N" },
  ],
  resourceInfo = [
    { label: "CPU Usage", value: "N%" },
    { label: "Disk Usage", value: "N%" },
    { label: "Memory Usage", value: "N%" },
    { label: "Network I/O IN/OUT", value: "N/N" },
  ],
}) => {
  const navigate = useNavigate();

  return (
    <div className="db-info-layout">
      {/* 왼쪽 정보 영역 */}
      <div className="db-info-left">
        <div className="db-card">
          <h3>DB</h3>
          <hr />
          {dbInfo.map((item, i) => (
            <DBInfoRow key={i} {...item} />
          ))}
        </div>

        <div className="db-card">
          <h3>Metrics</h3>
          <hr />
          {metricsInfo.map((item, i) => (
            <DBInfoRow key={i} {...item} />
          ))}
        </div>
      </div>

      {/* 중앙 3D 모델 */}
      <div className="db-model-center">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <Environment preset="city" />
          {/* hover 이벤트 제거된 OracleDBModel */}
          <OracleDBModel
            onClick={() => {}}
            isZoomed={true}
            showInfoCard={false}
          />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.0} />
        </Canvas>
      </div>

      {/* 오른쪽 리소스/인스턴스 영역 */}
      <div className="db-info-right">
        <div className="status-card-group">
          <DBStatusCard title="주의" value="N" subValue="N" trend="down" />
          <DBStatusCard title="위험" value="N" subValue="N" trend="up" />
          <DBStatusCard title="치명" value="N" subValue="N" trend="up" />
        </div>

        <div className="db-card">
          <h3>Instance</h3>
          <hr />
          {instanceInfo.map((item, i) => (
            <DBInfoRow key={i} {...item} />
          ))}
        </div>

        <div className="db-card">
          <h3>Resource Map</h3>
          <hr />
          {resourceInfo.map((item, i) => (
            <DBInfoRow key={i} {...item} />
          ))}
        </div>

        <div className="db-buttons">
          <button className="back-btn" onClick={onBack}>
            뒤로가기
          </button>
          <button
            className="connect-btn"
            onClick={() => navigate("/dashboard/instance-list")}
          >
            접속하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DBInfoPanel;
