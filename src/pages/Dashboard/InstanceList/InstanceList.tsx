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
  const [data] = useState<DBItem[]>([
    {
      status: "정상",
      server: "db-prod-01",
      ip: "192.168.1.101",
      port: "3306",
      db: "production_db",
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
      ip: "192.168.1.102",
      port: "3306",
      db: "analytics_db",
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

  // SID 검색 필터
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
  const [isModalOpen, setIsModalOpen] = useState<
    null | "add" | "edit" | "delete"
  >(null);
  const [selectedItem, setSelectedItem] = useState<DBItem | null>(null);

  // 테스트 결과 상태
  const [testResult, setTestResult] = useState<null | "success" | "fail">(null);
  const navigate = useNavigate();

  const handleEdit = (item: DBItem) => {
    setSelectedItem(item);
    setIsModalOpen("edit");
  };

  const handleConfirm = () => {
    if (selectedItem) {
      alert(`${selectedItem.server} 정보가 수정되었습니다.`);
    }
    setIsModalOpen(null);
    setSelectedItem(null);
    setTestResult(null);
  };

  // 테스트
  const handleTest = () => {
    const isSuccess = Math.random() > 0.5;
    setTestResult(isSuccess ? "success" : "fail");
  };

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

      {/* 테이블 */}
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

      {/* 모달 */}
      {isModalOpen && (
        <Modal
          title="DB 수정"
          cancelText="테스트"
          confirmText="저장"
          onClose={() => {
            setIsModalOpen(null);
            setSelectedItem(null);
            setTestResult(null);
          }}
          onConfirm={handleConfirm}
          onReset={handleTest}
          fields={[
            {
              label: "Name",
              type: "textarea",
              placeholder: "새로운 Name을 입력해주세요.",
              ...(selectedItem && { value: selectedItem.server }),
            },
            {
              label: "IP",
              type: "textarea",
              placeholder: "새로운 IP를 입력해주세요.",
              ...(selectedItem && { value: selectedItem.ip }),
            },
            {
              label: "Port",
              type: "textarea",
              placeholder: "새로운 포트번호를 입력해주세요.",
              ...(selectedItem && { value: selectedItem.port }),
            },
            {
              label: "SID",
              type: "textarea",
              placeholder: "새로운 SID를 입력해주세요.",
              ...(selectedItem && { value: selectedItem.sid }),
            },
          ]}
        >
          {/* 결과 표시 */}
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
    </div>
  );
};

export default InstanceList;
