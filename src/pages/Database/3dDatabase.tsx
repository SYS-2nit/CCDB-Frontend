import { Html } from "@react-three/drei";
import React from "react";

// 3D DB 모델
interface OracleDBModelProps {
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isZoomed: boolean;
  name?: string;
}

const OracleDBModel: React.FC<OracleDBModelProps> = ({
  onClick,
  onHover,
  isZoomed,
  name = "DB Name",
}) => {
  const layers = [
    { color: "#B9E9FF", y: 0.8 },
    { color: "#63BFFF", y: 0.4 },
    { color: "#1F76FF", y: 0 },
  ];

  return (
    <group
      onClick={onClick}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      scale={isZoomed ? 1.0 : 2.0}
    >
      {/* 모델 위에 DB 이름 표시 */}
      <Html position={[0, 1.2, 0]} center>
        <div
          style={{
            color: "white",
            background: "rgba(0,0,0,0.4)",
            fontSize: "20px",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
      </Html>

      <group position={[0, -0.6, 0]}>
        {layers.map((layer, i) => (
          <mesh key={i} position={[0, layer.y, 0]}>
            <cylinderGeometry args={[0.9, 0.9, 0.35, 64]} />
            <meshPhysicalMaterial
              color={layer.color}
              metalness={0.85}
              roughness={0.15}
              transmission={0.3}
              opacity={0.9}
              transparent
              ior={1.05}
              envMapIntensity={0.8}
              clearcoat={1}
              clearcoatRoughness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default OracleDBModel;
