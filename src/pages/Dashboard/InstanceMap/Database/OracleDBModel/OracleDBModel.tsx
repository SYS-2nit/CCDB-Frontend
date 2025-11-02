import { Html } from "@react-three/drei";
import React from "react";
import "./OracleDBModel.scss";

interface OracleDBModelProps {
  onClick: () => void;
  isZoomed: boolean;
  name?: string;
  showInfoCard?: boolean;
}

const OracleDBModel: React.FC<OracleDBModelProps> = ({
  onClick,
  isZoomed,
  name = "DB Name",
  showInfoCard = false,
}) => {
  const layers = [
    { color: "#B9E9FF", y: 0.6 },
    { color: "#63BFFF", y: 0.3 },
    { color: "#1F76FF", y: 0 },
  ];

  return (
    <group onClick={onClick} scale={isZoomed ? 1.5 : 1.0} position={[0, 0, 0]}>
      {/* InfoCard */}
      {showInfoCard && (
        <Html position={[0.7, -0.2, 0]} center>
          <div className="db-info-card">
            <h3 className="db-info-card__title">{name}</h3>
            <hr className="db-info-card__divider" />
            <p>
              <strong>IP:</strong> localhost
            </p>
            <p>
              <strong>Port:</strong> 1521
            </p>
            <p>
              <strong>Database:</strong> CDB$ROOT
            </p>
            <p>
              <strong>Active Sessions:</strong> 1
            </p>
          </div>
        </Html>
      )}

      {/* 3D DB 본체 */}
      <group>
        {layers.map((layer, i) => (
          <mesh key={i} position={[0, layer.y, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.3, 64]} />
            <meshPhysicalMaterial
              color={layer.color}
              metalness={1}
              roughness={0.5}
              transmission={1}
              opacity={1}
              transparent
              ior={1}
              envMapIntensity={1}
              clearcoat={1}
              clearcoatRoughness={1}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default OracleDBModel;
