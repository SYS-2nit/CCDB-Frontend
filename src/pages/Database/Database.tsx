import "./Database.scss";
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Header from "@/components/Header/Header";
import OracleDBModel from "@/components/Modal/OracleDBModel";
import DBHoverCard from "@/components/Modal/DBHoverCard";
import DBInfoPanel from "@/components/Modal/DBInfoPanel";
import DBModal from "@/components/Modal/DBModal";

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

      {isModalOpen && (
        <DBModal
          title={isModalOpen === "add" ? "DB 추가" : "DB 삭제"}
          onClose={() => setIsModalOpen(null)}
        />
      )}
    </div>
  );
};

export default Database;
