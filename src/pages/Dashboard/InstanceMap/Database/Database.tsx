import "./Database.scss";
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Modal from "@/components/Modal/Modal";
import DetaileInfo from "./Card/DetaileInfo";
import OracleDBModel from "./OracleDBModel/OracleDBModel";

const Database: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<null | "add" | "delete">(null);
  const [showInfo, setShowInfo] = useState(false);
  const [dbCount, setDbCount] = useState(1);

  const handleConfirm = () => {
    if (isModalOpen === "add") {
      setDbCount((prev) => prev + 1);
      console.log("DB 추가 완료");
    } else {
      setDbCount((prev) => Math.max(1, prev - 1));
      console.log("DB 삭제 완료");
    }
    setIsModalOpen(null); // 모달 닫기
  };

  return (
    <>
      {!showInfo ? (
        <>
          <div className="db-container">
            <div className="db-box">
              <Canvas
                camera={{
                  position: [0, 0, Math.max(8, dbCount * 2)],
                  fov: 50,
                }}
                style={{
                  width: "100vw",
                  height: "100vh",
                }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Environment preset="city" />

                {Array.from({ length: dbCount }).map((_, i) => (
                  <group
                    key={i}
                    position={[
                      (i - (dbCount - 1) / 2) * 4.0, // 균등 간격 배치
                      0,
                      0,
                    ]}
                  >
                    <OracleDBModel
                      onClick={() => setShowInfo(true)}
                      isZoomed={false}
                      showInfoCard={true}
                    />
                  </group>
                ))}

                <OrbitControls
                  enableZoom
                  enablePan
                  maxDistance={Math.max(15, dbCount * 4)}
                  minDistance={5}
                  target={[0, 0, 0]}
                />
              </Canvas>
            </div>
          </div>

          {/* DB 추가/삭제 버튼 */}
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
        <DetaileInfo onBack={() => setShowInfo(false)} />
      )}

      {/* 모달창 */}
      {isModalOpen && (
        <Modal
          theme="dark"
          title={isModalOpen === "add" ? "DB 추가" : "DB 삭제"}
          onClose={() => setIsModalOpen(null)}
          onConfirm={handleConfirm}
          fields={
            isModalOpen === "add"
              ? [
                  {
                    label: "Name",
                    placeholder: "추가할 DB의 이름을 입력해주세요.",
                  },
                  {
                    label: "IP",
                    placeholder: "추가할 DB의 IP를 입력해주세요.",
                  },
                  {
                    label: "Port",
                    placeholder: "추가할 DB의 포트번호를 입력해주세요.",
                  },
                  {
                    label: "Account",
                    placeholder: "추가할 DB의 계정을 입력해주세요.",
                  },
                  {
                    label: "Password",
                    placeholder: "추가할 DB의 비밀번호를 입력해주세요.",
                    type: "password",
                  },
                ]
              : [
                  {
                    label: "Name",
                    placeholder: "삭제할 DB의 이름을 입력해주세요.",
                  },
                  {
                    label: "Password",
                    placeholder: "삭제할 DB의 비밀번호를 입력해주세요.",
                    type: "password",
                  },
                ]
          }
        />
      )}
    </>
  );
};

export default Database;
