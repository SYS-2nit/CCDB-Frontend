import "./Database.scss";
import React, { useCallback, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { isAxiosError } from "axios";
import DetaileInfo from "./Card/DetaileInfo";
import OracleDBModel from "./OracleDBModel/OracleDBModel";
import List from "./List/List";
import { useTheme } from "@/components/Header/hooks/useTheme";
import {
  createDatabaseInstance,
  deleteDatabaseInstance,
  fetchDatabaseInstances,
  fetchInstancesByDatabase,
  testDatabaseInstance,
  type DatabaseCreatePayload,
  type DatabaseDeletePayload,
  type DatabaseInstanceResponse,
  type DatabaseInstanceListItem,
  type DatabaseTestPayload,
} from "@/api/Databases/databases";

type DatabaseListItem = {
  id: number;
  name: string;
  ip: string;
  port: string;
  account: string;
  sid: string;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TestResultForList = {
  success: boolean;
  message?: string;
  errorMessage?: string;
};

const SELECTED_DB_STORAGE_KEY = "selectedDatabase";

const parseOracleUrl = (url?: string | null) => {
  const fallback = { host: "-", port: "-", sid: "-" };
  if (!url) return fallback;

  let cleaned = url.replace(/^jdbc:oracle:thin:@/, "");
  if (cleaned.startsWith("//")) {
    cleaned = cleaned.slice(2);
  }

  let host = "";
  let port = "";
  let sid = "";

  const slashIndex = cleaned.indexOf("/");
  if (slashIndex >= 0) {
    const hostPort = cleaned.slice(0, slashIndex);
    sid = cleaned.slice(slashIndex + 1);
    const [h, p] = hostPort.split(":");
    host = h ?? "";
    port = p ?? "";
  } else {
    const parts = cleaned.split(":");
    host = parts[0] ?? "";
    port = parts[1] ?? "";
    sid = parts[2] ?? "";
  }

  return {
    host: host || "-",
    port: port || "-",
    sid: sid || "-",
  };
};

const toListItem = (instance: DatabaseInstanceResponse): DatabaseListItem => {
  const { host, port, sid } = parseOracleUrl(instance.url);

  return {
    id: instance.id,
    name: instance.name ?? `DB-${instance.id}`,
    ip: host,
    port,
    sid,
    account: instance.username ?? "-",
    isActive: instance.isActive ?? false,
    createdAt: instance.createdAt,
    updatedAt: instance.updatedAt,
  };
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
};

// 위험도에 따른 색상 매핑
const getSeverityColor = (severity: number | null | undefined): string => {
  if (severity === null || severity === undefined) {
    return "#7FA4FA"; // 정상: 파란색
  }
  switch (severity) {
    case 1:
      return "#FACC15"; // 주의: 노란색
    case 2:
      return "#DC2626"; // 위험: 빨간색
    case 3:
      return "#151515"; // 치명: 검은색
    default:
      return "#7FA4FA"; // 기본값: 파란색
  }
};

// DB의 가장 높은 위험도 계산
const getMaxSeverity = (instances: DatabaseInstanceListItem[]): number | null => {
  if (instances.length === 0) return null;
  
  const severities = instances
    .map((inst) => inst.currentSeverity)
    .filter((sev): sev is number => sev !== null && sev !== undefined);
  
  if (severities.length === 0) return null;
  
  return Math.max(...severities);
};

const Database: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [showInfo, setShowInfo] = useState(false);
  const [dbList, setDbList] = useState<DatabaseListItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dbInstancesMap, setDbInstancesMap] = useState<
    Map<number, DatabaseInstanceListItem[]>
  >(new Map());
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<number | null>(
    () => {
      const stored = sessionStorage.getItem(SELECTED_DB_STORAGE_KEY);
      if (!stored) return null;
      try {
        const parsed = JSON.parse(stored) as { id?: number | string };
        if (typeof parsed?.id === "number") return parsed.id;
        if (typeof parsed?.id === "string") {
          const numeric = Number(parsed.id);
          return Number.isNaN(numeric) ? null : numeric;
        }
        return null;
      } catch (error) {
        console.warn("[Database] 저장된 선택 정보를 읽는 중 오류", error);
        return null;
      }
    }
  );

  const handleDatabaseSelectStorage = useCallback(
    (database: DatabaseListItem | null) => {
      if (database) {
        try {
          sessionStorage.setItem(
            SELECTED_DB_STORAGE_KEY,
            JSON.stringify({ id: database.id, name: database.name })
          );
        } catch (error) {
          console.warn("[Database] 선택한 DB 저장 실패", error);
        }
        window.dispatchEvent(
          new CustomEvent("dashboard:selected-db", {
            detail: { id: database.id, name: database.name },
          })
        );
      } else {
        sessionStorage.removeItem(SELECTED_DB_STORAGE_KEY);
        window.dispatchEvent(
          new CustomEvent("dashboard:selected-db", {
            detail: { id: null, name: null },
          })
        );
      }
    },
    []
  );

  const handleDatabaseSelect = useCallback(
    (database: DatabaseListItem | null) => {
      if (database) {
        setSelectedDatabaseId(database.id);
      } else {
        setSelectedDatabaseId(null);
      }
      handleDatabaseSelectStorage(database);
    },
    [handleDatabaseSelectStorage]
  );

  const loadDatabases = useCallback(async () => {
    setIsFetching(true);

    try {
      const instances = await fetchDatabaseInstances();
      const items = instances.map(toListItem);
      setDbList(items);
      setFetchError(null);

      if (
        selectedDatabaseId !== null &&
        !items.some((database) => database.id === selectedDatabaseId)
      ) {
        handleDatabaseSelect(null);
      }

      // 각 DB에 대한 인스턴스 목록 가져오기
      const instancesMap = new Map<number, DatabaseInstanceListItem[]>();
      await Promise.all(
        items.map(async (db) => {
          try {
            const instances = await fetchInstancesByDatabase(db.id);
            instancesMap.set(db.id, instances);
          } catch (error) {
            console.warn(`[Database] DB ${db.id} 인스턴스 조회 실패:`, error);
            instancesMap.set(db.id, []);
          }
        })
      );
      setDbInstancesMap(instancesMap);
    } catch (error) {
      setFetchError(getErrorMessage(error));
    } finally {
      setIsFetching(false);
    }
  }, [handleDatabaseSelect, selectedDatabaseId]);

  useEffect(() => {
    void loadDatabases();
  }, [loadDatabases]);

  const handleAddDatabase = useCallback(
    async (payload: DatabaseCreatePayload) => {
      try {
        await createDatabaseInstance(payload);
        await loadDatabases();
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [loadDatabases]
  );

  const handleTestDatabase = useCallback(
    async (payload: DatabaseTestPayload): Promise<TestResultForList> => {
      try {
        const result = await testDatabaseInstance(payload);
        return {
          success: Boolean(result.success ?? true),
          message: result.message ?? undefined,
          errorMessage: result.errorMessage ?? undefined,
        };
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    []
  );

  const handleDeleteDatabase = useCallback(
    async (payload: DatabaseDeletePayload) => {
      try {
        await deleteDatabaseInstance(payload);

        if (selectedDatabaseId !== null && selectedDatabaseId === payload.id) {
          handleDatabaseSelect(null);
        }

        await loadDatabases();
      } catch (error) {
        throw new Error(getErrorMessage(error));
      }
    },
    [handleDatabaseSelect, loadDatabases, selectedDatabaseId]
  );

  return (
    <>
      {!showInfo ? (
        <div className="database-layout">
          <div className="database-layout-model">
            <div className="db-box">
              <List
                databases={dbList}
                selectedDatabaseId={selectedDatabaseId}
                onDatabaseSelect={handleDatabaseSelect}
                isLoading={isFetching}
                error={fetchError}
                onAddDatabase={handleAddDatabase}
                onTestDatabase={handleTestDatabase}
                onDeleteDatabase={handleDeleteDatabase}
              />

              <Canvas
                camera={{ position: [0, 0, 6], fov: 45 }}
                style={{ width: "100%", height: "100%" }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Environment preset="city" />

                <group scale={0.35}>
                  {dbList.map((db, i) => {
                    const instances = dbInstancesMap.get(db.id) ?? [];
                    const maxSeverity = getMaxSeverity(instances);
                    const dbColor = getSeverityColor(maxSeverity);

                    return (
                      <group
                        key={db.id}
                        position={[(i - (dbList.length - 1) / 2) * 7.0, -0.5, 0]}
                      >
                        <OracleDBModel
                          name={db.name}
                          ip={db.ip}
                          port={db.port}
                          account={db.account}
                          onClick={() => {}}
                          isZoomed={isDarkMode ? false : selectedDatabaseId === db.id}
                          showInfoCard
                          color={dbColor}
                        />
                      </group>
                    );
                  })}
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
