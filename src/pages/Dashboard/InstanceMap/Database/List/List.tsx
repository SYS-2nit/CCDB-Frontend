/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./List.scss";
import DatabaseItem from "./Item";
import ArrowFillTopIcon from "@/assets/general/arrow-fill-top.svg";
import ArrowFillBottomIcon from "@/assets/general/arrow-fill-bottom.svg";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import SearchIcon from "@/assets/general/search.svg";
import { isAxiosError } from "axios";
import {
  fetchInstancesByDatabase,
  type DatabaseCreatePayload,
  type DatabaseDeletePayload,
  type DatabaseTestPayload,
} from "@/api/Databases/databases";
import Spinner from "@/components/Spinner/Spinner";

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

type TestFeedback = {
  status: "success" | "fail";
  message?: string;
};

type FormState = {
  name: string;
  ip: string;
  port: string;
  account: string;
  password: string;
  identifier: string;
  connectionType: "SID" | "SERVICE_NAME";
};

type ListProps = {
  databases: DatabaseListItem[];
  isLoading?: boolean;
  error?: string | null;
  selectedDatabaseId?: number | null;
  onAddDatabase: (payload: DatabaseCreatePayload) => Promise<void>;
  onTestDatabase: (
    payload: DatabaseTestPayload
  ) => Promise<{ success: boolean; message?: string; errorMessage?: string }>;
  onDeleteDatabase?: (payload: DatabaseDeletePayload) => Promise<void>;
  onDatabaseSelect?: (database: DatabaseListItem | null) => void;
};

type ModalType = null | "add" | "delete";

const INITIAL_INPUTS: FormState = {
  name: "",
  ip: "",
  port: "",
  account: "",
  password: "",
  identifier: "",
  connectionType: "SID",
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

const List: React.FC<ListProps> = ({
  databases,
  isLoading = false,
  error,
  selectedDatabaseId,
  onAddDatabase,
  onTestDatabase,
  onDeleteDatabase,
  onDatabaseSelect,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<ModalType>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputs, setInputs] = useState<FormState>(INITIAL_INPUTS);
  const [testFeedback, setTestFeedback] = useState<TestFeedback | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [hoveredDbId, setHoveredDbId] = useState<number | null>(null);
  const [instanceList, setInstanceList] = useState<any[]>([]);

  // DB hover 시 해당 DB의 인스턴스 가져오는 함수
  const handleDbHover = async (dbId: number) => {
    setHoveredDbId(dbId);
    try {
      const data = await fetchInstancesByDatabase(dbId);
      console.log("[인스턴스 목록] DB ID:", dbId, "인스턴스 데이터:", data);
      console.log(
        "[인스턴스 목록] 각 인스턴스 ID:",
        data.map((i) => ({ id: i.id, sid: i.sid }))
      );
      setInstanceList(data);
    } catch (err) {
      console.log("인스턴스 목록 조회 오류:", err);
    }
  };

  // DB hover out 시 팝업 닫기
  const handleDbLeave = () => {
    setHoveredDbId(null);
  };

  // 인스턴스 클릭 핸들러 (클로저 문제 방지)
  const handleInstanceClick = useCallback(
    (instanceId: number, instanceSid: string | null) => {
      console.log(
        `[인스턴스 클릭 핸들러] id=${instanceId}, sid=${instanceSid}`
      );
      console.log(
        `[인스턴스 클릭 핸들러] 현재 instanceList:`,
        instanceList.map((i) => ({ id: i.id, sid: i.sid }))
      );
      navigate(`/dashboard?instanceId=${instanceId}`);
    },
    [navigate, instanceList]
  );

  // DB 필터
  const filteredDatabases = useMemo(
    () =>
      databases.filter((db) =>
        db.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [databases, searchTerm]
  );

  // DB 선택
  const selectedDatabase = useMemo(
    () =>
      selectedDatabaseId == null
        ? null
        : databases.find((db) => db.id === selectedDatabaseId) ?? null,
    [databases, selectedDatabaseId]
  );

  useEffect(() => {
    setDeletePassword("");
  }, [selectedDatabaseId]);

  const resetAddForm = () => {
    setInputs(INITIAL_INPUTS);
    setTestFeedback(null);
  };

  const handleTest = async () => {
    if (isTesting) return;

    const values = Object.values(inputs);
    const allFilled = values.every((value) => value.trim() !== "");

    if (!allFilled) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    const portValue = Number(inputs.port.trim());
    if (Number.isNaN(portValue)) {
      alert("포트 번호는 숫자여야 합니다.");
      return;
    }

    setIsTesting(true);

    try {
      const result = await onTestDatabase({
        ip: inputs.ip.trim(),
        port: portValue,
        account: inputs.account.trim(),
        password: inputs.password,
        identifier: inputs.identifier.trim(),
        connectionType: inputs.connectionType || "SID",
      });

      if (result.success) {
        setTestFeedback({
          status: "success",
          message: result.message ?? "DB 연결에 성공했습니다.",
        });
      } else {
        setTestFeedback({
          status: "fail",
          message:
            result.errorMessage ??
            result.message ??
            "테스트에 실패했습니다. 연결 정보를 확인해주세요.",
        });
      }
    } catch (error) {
      setTestFeedback({
        status: "fail",
        message: "데이터베이스 연결에 실패했습니다.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleConfirm = async () => {
    if (isSaving) return;

    const values = Object.values(inputs);
    const allFilled = values.every((value) => value.trim() !== "");

    if (!allFilled) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!testFeedback || testFeedback.status !== "success") {
      alert("저장 전에 연결 테스트를 먼저 수행해주세요.");
      return;
    }

    const portValue = Number(inputs.port.trim());
    if (Number.isNaN(portValue)) {
      alert("포트 번호는 숫자여야 합니다.");
      return;
    }

    setIsSaving(true);

    try {
      await onAddDatabase({
        name: inputs.name.trim(),
        ip: inputs.ip.trim(),
        port: portValue,
        account: inputs.account.trim(),
        password: inputs.password,
        identifier: inputs.identifier.trim(),
        connectionType: inputs.connectionType || "SID",
      });

      alert(`${inputs.name} DB가 추가되었습니다.`);
      setIsModalOpen(null);
      resetAddForm();
    } catch (error) {
      console.error("[Database] 저장 실패:", error);
      const errorMessage = getErrorMessage(error);
      alert(`데이터베이스 저장에 실패했습니다.\n${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteDatabase) {
      alert("삭제 기능은 아직 지원되지 않습니다.");
      return;
    }

    if (selectedDatabaseId === null || !selectedDatabase) {
      alert("삭제할 DB를 선택해주세요.");
      return;
    }

    const password = deletePassword.trim();
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      await onDeleteDatabase({ id: selectedDatabase.id, password });
      alert(`${selectedDatabase.name} 데이터베이스가 삭제되었습니다.`);
      setIsModalOpen(null);
      setDeletePassword("");
      onDatabaseSelect?.(null);
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="db-list">
      <div className="db-list-header">
        목록 ({filteredDatabases.length})
        <img
          src={isCollapsed ? ArrowFillBottomIcon : ArrowFillTopIcon}
          alt="toggle"
          onClick={() => setIsCollapsed((prev) => !prev)}
          style={{ cursor: "pointer" }}
        />
      </div>

      {!isCollapsed && (
        <>
          <div className="db-list-body">
            <Input
              size="lg"
              icon={SearchIcon}
              placeholder="이름을 입력해주세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {isLoading ? (
              <Spinner message="목록 불러오는 중..." />
            ) : error ? (
              <div className="db-list__status db-list__status--error">
                {error}
              </div>
            ) : filteredDatabases.length === 0 ? (
              <div className="db-list__status">
                등록된 데이터베이스가 없습니다.
              </div>
            ) : (
              filteredDatabases.map((db) => (
                <div
                  key={db.id}
                  className="db-item-wrapper"
                  onMouseEnter={() => handleDbHover(db.id)}
                  onMouseLeave={handleDbLeave}
                >
                  <DatabaseItem
                    name={db.name}
                    updatedAt={db.updatedAt ?? undefined}
                    selected={db.id === selectedDatabaseId}
                    onSelect={(checked) =>
                      onDatabaseSelect?.(checked ? db : null)
                    }
                    onClick={() => {
                      onDatabaseSelect?.(db);
                      navigate("/dashboard/instance-list");
                    }}
                  />

                  {/* 오른쪽에 뜨는 인스턴스 팝업 */}
                  {hoveredDbId === db.id && instanceList.length > 0 && (
                    <div className="instance-popup">
                      {instanceList.map((instance, index) => {
                        // 각 인스턴스의 id를 명시적으로 저장하여 클로저 문제 방지
                        const instanceId = instance.id;
                        const instanceSid = instance.sid;

                        // 디버깅: 각 인스턴스의 id 확인
                        console.log(
                          `[인스턴스 팝업 렌더링] 인덱스 ${index}: id=${instanceId}, sid=${instanceSid}`
                        );

                        return (
                          <div
                            key={`${db.id}-${instanceId}-${index}`}
                            className="instance-popup-item"
                            onClick={() =>
                              handleInstanceClick(instanceId, instanceSid)
                            }
                          >
                            {instanceSid}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="db-list-footer">
            <Button
              text="삭제"
              size="sm"
              variant="error"
              disabled={selectedDatabaseId === null}
              onClick={() => {
                if (selectedDatabaseId === null) {
                  alert("삭제할 DB를 선택해주세요.");
                  return;
                }
                setDeletePassword("");
                setIsModalOpen("delete");
              }}
            />
            <Button
              text="추가"
              size="sm"
              variant="primary"
              onClick={() => {
                resetAddForm();
                setIsModalOpen("add");
              }}
            />
          </div>
        </>
      )}

      {isModalOpen === "add" && (
        <Modal
          title="데이터베이스 생성"
          cancelText={isTesting ? "테스트 중" : "테스트"}
          confirmText={isSaving ? "저장 중" : "저장"}
          onClose={() => {
            setIsModalOpen(null);
            resetAddForm();
          }}
          onReset={handleTest}
          onConfirm={handleConfirm}
          fields={[
            {
              label: "Name",
              type: "textarea",
              placeholder: "DB 이름을 입력해주세요.",
              value: inputs.name,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, name: val })),
            },
            {
              label: "IP",
              type: "textarea",
              placeholder: "DB IP를 입력해주세요.",
              value: inputs.ip,
              onChange: (_, val) => setInputs((prev) => ({ ...prev, ip: val })),
            },
            {
              label: "Port",
              type: "textarea",
              placeholder: "DB 포트번호를 입력해주세요.",
              value: inputs.port,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, port: val })),
            },
            {
              label: "Account",
              type: "textarea",
              placeholder: "DB 계정을 입력해주세요.",
              value: inputs.account,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, account: val })),
            },
            {
              label: "Password",
              type: "textarea",
              placeholder: "비밀번호를 입력해주세요.",
              value: inputs.password,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, password: val })),
            },
            {
              label: "연결 타입",
              type: "radio",
              options: ["SID", "SERVICE_NAME"],
              value: inputs.connectionType,
              onChange: (_, val) =>
                setInputs((prev) => ({
                  ...prev,
                  connectionType: val as "SID" | "SERVICE_NAME",
                })),
            },
            {
              label: inputs.connectionType === "SID" ? "SID" : "서비스 이름",
              type: "textarea",
              placeholder:
                inputs.connectionType === "SID"
                  ? "SID를 입력해주세요. (예: ORCL)"
                  : "서비스 이름을 입력해주세요. (예: orcl.example.com)",
              value: inputs.identifier,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, identifier: val })),
            },
          ]}
        >
          {isTesting && (
            <div className="modal__test-result">⏳ 연결 테스트 중입니다...</div>
          )}
          {!isTesting && testFeedback && (
            <div className={`modal__test-result ${testFeedback.status}`}>
              {testFeedback.status === "success" ? "✅ " : "❌ "}
              {testFeedback.message}
            </div>
          )}
        </Modal>
      )}

      {isModalOpen === "delete" && (
        <Modal
          title="데이터베이스 삭제"
          cancelText="취소"
          confirmText="확인"
          onClose={() => {
            setIsModalOpen(null);
            setDeletePassword("");
          }}
          onConfirm={handleDelete}
          fields={[
            {
              label: "Password",
              type: "textarea",
              placeholder: "삭제할 DB의 비밀번호를 입력해주세요.",
              value: deletePassword,
              onChange: (_label, val) => setDeletePassword(val),
            },
          ]}
        >
          {selectedDatabase && (
            <div className="modal__custom-content">
              선택한 DB: <strong>{selectedDatabase.name}</strong>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default List;
