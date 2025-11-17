import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./InstanceList.scss";
import TableChart from "@/components/Chart/TableChart";
import Input from "@/components/Input/Input";
import SearchIcon from "@/assets/general/search.svg";
import TabMenu from "@/components/Tabs/TabMenu";
import Pagination from "@/components/Pagination/Pagination";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
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
} from "@/api/databases";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

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

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
};

const mapStatusToTab = (status?: string | null): StatusTab => {
  switch (status) {
    case "정상":
      return "normal";
    case "주의":
      return "warn";
    case "위험":
      return "danger";
    case "치명":
      return "error";
    default:
      return "warn";
  }
};

const getStatusClass = (status?: string | null) => {
  switch (status) {
    case "정상":
      return "normal";
    case "위험":
      return "danger";
    case "치명":
      return "error";
    case "주의":
    default:
      return "warn";
  }
};

const formatValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }
  return String(value);
};

const InstanceList: React.FC = () => {
  const [selectedDatabase, setSelectedDatabase] =
    useState<SelectedDatabaseInfo | null>(() => loadSelectedDatabase());
  const [instances, setInstances] = useState<InstanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSid, setCreateSid] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createTestResult, setCreateTestResult] =
    useState<DatabaseTestResult | null>(null);
  const [isCreateTesting, setIsCreateTesting] = useState(false);
  const [editTarget, setEditTarget] = useState<InstanceRow | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSid, setEditSid] = useState("");
  const [isEditTesting, setIsEditTesting] = useState(false);
  const [editTestResult, setEditTestResult] =
    useState<DatabaseTestResult | null>(null);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const navigate = useNavigate();

  const loadInstances = useCallback(async (databaseId: number) => {
    setIsLoading(true);
    try {
      const data = await fetchInstancesByDatabase(databaseId);
      setInstances(data);
      setError(null);
    } catch (err) {
      setInstances([]);
      setError(getErrorMessage(err));
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
      const tab = mapStatusToTab(item.status);
      if (tab !== "all") {
        acc[tab] += 1;
      }
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
      (item) => mapStatusToTab(item.status) === activeTab
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
    setCreateSid("");
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

    const sid = createSid.trim();
    if (!sid) {
      alert("SID를 입력해주세요.");
      return;
    }

    setIsCreateTesting(true);
    try {
      const result = await testInstanceForDatabase(selectedDatabase.id, {
        sid,
      });
      setCreateTestResult(result);
    } catch {
      setCreateTestResult({
        success: false,
        message: null,
        errorMessage: "테스트 연결 실패",
      });
    } finally {
      setIsCreateTesting(false);
    }
  }, [createSid, isCreateTesting, selectedDatabase]);

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

    const sid = createSid.trim();
    if (!sid) {
      alert("SID를 입력해주세요.");
      return;
    }

    setIsCreating(true);
    try {
      await createInstanceForDatabase(selectedDatabase.id, { sid });
      setIsCreateModalOpen(false);
      setCreateSid("");
      setCreateTestResult(null);
      await loadInstances(selectedDatabase.id);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }, [
    createSid,
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
      setEditSid(item.sid ?? "");
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

    const sid = editSid.trim();
    if (!sid) {
      alert("SID를 입력해주세요.");
      return;
    }

    setIsEditTesting(true);
    try {
      const result = await testInstanceForDatabase(selectedDatabase.id, {
        sid,
      });
      setEditTestResult(result);
    } catch {
      setEditTestResult({
        success: false,
        message: null,
        errorMessage: "테스트 연결 실패",
      });
    } finally {
      setIsEditTesting(false);
    }
  }, [editSid, editTarget, isEditTesting, selectedDatabase]);

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

    const sid = editSid.trim();
    if (!sid) {
      alert("SID를 입력해주세요.");
      return;
    }

    setIsEditSaving(true);
    try {
      await updateInstanceForDatabase(selectedDatabase.id, editTarget.id, {
        sid,
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
    editSid,
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

  const handleNavigateToDashboard = useCallback(
    (item: InstanceRow) => {
      if (!selectedDatabase) {
        alert("DB를 먼저 선택해주세요.");
        return;
      }

      try {
        sessionStorage.setItem(
          SELECTED_DB_STORAGE_KEY,
          JSON.stringify({
            id: selectedDatabase.id,
            name: selectedDatabase.name,
          })
        );
      } catch (error) {
        console.warn("[InstanceList] 선택한 DB 저장 실패", error);
      }

      try {
        sessionStorage.setItem(
          "selectedInstance",
          JSON.stringify({
            id: item.id,
            name: item.serverName ?? item.sid ?? `${item.id}`,
          })
        );
      } catch (error) {
        console.warn(
          "[InstanceList] 선택한 인스턴스를 저장하는 중 오류",
          error
        );
      }

      window.dispatchEvent(
        new CustomEvent("dashboard:selected-instance", {
          detail: {
            id: item.id,
            name: item.serverName ?? item.sid ?? `${item.id}`,
          },
        })
      );

      navigate(`/dashboard?instanceId=${item.id}`);
    },
    [navigate, selectedDatabase]
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
        const statusClass = getStatusClass(item.status);
        const statusLabel = item.status ?? "비활성";

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
          formatValue(item.cpuUsage),
          formatValue(item.sessionCount),
          formatValue(item.activeSessionCount),
          formatValue(item.lockWait),
          formatValue(item.pga),
          formatValue(item.sga),
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
              <div className="instance-list__header-actions">
                <Button
                  text="+ 생성"
                  size="sm"
                  variant="primary"
                  disabled={!selectedDatabase || isLoading}
                  onClick={openCreateModal}
                />
              </div>
            </div>

            {error && (
              <div className="instance-list__status instance-list__status--error">
                {error}
              </div>
            )}
            {isLoading ? (
              <div className="instance-list__status">로딩 중입니다...</div>
            ) : rows.length === 0 ? (
              <div className="instance-list__status">
                검색된 인스턴스가 없습니다.
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
          confirmText={isCreating ? "생성 중" : "확인"}
          onClose={() => {
            if (isCreating) return;
            setIsCreateModalOpen(false);
            setCreateSid("");
            setCreateTestResult(null);
          }}
          onConfirm={handleCreateInstance}
          onReset={handleCreateTest}
          fields={[
            {
              label: "SID",
              type: "textarea",
              placeholder: "SID를 입력해주세요.",
              value: createSid,
              onChange: (_label, val) => {
                setCreateSid(val);
                setCreateTestResult(null);
              },
            },
          ]}
        >
          {createTestResult && (
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
              label: "SID",
              type: "textarea",
              placeholder: "SID를 입력해주세요.",
              value: editSid,
              onChange: (_label, val) => {
                setEditSid(val);
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
