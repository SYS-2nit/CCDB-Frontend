import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Header from "@/components/Header/Header";
import "./Database.scss";

const OracleDBModel = () => {
  return (
    <group>
      {/* 3단 DB 실린더 */}
      <group position={[0, -0.6, 0]}>
        {[
          { color: "#B9E9FF", y: 0.8 },
          { color: "#63BFFF", y: 0.4 },
          { color: "#1F76FF", y: 0 },
        ].map((layer, i) => (
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

/* DB 모달 (추가 / 삭제 공용) */
const DBModal: React.FC<{
  type: "add" | "delete";
  onClose: () => void;
}> = ({ type, onClose }) => {
  const isAdd = type === "add";

  const inputs = isAdd
    ? [
        { label: "Name", placeholder: "추가할 DB의 이름을 입력해주세요." },
        { label: "IP", placeholder: "추가할 DB의 IP를 입력해주세요." },
        { label: "Port", placeholder: "추가할 DB의 포트번호를 입력해주세요." },
        {
          label: "Account",
          placeholder: "추가할 DB의 접속 계정을 입력해주세요.",
        },
        {
          label: "Password",
          placeholder: "추가할 DB의 비밀번호를 입력해주세요.",
        },
      ]
    : [
        { label: "Name", placeholder: "삭제할 DB의 이름을 입력해주세요." },
        {
          label: "Password",
          placeholder: "삭제할 DB의 비밀번호를 입력해주세요.",
        },
      ];

  return (
    <div className="db-modal-overlay">
      <div className="db-modal">
        <h2 className="db-modal__title">{isAdd ? "DB 추가" : "DB 삭제"}</h2>

        {inputs.map((input, i) => (
          <div key={i} className="db-modal__row">
            <label>{input.label}</label>
            <input type="text" placeholder={input.placeholder} />
          </div>
        ))}

        <div className="db-modal__buttons">
          <button className="cancel" onClick={onClose}>
            취소
          </button>
          <button className="confirm" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

const Database: React.FC = () => {
  const [modalType, setModalType] = useState<"add" | "delete" | null>(null);

  return (
    <div className="database-page">
      <Header showTime={true} theme="database" />
      <div className="db-container">
        <div className="db-box">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <hemisphereLight args={["#b1e1ff", "#1e293b", 0.8]} />
            <Environment preset="city" />
            <OracleDBModel />
            <OrbitControls
              enableZoom={false}
              autoRotate
              autoRotateSpeed={1.0}
            />
          </Canvas>
        </div>

        {/* 버튼 영역 */}
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={() => setModalType("add")}>
            +
          </button>
          <button className="zoom-btn" onClick={() => setModalType("delete")}>
            -
          </button>
        </div>
      </div>

      {/* 조건부 렌더링으로 모달 출력 */}
      {modalType && (
        <DBModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
};

export default Database;
