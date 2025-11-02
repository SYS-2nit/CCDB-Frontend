import "./Database.scss";
import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import DetaileInfo from "./Card/DetaileInfo";
import OracleDBModel from "./OracleDBModel/OracleDBModel";
import List from "./List/List";

interface DBInfo {
  name: string;
  ip: string;
  port: string;
  account: string;
  password: string;
}

const Database: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);

  // DB 목록 상태
  const [dbList, setDbList] = useState<DBInfo[]>([
    {
      name: "ev-LocalHost",
      ip: "localhost",
      port: "1521",
      account: "admin",
      password: "****",
    },
  ]);

  // DB 추가
  const handleAddDatabase = (newDB: DBInfo) => {
    setDbList((prev) => [...prev, newDB]);
  };

  // DB 삭제
  const handleDeleteDatabase = (
    nameToDelete: string,
    password: string
  ): boolean => {
    const targetDB = dbList.find((db) => db.name === nameToDelete);

    // 이름이 존재하지 않거나 비밀번호가 불일치하면 삭제 중단
    if (!targetDB || targetDB.password !== password) {
      console.warn("삭제 실패: DB가 존재하지 않거나 비밀번호 불일치");
      return false;
    }

    // 일치할 경우만 삭제
    setDbList((prev) => prev.filter((db) => db.name !== nameToDelete));
    console.log(`${nameToDelete} 삭제 완료`);
    return true;
  };

  return (
    <>
      {!showInfo ? (
        <div className="database-layout">
          <div className="database-layout-model">
            <div className="db-box">
              {/* 왼쪽: DB 목록 */}
              <List
                onAddDatabase={handleAddDatabase}
                onDeleteDatabase={handleDeleteDatabase}
              />

              {/* 오른쪽: 3D DB 모델 */}
              <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ width: "100%", height: "100%" }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Environment preset="city" />

                <group scale={0.2}>
                  {dbList.map((db, i) => (
                    <group
                      key={i}
                      position={[(i - (dbList.length - 1) / 2) * 7.0, -0.5, 0]}
                    >
                      <OracleDBModel
                        name={db.name}
                        ip={db.ip}
                        port={db.port}
                        account={db.account}
                        onClick={() => setShowInfo(true)}
                        isZoomed={false}
                        showInfoCard={true}
                      />
                    </group>
                  ))}
                </group>

                <OrbitControls enableZoom enablePan target={[0, 0, 0]} />
              </Canvas>
            </div>
          </div>
        </div>
      ) : (
        <DetaileInfo onBack={() => setShowInfo(false)} />
      )}
    </>
  );
};

export default Database;
