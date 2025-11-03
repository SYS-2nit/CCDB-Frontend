import React, { useState } from "react";
import "./List.scss";
import DatabaseItem from "./Item";
import ArrowFillTopIcon from "@/assets/general/arrow-fill-top.svg";
import ArrowFillBottomIcon from "@/assets/general/arrow-fill-bottom.svg";
import { useNavigate } from "react-router-dom";
import Modal from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import SearchIcon from "@/assets/general/search.svg";

interface ListProps {
  databases: {
    name: string;
    ip: string;
    port: string;
    account: string;
    password: string;
    SID: string;
  }[];
  onAddDatabase: (newDB: {
    name: string;
    ip: string;
    port: string;
    account: string;
    password: string;
    SID: string;
  }) => void;
  onDeleteDatabase: (name: string, password: string) => boolean;
}

const List: React.FC<ListProps> = ({
  databases,
  onAddDatabase,
  onDeleteDatabase,
}) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<null | "add" | "delete">(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [inputs, setInputs] = useState({
    name: "",
    ip: "",
    port: "",
    account: "",
    password: "",
    sid: "",
  });
  const [testResult, setTestResult] = useState<null | "success" | "fail">(null);

  // 테스트 버튼 핸들러
  const handleTest = () => {
    // 입력란이 비어있을 경우 알림 처리
    const allFilled = Object.values(inputs).every((v) => v.trim() !== "");
    if (!allFilled) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    const isSuccess = Math.random() > 0.5;
    setTestResult(isSuccess ? "success" : "fail");
  };

  // 저장 버튼 핸들러
  const handleConfirm = () => {
    const allFilled = Object.values(inputs).every(
      (v) => typeof v === "string" && v.trim() !== ""
    );

    // 입력란이 비어있을 경우 알림 처리
    if (!allFilled) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    // 테스트 결과가 없을 경우 알림 처리
    if (!testResult) {
      alert("저장 전에 테스트를 먼저 수행해주세요.");
      return;
    }

    // 테스트 결과 실패 시 알림 처리
    if (testResult === "fail") {
      alert("테스트에 실패했습니다. 연결 정보를 확인해주세요.");
      return;
    }

    // 테스트 결과 성공 시 추가된 데이터 반영
    if (isModalOpen === "add") {
      const { name, ip, port, account, password, sid } = inputs;
      onAddDatabase({ name, ip, port, account, password, SID: sid });
      alert(`${name} DB가 추가되었습니다.`);
    } else if (isModalOpen === "delete") {
      const { name, password } = inputs;
      const isDeleted = onDeleteDatabase(name, password);
      alert(isDeleted ? `${name} 삭제 완료` : "존재하는 DB 정보가 없습니다.");
    }

    setIsModalOpen(null);
    setTestResult(null);
    setInputs({
      name: "",
      ip: "",
      port: "",
      account: "",
      password: "",
      sid: "",
    });
  };

  // 삭제 버튼 핸들러
  const handleDelete = () => {
    const { name, password } = inputs;

    if (!name.trim() || !password.trim()) {
      alert("데이터베이스 이름과 비밀번호를 입력해주세요.");
      return;
    }

    // 데이터에서 이름과 비밀번호가 일치하는 항목 찾기
    const target = databases.find(
      (item) => item.name === name && item.password === password
    );

    if (!target) {
      alert("존재하는 정보가 없습니다.");
      return;
    }

    const isDeleted = onDeleteDatabase(name, password);

    if (isDeleted) {
      alert(`${name} 데이터베이스가 삭제되었습니다.`);
      setIsModalOpen(null);
      setInputs({
        name: "",
        ip: "",
        port: "",
        account: "",
        password: "",
        sid: "",
      });
    } else {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 검색 필터링
  const filteredDatabases = databases.filter((db) =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="db-list">
      {/* 헤더 */}
      <div className="db-list-header">
        목록 ({filteredDatabases.length})
        <img
          src={isCollapsed ? ArrowFillBottomIcon : ArrowFillTopIcon}
          alt="toggle"
          onClick={() => setIsCollapsed((prev) => !prev)}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* 본문 (토글로 표시/숨김) */}
      {!isCollapsed && (
        <>
          <div className="db-list-body">
            <Input
              size="lg"
              icon={SearchIcon}
              placeholder="데이터베이스 이름을 입력해주세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredDatabases.map((db, idx) => (
              <DatabaseItem
                key={idx}
                name={db.name}
                onClick={() => navigate("/dashboard/instance-list")}
              />
            ))}
          </div>

          {/* 푸터 (버튼 영역) */}
          <div className="db-list-footer">
            <Button
              text="삭제"
              size="sm"
              variant="error"
              onClick={() => {
                setTestResult(null);
                setIsModalOpen("delete");
              }}
            />
            <Button
              text="추가"
              size="sm"
              variant="primary"
              onClick={() => {
                setTestResult(null);
                setIsModalOpen("add");
              }}
            />
          </div>
        </>
      )}

      {/* 생성 모달 */}
      {isModalOpen === "add" && (
        <Modal
          title="데이터베이스 생성"
          cancelText="테스트"
          confirmText="저장"
          onClose={() => {
            setIsModalOpen(null);
            setTestResult(null);
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
              label: "SID",
              type: "textarea",
              placeholder: "SID를 입력해주세요.",
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

      {/* 삭제 모달 */}
      {isModalOpen === "delete" && (
        <Modal
          title={"데이터베이스 삭제"}
          cancelText="취소"
          confirmText="확인"
          onClose={() => setIsModalOpen(null)}
          onConfirm={handleDelete}
          fields={[
            {
              label: "Name",
              type: "textarea",
              placeholder: "삭제할 DB 이름을 입력해주세요.",
              value: inputs.name,
              onChange: (_label, val) =>
                setInputs((prev) => ({ ...prev, name: val })),
            },
            {
              label: "Password",
              type: "textarea",
              placeholder: "삭제할 DB의 비밀번호를 입력해주세요.",
              value: inputs.password,
              onChange: (_label, val) =>
                setInputs((prev) => ({ ...prev, password: val })),
            },
          ]}
        />
      )}
    </div>
  );
};

export default List;
