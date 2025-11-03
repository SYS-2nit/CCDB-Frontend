import React, { useState } from "react";
import "./InstanceList.scss";
import TableChart from "@/components/Chart/TableChart";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Pagination from "@/components/Pagination/Pagination";
import EditIcon from "@/assets/general/edit.svg";
import TrashIcon from "@/assets/general/trash.svg";

const InstanceList: React.FC = () => {
  const columns = [
    "상태",
    "서버명",
    "IP",
    "포트",
    "데이터베이스",
    "CPU 사용률",
    "Session",
    "Active Session",
    "Lock Wait",
    "PGA",
    "SGA",
    "작업",
  ];

  const data = [
    {
      status: "정상",
      server: "db-prod-01",
      ip: "192.168.1.101",
      port: "3306",
      db: "production_db",
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
      cpu: "82%",
      session: "48",
      activeSession: "12",
      lockWait: "2.3ms",
      pga: "2.15M",
      sga: "15,240",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const [isModalOpen, setIsModalOpen] = useState<
    null | "add" | "delete" | "edit"
  >(null);

  const handleConfirm = () => {
    alert("변경 사항이 저장되었습니다.");
    setIsModalOpen(null);
  };

  const handleEdit = (server: string) => {
    console.log(`${server} 수정 모달 오픈`);
    setIsModalOpen("edit");
  };

  const handleDelete = (server: string) => {
    const confirmDelete = window.confirm(`${server}을(를) 삭제하시겠습니까?`);
    if (confirmDelete) alert(`${server} 삭제 완료`);
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
        onClick={() => handleEdit(item.server)}
      />
      <img
        src={TrashIcon}
        alt="Delete"
        className="action-btn delete"
        onClick={() => handleDelete(item.server)}
      />
    </div>,
  ]);

  return (
    <div className="instance-list">
      {/* 헤더 */}
      <div className="instance-list__header">
        <div className="instance-list__status-group">
          <span>상태:</span>
          <Button text="전체 6" size="sm" variant="white" />
          <Button text="무해(정상) 4" size="sm" variant="white" />
          <Button text="주의 1" size="sm" variant="white" />
          <Button text="위험 1" size="sm" variant="white" />
          <Button text="장애 0" size="sm" variant="white" />
        </div>

        <Button
          text="+ 인스턴스 생성"
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen("add")}
        />
      </div>

      {/* 테이블 */}
      <TableChart size="lg" columns={columns} rows={rows} />

      {/* 페이지네이션 */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* 모달 */}
      {isModalOpen && (
        <Modal
          title={
            isModalOpen === "add"
              ? "DB 추가"
              : isModalOpen === "delete"
              ? "DB 삭제"
              : "DB 수정"
          }
          cancelText="테스트"
          confirmText="저장"
          onClose={() => setIsModalOpen(null)}
          onConfirm={handleConfirm}
          fields={
            isModalOpen === "delete"
              ? [
                  {
                    label: "Name",
                    type: "textarea",
                    placeholder: "삭제할 DB 이름을 입력해주세요.",
                  },
                  {
                    label: "Password",
                    type: "textarea",
                    placeholder: "삭제할 DB의 비밀번호를 입력해주세요.",
                  },
                ]
              : [
                  {
                    label: "Name",
                    type: "textarea",
                    placeholder: "DB 이름을 입력해주세요.",
                  },
                  {
                    label: "IP",
                    type: "textarea",
                    placeholder: "DB IP를 입력해주세요.",
                  },
                  {
                    label: "Port",
                    type: "textarea",
                    placeholder: "DB 포트번호를 입력해주세요.",
                  },
                  {
                    label: "Account",
                    type: "textarea",
                    placeholder: "DB 계정을 입력해주세요.",
                  },
                  {
                    label: "Password",
                    type: "textarea",
                    placeholder: "비밀번호를 입력해주세요.",
                  },
                  {
                    label: "SID",
                    type: "textarea",
                    placeholder: "SID를 입력해주세요.",
                  },
                ]
          }
        />
      )}
    </div>
  );
};

export default InstanceList;
