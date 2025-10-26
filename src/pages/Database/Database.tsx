import "./Database.scss";
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Header from "@/components/Header/Header";
import { useNavigate } from "react-router-dom";

/* 3D DB 모델 */
const OracleDBModel = ({
  onClick,
  onHover,
  isZoomed,
}: {
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  isZoomed: boolean;
}) => {
  return (
    <group
      onClick={onClick}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      scale={isZoomed ? 1.0 : 2.0}
    >
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

/* DB 추가/삭제 모달 */
const DBModal: React.FC<{ title: string; onClose: () => void }> = ({
  title,
  onClose,
}) => {
  const placeholders =
    title === "DB 추가"
      ? [
          "추가할 DB의 이름을 입력해주세요.",
          "추가할 DB의 IP를 입력해주세요.",
          "추가할 DB의 포트번호를 입력해주세요.",
          "추가할 DB의 계정을 입력해주세요.",
          "추가할 DB의 비밀번호를 입력해주세요.",
        ]
      : [
          "삭제할 DB의 이름을 입력해주세요.",
          "삭제할 DB의 비밀번호를 입력해주세요.",
        ];

  return (
    <div className="db-modal-overlay">
      <div className="db-modal">
        <h2 className="db-modal__title">{title}</h2>
        {placeholders.map((ph, i) => (
          <div className="db-modal__row" key={i}>
            <label>
              {i === 0 ? "Name" : i === 1 ? "Password" : `Field ${i + 1}`}
            </label>
            <input type="text" placeholder={ph} />
          </div>
        ))}
        <div className="db-modal__buttons">
          <button className="cancel" onClick={onClose}>
            취소
          </button>
          <button className="confirm">확인</button>
        </div>
      </div>
    </div>
  );
};

/* Hover 시 DB 요약정보 카드 */
const DBHoverCard = () => {
  return (
    <div className="db-info-card">
      <h3>DB Name</h3>
      <p>
        <strong>IP</strong> <span>localhost</span>
      </p>
      <p>
        <strong>Port</strong> <span>1521</span>
      </p>
      <p>
        <strong>Database</strong> <span>CDB$ROOT</span>
      </p>
      <hr />
      <p>
        <strong>Active Sessions</strong> <span>1</span>
      </p>
      <p>
        <strong>Lock Wait Sessions</strong> <span>1</span>
      </p>
      <p>
        <strong>Session Logical Reads</strong> <span>1</span>
      </p>
      <p>
        <strong>Execute Count</strong> <span>1</span>
      </p>
    </div>
  );
};

/* 상세 정보 패널 */
const DBInfoPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();

  const handleConnect = () => {
    navigate("/dashboard");
  };

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
            <strong>DB List</strong>
            <span className="db-list">
              <span>CDB$ROOT</span>
              <span>CDB$ROOT</span>
            </span>
          </p>
          <p>
            <strong>IP</strong> <span>localhost / 192.168.122.1</span>
          </p>
          <p>
            <strong>Port</strong> <span>1521</span>
          </p>
        </div>
        <div className="db-card">
          <h3>Metrics</h3>
          <p>
            <strong>Active Sessions</strong> <span>N.NN</span>
          </p>
          <p>
            <strong>Lock Wait Sessions</strong> <span>N.NN</span>
          </p>
          <p>
            <strong>Session Logical Reads</strong>
            <span>N.NN</span>
          </p>
          <p>
            <strong>Execute Count</strong> <span>N.NN</span>
          </p>
          <p>
            <strong>CPU</strong> <span>N.NN</span>
          </p>
          <p>
            <strong>Disk Usage</strong> <span>N.NN</span>
          </p>
          <p>
            <strong>Memory Usage</strong> <span>N.NN</span>
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
          <h3>Instance</h3>
          <p>
            <strong>Active Sessions</strong> <span>N</span>
          </p>
          <p>
            <strong>Lock Wait Sessions</strong> <span>N</span>
          </p>
          <p>
            <strong>Session Logical Reads</strong> <span>N</span>
          </p>
          <p>
            <strong>Execute Count</strong> <span>N</span>
          </p>
        </div>
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
          <p>
            <strong>Network I/O IN/OUT</strong> <span>N/N</span>
          </p>
        </div>
        <div className="db-buttons">
          <button className="back-btn" onClick={onBack}>
            뒤로가기
          </button>
          <button className="connect-btn" onClick={handleConnect}>
            접속하기
          </button>
        </div>
      </div>
    </div>
  );
};

/* 메인 */
const Database: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<null | "add" | "delete">(null);
  const [isHovering, setIsHovering] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="database-page">
      <Header showTime={true} theme="database" />

      {!showInfo ? (
        <>
          <div className="db-container">
            <div className="db-box">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Environment preset="city" />
                <OracleDBModel
                  onClick={() => setShowInfo(true)}
                  onHover={(v) => setIsHovering(v)}
                  isZoomed={false}
                />
                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={1.0}
                />
              </Canvas>
            </div>
            {isHovering && <DBHoverCard />}
          </div>

          <div className="zoom-controls">
            <button className="zoom-btn" onClick={() => setIsModalOpen("add")}>
              +
            </button>
            <button
              className="zoom-btn"
              onClick={() => setIsModalOpen("delete")}
            >
              -
            </button>
          </div>
        </>
      ) : (
        <DBInfoPanel onBack={() => setShowInfo(false)} />
      )}

      {isModalOpen === "add" && (
        <DBModal title="DB 추가" onClose={() => setIsModalOpen(null)} />
      )}
      {isModalOpen === "delete" && (
        <DBModal title="DB 삭제" onClose={() => setIsModalOpen(null)} />
      )}
    </div>
  );
};

export default Database;
