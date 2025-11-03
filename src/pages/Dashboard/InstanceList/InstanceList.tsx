import React, { useState } from "react";
import "./InstanceList.scss";
import TableChart from "@/components/Chart/TableChart";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import EditIcon from "@/assets/general/edit.svg";
import TrashIcon from "@/assets/general/trash.svg";
import Input from "@/components/Input/Input";
import TabMenu from "@/components/Tabs/TabMenu";
import { useNavigate } from "react-router-dom";

interface DBItem {
  status: string;
  server: string;
  ip: string;
  port: string;
  db: string;
  sid: string;
  cpu: string;
  session: string;
  activeSession: string;
  lockWait: string;
  pga: string;
  sga: string;
}

const InstanceList: React.FC = () => {
  const [data, setData] = useState<DBItem[]>([
    {
      status: "정상",
      server: "db-prod-01",
      ip: "192.168.1.101",
      port: "3306",
      db: "ccdb-database",
      sid: "ORCL001",
      cpu: "65%",
      session: "24",
      activeSession: "7",
      lockWait: "0.8ms",
      pga: "1.25M",
      sga: "8,540",
    },
    {
      status: "주의",
      server: "db-prod-02",
      ip: "192.168.1.101",
      port: "3306",
      db: "ccdb-database",
      sid: "ORCL002",
      cpu: "82%",
      session: "48",
      activeSession: "12",
      lockWait: "2.3ms",
      pga: "2.15M",
      sga: "15,240",
    },
  ]);

  const columns = [
    "상태",
    "서버명",
    "IP",
    "포트",
    "데이터베이스",
    "SID",
    "CPU 사용률",
    "Session",
    "Active Session",
    "Lock Wait",
    "PGA",
    "SGA",
    "작업",
  ];

  type StatusTab = "all" | "normal" | "warn" | "danger" | "error";
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { id: "all", label: "전체" },
    { id: "normal", label: "무해" },
    { id: "warn", label: "주의" },
    { id: "danger", label: "위험" },
    { id: "error", label: "장애" },
  ] as const;

  const filteredData = data.filter((item) =>
    item.sid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState<null | "add" | "edit">(null);
  const [, setSelectedItem] = useState<DBItem | null>(null);
  const [inputs, setInputs] = useState({
    name: "",
    ip: "",
    port: "",
    sid: "",
  });
  const [newDB, setNewDB] = useState({ sid: "" });
  const [editDB, setEditDB] = useState({ name: "", ip: "", port: "", sid: "" });
  const [testResult, setTestResult] = useState<null | "success" | "fail">(null);

  const navigate = useNavigate();

  // 수정 아이콘 핸들러
  const handleEdit = (item: DBItem) => {
    setSelectedItem(item);
    setInputs({
      name: item.server,
      ip: item.ip,
      port: item.port,
      sid: item.sid,
    });
    setIsModalOpen("edit");
    setTestResult(null);
  };

  // 테스트 버튼 핸들러
  const handleTest = () => {
    // 이전 테스트 결과 초기화
    setTestResult(null);

    // 입력란이 비어있을 경우 알림 처리
    if (!inputs.sid.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    const isSuccess = Math.random() > 0.5;
    setTestResult(isSuccess ? "success" : "fail");
  };

  // 저장 버튼 핸들러
  const handleConfirm = () => {
    const allFilled = Object.values(inputs).every((v) => v.trim() !== "");
    if (!allFilled) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (!testResult) {
      alert("저장 전에 테스트를 먼저 수행해주세요.");
      return;
    }
    if (testResult === "fail") {
      alert("테스트에 실패했습니다. 연결 정보를 확인해주세요.");
      return;
    }

    alert(`${editDB.name} 정보가 성공적으로 수정되었습니다.`);
    setEditDB({ name: "", ip: "", port: "", sid: "" });
    setIsModalOpen(null);
  };

  // 인스턴스 생성 - 확인 버튼 핸들러
  const handleAdd = () => {
    if (!newDB.sid.trim()) {
      alert("SID를 입력해주세요.");
      return;
    }

    setData((prev) => [
      ...prev,
      {
        status: "정상",
        server: "ccdb-server",
        ip: "192.168.1.101",
        port: "3306",
        db: "ccdb-database",
        sid: newDB.sid,
        cpu: "0%",
        session: "0",
        activeSession: "0",
        lockWait: "0ms",
        pga: "0M",
        sga: "0",
      },
    ]);

    alert(`${newDB.sid} 인스턴스가 추가되었습니다.`);
    setNewDB({ sid: "" });
    setIsModalOpen(null);
  };

  // 테이블 데이터
  const rows = paginatedData.map((item, index) => [
    <div
      key={`status-${index}`}
      className={`status status--${
        item.status === "정상"
          ? "normal"
          : item.status === "주의"
          ? "warn"
          : "danger"
      }`}
    />,
    <span key={`server-${index}`} className="link">
      {item.server}
    </span>,
    item.ip,
    item.port,
    item.db,
    item.sid,
    item.cpu,
    item.session,
    item.activeSession,
    item.lockWait,
    item.pga,
    item.sga,
    <div key={`actions-${index}`} className="table-actions">
      <img
        src={EditIcon}
        alt="Edit"
        className="action-btn edit"
        onClick={() => handleEdit(item)}
      />
      <img
        src={TrashIcon}
        alt="Delete"
        className="action-btn delete"
        onClick={() => alert("정상적으로 삭제되었습니다.")}
      />
    </div>,
  ]);

  return (
    <div className="instance-list">
      {/* 헤더 */}
      <div className="instance-list__header">
        <TabMenu
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as StatusTab)}
        />

        <div className="instance-list__header-right">
          <Input
            size="sm"
            variant="default"
            placeholder="SID를 입력해주세요."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            text="+ 인스턴스 생성"
            size="sm"
            variant="primary"
            onClick={() => setIsModalOpen("add")}
          />
        </div>
      </div>

      {/* 테이블 차트 */}
      <TableChart
        size="lg"
        columns={columns}
        rows={rows}
        onClick={() => navigate("/dashboard")}
      />
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* 수정 모달 */}
      {isModalOpen === "edit" && (
        <Modal
          title="DB 수정"
          cancelText="테스트"
          confirmText="저장"
          onClose={() => {
            setIsModalOpen(null);
          }}
          onConfirm={handleConfirm}
          onReset={handleTest}
          fields={[
            {
              label: "DB NAME ",
              placeholder: "DB 이름을 입력해주세요.",
              type: "textarea",
              value: inputs.name,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, name: val })),
            },
            {
              label: "DB IP ",
              placeholder: "DB IP를 입력해주세요.",
              type: "textarea",
              value: inputs.ip,
              onChange: (_, val) => setInputs((prev) => ({ ...prev, ip: val })),
            },
            {
              label: "DB PORT ",
              placeholder: "DB 포트를 입력해주세요.",
              type: "textarea",
              value: inputs.port,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, port: val })),
            },
            {
              label: "SID ",
              placeholder: "SID를 입력해주세요.",
              type: "textarea",
              value: inputs.sid,
              onChange: (_, val) =>
                setInputs((prev) => ({ ...prev, sid: val })),
            },
          ]}
        >
          {/* 테스트 결과 */}
          {testResult && (
            <div className="modal__test-result">
              {testResult === "success" ? (
                <div className="success">✅ 테스트 성공</div>
              ) : (
                <div className="fail">❌ 테스트 실패: 연결 오류</div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* 인스턴스 추가 모달 */}
      {isModalOpen === "add" && (
        <Modal
          title="인스턴스 생성"
          cancelText="취소"
          confirmText="확인"
          onClose={() => setIsModalOpen(null)}
          onConfirm={handleAdd}
          fields={[
            {
              label: "SID ",
              placeholder: "SID를 입력해주세요.",
              type: "textarea",
              value: newDB.sid,
              onChange: (val) => setNewDB({ ...newDB, sid: val as string }),
            },
          ]}
        />
      )}
    </div>
  );
};

export default InstanceList;
