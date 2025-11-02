import React, { useState } from "react";
import "./List.scss";
import DatabaseItem from "./Item";
import ArrowFillTopIcon from "@/assets/general/arrow-fill-top.svg";
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
  }[];
  onAddDatabase: (newDB: {
    name: string;
    ip: string;
    port: string;
    account: string;
    password: string;
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

  // 모달 확인 시 실행
  const handleConfirm = () => {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      ".modal input, .modal textarea"
    );
    const values = Array.from(inputs).map((input) => input.value.trim());

    if (isModalOpen === "add") {
      const [name, ip, port, account, password] = values;
      if (!name || !ip || !port || !account || !password) {
        alert("모든 항목을 입력해주세요.");
        return;
      }
      onAddDatabase({ name, ip, port, account, password });
    }

    if (isModalOpen === "delete") {
      const [nameToDelete, passwordToCheck] = values;
      if (!nameToDelete || !passwordToCheck) {
        alert("DB 이름과 비밀번호를 입력해주세요.");
        return;
      }
      const isDeleted = onDeleteDatabase(nameToDelete, passwordToCheck);
      if (isDeleted) alert(`${nameToDelete} 삭제 완료`);
      else alert("DB 정보가 존재하지 않거나 비밀번호가 일치하지 않습니다.");
    }

    setIsModalOpen(null);
  };

  // 검색 필터링
  const filteredDatabases = databases.filter((db) =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="db-list">
      {/* 헤더 */}
      <div className="db-list-header">
        데이터베이스 목록 ({filteredDatabases.length})
        <img src={ArrowFillTopIcon} alt="arrow" />
      </div>

      {/* 검색창 + DB 목록 */}
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
            date={`IP: ${db.ip} | Port: ${db.port} | Account: ${db.account}`}
            onClick={() => navigate("/dashboard")}
          />
        ))}
      </div>

      {/* 하단 버튼 */}
      <div className="db-list-footer">
        <Button
          text="삭제"
          size="sm"
          variant="error"
          onClick={() => setIsModalOpen("delete")}
        />
        <Button
          text="추가"
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen("add")}
        />
      </div>

      {/* 모달창 */}
      {isModalOpen && (
        <Modal
          title={isModalOpen === "add" ? "DB 추가" : "DB 삭제"}
          onClose={() => setIsModalOpen(null)}
          onConfirm={handleConfirm}
          fields={
            isModalOpen === "add"
              ? [
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
                ]
              : [
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
          }
        />
      )}
    </div>
  );
};

export default List;
