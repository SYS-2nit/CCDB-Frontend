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
    // 모든 필드가 채워졌는지 확인
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
    const allFilled = Object.values(inputs).every((v) => v.trim() !== "");
    if (!allFilled) {
      alert("모든 항목을 입력해주세요.");
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

      {/* 모달 */}
      {isModalOpen && (
        <Modal
          title={isModalOpen === "add" ? "DB 추가" : "DB 삭제"}
          cancelText="테스트"
          confirmText="저장"
          onClose={() => {
            setIsModalOpen(null);
            setTestResult(null);
          }}
          onReset={handleTest}
          onConfirm={handleConfirm}
          fields={
            isModalOpen === "add"
              ? [
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
                    onChange: (_, val) =>
                      setInputs((prev) => ({ ...prev, ip: val })),
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
                ]
              : [
                  {
                    label: "Name",
                    type: "textarea",
                    placeholder: "삭제할 DB 이름을 입력해주세요.",
                    value: inputs.name,
                    onChange: (_, val) =>
                      setInputs((prev) => ({ ...prev, name: val })),
                  },
                  {
                    label: "Password",
                    type: "textarea",
                    placeholder: "삭제할 DB의 비밀번호를 입력해주세요.",
                    value: inputs.password,
                    onChange: (_, val) =>
                      setInputs((prev) => ({ ...prev, password: val })),
                  },
                ]
          }
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
    </div>
  );
};

export default List;
