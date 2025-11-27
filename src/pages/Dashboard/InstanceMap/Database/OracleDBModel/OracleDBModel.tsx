import { Html } from "@react-three/drei";
import React from "react";
import "./OracleDBModel.scss";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface OracleDBModelProps {
  onClick: () => void;
  isZoomed: boolean;
  showInfoCard?: boolean;
  name?: string;
  ip?: string;
  port?: string;
  account?: string;
  color?: string; // 위험도에 따른 색상
  statusLabel?: string; // 인스턴스 상태 라벨
}

const OracleDBModel: React.FC<OracleDBModelProps> = ({
  onClick,
  isZoomed,
  name = "DB Name",
  ip = "localhost",
  port = "1521",
  account = "admin",
  showInfoCard = false,
  color = "#16A34A", // 기본값: 초록색 (정상)
  statusLabel = "",
}) => {
  const layers = [
    { color, y: 0.82 },
    { color, y: 0.41 },
    { color, y: 0 },
  ];

  const scaleValue = isZoomed ? 3.0 : 1.5;

  return (
    <group onClick={onClick} scale={scaleValue}>
      {/* 인스턴스 상태 라벨 */}
      {statusLabel && (
        <Html position={[0, 1.5, 0]} center zIndexRange={[0, 1]}>
          <div className="db-status-label">{statusLabel}</div>
        </Html>
      )}
      {showInfoCard && (
        <Html position={[0.7, -0.2, 0]} center zIndexRange={[0, 1]}>
          <div className="db-info-card">
            <h3 className="db-info-card__title">{name}</h3>
            <hr className="db-info-card__divider" />
            <p>
              <strong>IP:</strong> {ip}
            </p>
            <p>
              <strong>Port:</strong> {port}
            </p>
            <p>
              <strong>Account:</strong> {account}
            </p>
          </div>
        </Html>
      )}

      {layers.map((layer, i) => (
        <mesh key={i} position={[0, layer.y, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.4, 64]} />
          <meshPhysicalMaterial
            color={layer.color}
            metalness={1}
            roughness={0.5}
            transmission={1}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
};

export default OracleDBModel;
