import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./InstanceList.scss";
import TableChart from "@/components/Chart/TableChart";
import Input from "@/components/Input/Input";
import SearchIcon from "@/assets/general/search.svg";
import TabMenu from "@/components/Tabs/TabMenu";
import Pagination from "@/components/Pagination/Pagination";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import EditIcon from "@/assets/general/edit.svg";
import TrashIcon from "@/assets/general/trash.svg";
import {
  fetchInstancesByDatabase,
  createInstanceForDatabase,
  updateInstanceForDatabase,
  deleteInstanceForDatabase,
  testInstanceForDatabase,
  type DatabaseInstanceListItem,
  type DatabaseTestResult,
} from "@/api/Databases/databases";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useSelectedInstanceStore } from "@/state/useInstanceStore";
import Spinner from "@/components/Spinner/Spinner";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

const SELECTED_DB_STORAGE_KEY = "selectedDatabase";
const ROWS_PER_PAGE = 10;

type StatusTab = "all" | "normal" | "warn" | "danger" | "error";

type SelectedDatabaseInfo = {
  id: number;
  name?: string;
};

type InstanceRow = DatabaseInstanceListItem;

type StatusCounts = Record<Exclude<StatusTab, "all">, number>;

const columns: { key: string; label: string }[] = [
  { key: "status", label: "상태" },
  { key: "serverName", label: "서버명" },
  { key: "ip", label: "IP" },
  { key: "port", label: "포트" },
  { key: "databaseName", label: "데이터베이스" },
  { key: "sid", label: "SID" },
  { key: "cpuUsage", label: "CPU 사용률" },
  { key: "sessionCount", label: "Session" },
  { key: "activeSessionCount", label: "Active Session" },
  { key: "lockWait", label: "Lock Wait" },
  { key: "pga", label: "PGA" },
  { key: "sga", label: "SGA" },
  { key: "actions", label: "작업" },
];

const loadSelectedDatabase = (): SelectedDatabaseInfo | null => {
  const stored = sessionStorage.getItem(SELECTED_DB_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as {
      id?: number | string;
      name?: string;
    };
    if (parsed?.id === undefined || parsed.id === null) {
      return null;
    }
    const numericId =
      typeof parsed.id === "number" ? parsed.id : Number(parsed.id);
    if (Number.isNaN(numericId)) return null;
    return {
      id: numericId,
      name: parsed.name ?? undefined,
    };
  } catch (error) {
    console.warn("[InstanceList] 저장된 DB 정보를 읽는 중 오류", error);
    return null;
  }
};

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
};

// currentSeverity 기준으로 탭 매핑 (null=정상, 1=주의, 2=위험, 3=치명)
const mapSeverityToTab = (currentSeverity?: number | null): StatusTab => {
  if (currentSeverity === null || currentSeverity === undefined) {
    return "normal"; // 정상
  }
  switch (currentSeverity) {
    case 1:
      return "warn"; // 주의
    case 2:
      return "danger"; // 위험
    case 3:
      return "error"; // 치명
    default:
      return "normal"; // 기본값은 정상
  }
};

// currentSeverity 기준으로 상태 클래스 결정
const getStatusClass = (currentSeverity?: number | null) => {
  if (currentSeverity === null || currentSeverity === undefined) {
    return "normal"; // 정상
  }
  switch (currentSeverity) {
    case 1:
      return "warn"; // 주의
    case 2:
      return "danger"; // 위험
    case 3:
      return "error"; // 치명
    default:
      return "normal"; // 기본값은 정상
  }
};

// currentSeverity 기준으로 상태 라벨 결정
const getStatusLabel = (currentSeverity?: number | null): string => {
  if (currentSeverity === null || currentSeverity === undefined) {
    return "정상";
  }
  switch (currentSeverity) {
    case 1:
      return "주의";
    case 2:
      return "위험";
    case 3:
      return "치명";
    default:
      return "정상";
  }
};

const formatValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return String(value);
};

// 게이지바 렌더링 헬퍼 함수
const renderGaugeBar = (
  value: string | number | null | undefined,
  isPercentage: boolean = false,
  maxValue: number = 100
) => {
  if (value === undefined || value === null || value === "") {
    return <span>-</span>;
  }

  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numValue)) {
    return <span>-</span>;
  }

  const percentage = Math.min(100, Math.max(0, (numValue / maxValue) * 100));
  const displayValue = isPercentage
    ? `${percentage.toFixed(1)}%`
    : numValue.toLocaleString();

  return (
    <div className="instance-gauge">
      <span className="instance-gauge__value">{displayValue}</span>
      <div className="instance-gauge__bar">
        <div
          className="instance-gauge__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const InstanceList: React.FC = () => {
  const [selectedDatabase, setSelectedDatabase] =
    useState<SelectedDatabaseInfo | null>(() => loadSelectedDatabase());

  const [instances, setInstances] = useState<InstanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createIdentifier, setCreateIdentifier] = useState("");
  const [createConnectionType, setCreateConnectionType] = useState<
    "SID" | "SERVICE_NAME"
  >("SID");
  const [isCreating, setIsCreating] = useState(false);
  const [createTestResult, setCreateTestResult] =
    useState<DatabaseTestResult | null>(null);
  const [isCreateTesting, setIsCreateTesting] = useState(false);

  const [editTarget, setEditTarget] = useState<InstanceRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editIdentifier, setEditIdentifier] = useState("");
  const [editConnectionType, setEditConnectionType] = useState<
    "SID" | "SERVICE_NAME"
  >("SID");
  const [isEditTesting, setIsEditTesting] = useState(false);
  const [editTestResult, setEditTestResult] =
    useState<DatabaseTestResult | null>(null);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const navigate = useNavigate();

  const { setInstance } = useSelectedInstanceStore();

  const loadInstances = useCallback(async (databaseId: number) => {
    setIsLoading(true);
    try {
      const data = await fetchInstancesByDatabase(databaseId);
      setInstances(data);
      // setError(null);
    } catch {
      setInstances([]);
      // setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedDatabase) {
      setInstances([]);
      return;
    }
    void loadInstances(selectedDatabase.id);
  }, [selectedDatabase, loadInstances]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.storageArea !== sessionStorage) return;
      if (event.key !== SELECTED_DB_STORAGE_KEY) return;
      setSelectedDatabase(loadSelectedDatabase());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, selectedDatabase]);

  const statusCounts = useMemo(() => {
    const initial: StatusCounts = {
      normal: 0,
      warn: 0,
      danger: 0,
      error: 0,
    };

    return instances.reduce((acc, item) => {
      const tab = mapSeverityToTab(item.currentSeverity);
      if (tab !== "all") acc[tab] += 1;
      return acc;
    }, initial);
  }, [instances]);

  const tabs = useMemo(
    () =>
      [
        { id: "all", label: `전체(${instances.length})` },
        { id: "normal", label: `정상(${statusCounts.normal})` },
        { id: "warn", label: `주의(${statusCounts.warn})` },
        { id: "danger", label: `위험(${statusCounts.danger})` },
        { id: "error", label: `치명(${statusCounts.error})` },
      ] as const,
    [instances.length, statusCounts]
  );

  const filteredByStatus = useMemo(() => {
    if (activeTab === "all") return instances;
    return instances.filter(
      (item) => mapSeverityToTab(item.currentSeverity) === activeTab
    );
  }, [instances, activeTab]);

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return filteredByStatus;
    return filteredByStatus.filter((item) =>
      (item.sid ?? "").toLowerCase().includes(term)
    );
  }, [filteredByStatus, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / ROWS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openCreateModal = useCallback(() => {
    if (!selectedDatabase) {
      alert("DB를 먼저 선택해주세요.");
      return;
    }
    setCreateIdentifier("");
    setCreateConnectionType("SID");
    setCreateTestResult(null);
    setIsCreateTesting(false);
    setIsCreateModalOpen(true);
  }, [selectedDatabase]);

  const handleCreateTest = useCallback(async () => {
    if (isCreateTesting) return;
    if (!selectedDatabase) {
      alert("DB를 먼저 선택해주세요.");
      return;
    }

    const identifier = createIdentifier.trim();
    if (!identifier) {
      alert(
        createConnectionType === "SID"
          ? "SID를 입력해주세요."
          : "서비스 이름을 입력해주세요."
      );
      return;
    }

    setIsCreateTesting(true);
    try {
      const result = await testInstanceForDatabase(selectedDatabase.id, {
        identifier,
        connectionType: createConnectionType,
      });
      setCreateTestResult(result);
    } catch {
      setCreateTestResult({
        success: false,
        message: null,
        errorMessage: "데이터베이스 연결에 실패했습니다.",
      });
    } finally {
      setIsCreateTesting(false);
    }
  }, [
    createIdentifier,
    createConnectionType,
    isCreateTesting,
    selectedDatabase,
  ]);

  const handleCreateInstance = useCallback(async () => {
    if (isCreating) return;
    if (!selectedDatabase) {
      alert("DB를 먼저 선택해주세요.");
      return;
    }

    if (!createTestResult || !createTestResult.success) {
      alert("저장 전에 테스트를 먼저 수행해주세요.");
      return;
    }

    const identifier = createIdentifier.trim();
    if (!identifier) {
      alert(
        createConnectionType === "SID"
          ? "SID를 입력해주세요."
          : "서비스 이름을 입력해주세요."
      );
      return;
    }

    setIsCreating(true);
    try {
      await createInstanceForDatabase(selectedDatabase.id, {
        identifier,
        connectionType: createConnectionType,
      });
      setIsCreateModalOpen(false);
      setCreateIdentifier("");
      setCreateConnectionType("SID");
      setCreateTestResult(null);
      await loadInstances(selectedDatabase.id);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }, [
    createIdentifier,
    createConnectionType,
    createTestResult,
    isCreating,
    loadInstances,
    selectedDatabase,
  ]);

  const openEditModal = useCallback(
    (item: InstanceRow) => {
      if (!selectedDatabase) {
        alert("DB를 먼저 선택해주세요.");
        return;
      }
      setEditTarget(item);
      setEditIdentifier(item.sid ?? "");
      setEditConnectionType("SID"); // 기본값, 실제로는 API에서 받아와야 하지만 일단 기본값 사용
      setEditTestResult(null);
      setIsEditTesting(false);
      setIsEditSaving(false);
      setIsEditModalOpen(true);
    },
    [selectedDatabase]
  );

  const handleEditTest = useCallback(async () => {
    if (isEditTesting) return;
    if (!selectedDatabase || !editTarget) {
      alert("DB를 먼저 선택해주세요.");
      return;
    }

    const identifier = editIdentifier.trim();
    if (!identifier) {
      alert(
        editConnectionType === "SID"
          ? "SID를 입력해주세요."
          : "서비스 이름을 입력해주세요."
      );
      return;
    }

    setIsEditTesting(true);
    try {
      const result = await testInstanceForDatabase(selectedDatabase.id, {
        identifier,
        connectionType: editConnectionType,
      });
      setEditTestResult(result);
    } catch {
      setEditTestResult({
        success: false,
        message: null,
        errorMessage: "데이터베이스 연결에 실패했습니다.",
      });
    } finally {
      setIsEditTesting(false);
    }
  }, [
    editIdentifier,
    editConnectionType,
    editTarget,
    isEditTesting,
    selectedDatabase,
  ]);

  const handleUpdateInstance = useCallback(async () => {
    if (isEditSaving) return;
    if (!selectedDatabase || !editTarget) {
      alert("DB를 먼저 선택해주세요.");
      return;
    }

    if (!editTestResult || !editTestResult.success) {
      alert("저장 전에 테스트를 먼저 수행해주세요.");
      return;
    }

    const identifier = editIdentifier.trim();
    if (!identifier) {
      alert(
        editConnectionType === "SID"
          ? "SID를 입력해주세요."
          : "서비스 이름을 입력해주세요."
      );
      return;
    }

    setIsEditSaving(true);
    try {
      await updateInstanceForDatabase(selectedDatabase.id, editTarget.id, {
        identifier,
        connectionType: editConnectionType,
      });
      setIsEditModalOpen(false);
      setEditTarget(null);
      setEditTestResult(null);
      await loadInstances(selectedDatabase.id);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsEditSaving(false);
    }
  }, [
    editIdentifier,
    editConnectionType,
    editTarget,
    editTestResult,
    isEditSaving,
    loadInstances,
    selectedDatabase,
  ]);

  const handleDeleteInstance = useCallback(
    async (item: InstanceRow) => {
      if (!selectedDatabase) {
        alert("DB를 먼저 선택해주세요.");
        return;
      }

      if (!window.confirm("정말 삭제하시겠습니까?")) {
        return;
      }

      try {
        await deleteInstanceForDatabase(selectedDatabase.id, item.id);
        await loadInstances(selectedDatabase.id);
      } catch (err) {
        alert(getErrorMessage(err));
      }
    },
    [loadInstances, selectedDatabase]
  );

  // 전역 setInstance
  const handleNavigateToDashboard = useCallback(
    (item: InstanceRow) => {
      if (!selectedDatabase) {
        alert("DB를 먼저 선택해주세요.");
        return;
      }

      const name = item.serverName ?? item.sid ?? `${item.id}`;

      // 전역 상태 저장
      setInstance(item.id, name);

      try {
        sessionStorage.setItem(
          SELECTED_DB_STORAGE_KEY,
          JSON.stringify({
            id: selectedDatabase.id,
            name: selectedDatabase.name,
          })
        );
      } catch {
        /* empty */
      }

      try {
        sessionStorage.setItem(
          "selectedInstance",
          JSON.stringify({
            id: item.id,
            name,
          })
        );
      } catch {
        /* empty */
      }

      window.dispatchEvent(
        new CustomEvent("dashboard:selected-instance", {
          detail: {
            id: item.id,
            name,
          },
        })
      );

      navigate(`/dashboard?instanceId=${item.id}`);
    },
    [navigate, selectedDatabase, setInstance]
  );

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE
      ),
    [filteredData, currentPage]
  );

  const rows = useMemo(
    () =>
      paginatedData.map((item) => {
        const statusClass = getStatusClass(item.currentSeverity);
        const statusLabel = getStatusLabel(item.currentSeverity);

        return [
          <div
            key={`status-${item.id}`}
            className={`status status--${statusClass}`}
            title={statusLabel}
          />,

          <span
            key={`server-${item.id}`}
            className="link"
            onClick={() => handleNavigateToDashboard(item)}
          >
            {formatValue(item.serverName)}
          </span>,

          formatValue(item.ip),
          formatValue(item.port),
          formatValue(item.databaseName),
          formatValue(item.sid),
          renderGaugeBar(item.cpuUsage, true, 100), // CPU: 퍼센트
          renderGaugeBar(item.sessionCount, false, 1000), // Session: 숫자값
          renderGaugeBar(item.activeSessionCount, false, 1000), // Active Session: 숫자값
          renderGaugeBar(item.lockWait, false, 100), // Lock Wait: 숫자값
          renderGaugeBar(item.pga, true, 100), // PGA: 퍼센트
          renderGaugeBar(item.sga, true, 100), // SGA: 퍼센트
          <div key={`actions-${item.id}`} className="table-actions">
            <img
              src={EditIcon}
              alt="Edit"
              className="action-btn edit"
              onClick={() => openEditModal(item)}
            />
            <img
              src={TrashIcon}
              alt="Delete"
              className="action-btn delete"
              onClick={() => handleDeleteInstance(item)}
            />
          </div>,
        ];
      }),
    [
      paginatedData,
      handleDeleteInstance,
      openEditModal,
      handleNavigateToDashboard,
    ]
  );

  return (
    <div className="instance-list">
      <div className="instance-list__header">
        <div className="instance-list__header-actions"></div>
      </div>

      {!selectedDatabase ? (
        <div className="instance-list__empty">
          인스턴스 맵에서 DB를 선택하면 목록이 표시됩니다.
        </div>
      ) : (
        <>
          <TabMenu
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as StatusTab)}
          />

          <div className="instance-list__table-wrapper">
            <div className="instance-list__table-header">
              <Input
                size="sm"
                variant="default"
                placeholder="SID를 입력해주세요."
                icon={SearchIcon}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                text="생성"
                size="sm"
                variant="primary"
                onClick={openCreateModal}
              />
            </div>

            {isLoading ? (
              <Spinner message="목록 불러오는 중..." />
            ) : rows.length === 0 ? (
              <div className="instance-list__status">
                표시할 인스턴스가 없습니다.
              </div>
            ) : (
              <TableChart size="lg" columns={columns} rows={rows} />
            )}

            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      {isCreateModalOpen && (
        <Modal
          title="인스턴스 생성"
          cancelText={isCreateTesting ? "테스트 중" : "테스트"}
          confirmText={isCreating ? "저장 중" : "저장"}
          onClose={() => {
            if (isCreating) return;
            setIsCreateModalOpen(false);
            setCreateIdentifier("");
            setCreateConnectionType("SID");
            setCreateTestResult(null);
          }}
          onConfirm={handleCreateInstance}
          onReset={handleCreateTest}
          fields={[
            {
              label: "연결 타입",
              type: "radio",
              options: ["SID", "SERVICE_NAME"],
              value: createConnectionType,
              onChange: (_label, val) => {
                setCreateConnectionType(val as "SID" | "SERVICE_NAME");
                setCreateTestResult(null);
              },
            },
            {
              label: createConnectionType === "SID" ? "SID" : "서비스 이름",
              type: "textarea",
              placeholder:
                createConnectionType === "SID"
                  ? "SID를 입력해주세요. (예: ORCL)"
                  : "서비스 이름을 입력해주세요. (예: orcl.example.com)",
              value: createIdentifier,
              onChange: (_label, val) => {
                setCreateIdentifier(val);
                setCreateTestResult(null);
              },
            },
          ]}
        >
          {isCreateTesting && (
            <div className="modal__test-result">⏳ 연결 테스트 중입니다...</div>
          )}
          {!isCreateTesting && createTestResult && (
            <div
              className={`modal__test-result ${
                createTestResult.success ? "success" : "fail"
              }`}
            >
              {createTestResult.success ? "✅ " : "❌ "}
              {createTestResult.success
                ? createTestResult.message ?? "테스트에 성공했습니다."
                : createTestResult.errorMessage ?? "테스트에 실패했습니다."}
            </div>
          )}
        </Modal>
      )}

      {isEditModalOpen && editTarget && (
        <Modal
          title="DB 수정"
          cancelText={isEditTesting ? "테스트 중" : "테스트"}
          confirmText={isEditSaving ? "저장 중" : "저장"}
          onClose={() => {
            if (isEditSaving) return;
            setIsEditModalOpen(false);
            setEditTarget(null);
            setEditTestResult(null);
          }}
          onConfirm={handleUpdateInstance}
          onReset={handleEditTest}
          fields={[
            {
              label: "연결 타입",
              type: "radio",
              options: ["SID", "SERVICE_NAME"],
              value: editConnectionType,
              onChange: (_label, val) => {
                setEditConnectionType(val as "SID" | "SERVICE_NAME");
                setEditTestResult(null);
              },
            },
            {
              label: editConnectionType === "SID" ? "SID" : "서비스 이름",
              type: "textarea",
              placeholder:
                editConnectionType === "SID"
                  ? "SID를 입력해주세요. (예: ORCL)"
                  : "서비스 이름을 입력해주세요. (예: orcl.example.com)",
              value: editIdentifier,
              onChange: (_label, val) => {
                setEditIdentifier(val);
                setEditTestResult(null);
              },
            },
          ]}
        >
          {editTestResult && (
            <div
              className={`modal__test-result ${
                editTestResult.success ? "success" : "fail"
              }`}
            >
              {editTestResult.success ? "✅ " : "❌ "}
              {editTestResult.success
                ? editTestResult.message ?? "테스트에 성공했습니다."
                : editTestResult.errorMessage ?? "테스트에 실패했습니다."}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default InstanceList;