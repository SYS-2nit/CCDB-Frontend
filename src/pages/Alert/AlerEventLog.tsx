import React, { useState } from "react";
import "./AlerEventLog.scss";
import Modal from "@/components/Modal/Modal";
import AlertTable from "./AlerEventLog/AlertTable";
import FilterIcon from "@/assets/general/filter.svg";
import DownloadIcon from "@/assets/general/download.svg";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";

const AlerEventLog: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="alert-log">
      {/* 검색란 + 검색 버튼 + 필터 버튼 */}
      <div className="alert-log__top">
        <div className="alert-log__top-left">
          <Input
            size="sm"
            variant="default"
            placeholder="키워드를 입력해주세요. (예: FRA, Deadlock)"
          />
          <Button text="검색" size="sm" variant="primary" />
        </div>
        <Button
          text="필터"
          icon={FilterIcon}
          size="sm"
          variant="white"
          onClick={() => setIsFilterOpen(true)}
        />
      </div>

      {/* 테이블 */}
      <div className="alert-log__table-wrapper">
        <div className="alert-log__table-header">
          <span className="alert-log__table-title">조회 결과</span>
          <div className="alert-log__table-icons">
            <img src={DownloadIcon} alt="Download Icon" />
          </div>
        </div>
        <AlertTable />
      </div>

      {/* 필터 모달 */}
      {isFilterOpen && (
        <Modal
          title="필터"
          confirmText="적용"
          cancelText="초기화"
          onReset={() => setResetKey((prev) => prev + 1)}
          onConfirm={() => setIsFilterOpen(false)}
          theme="light"
          resetTrigger={resetKey}
          fields={[
            {
              label: "카테고리",
              placeholder: "카테고리를 정해주세요.",
              type: "select",
              options: ["CPU", "Memory", "Session", "I/O", "Storage"],
            },
            { label: "기간", placeholder: "기간을 정해주세요.", type: "date" },
            {
              label: "위험도",
              type: "button-group",
              options: ["주의", "위험", "치명"],
            },
            {
              label: "상태",
              type: "button-group",
              options: ["미처리", "처리 완료"],
            },
          ]}
        />
      )}
    </div>
  );
};

export default AlerEventLog;
