import React, { useState } from "react";
import "./AlerEventLog.scss";
import AlertTable from "./AlertTable/AlertTable";
import DownloadIcon from "@/assets/general/download.svg";
import Button from "@/components/Button/Button";
import Select from "@/components/Select/Select";
import DateInput from "@/components/Input/DateInput";

const AlerEventLog: React.FC = () => {
  // 필터 상태
  const [category, setCategory] = useState("");
  const [, setPeriod] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="alert-log">
      {/* 검색 영역 전체 */}
      <div className="alert-log__top">
        {/* 왼쪽: 필터 + 키워드 검색 */}
        <div className="alert-log__top-left">
          {/* 카테고리 */}
          <Select
            size="sm"
            label="카테고리"
            placeholder="선택하세요."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { label: "CPU", value: "CPU" },
              { label: "Memory", value: "Memory" },
              { label: "Session", value: "Session" },
              { label: "I/O", value: "I/O" },
              { label: "Storage", value: "Storage" },
            ]}
          />

          {/* 기간 */}
          <DateInput
            size="sm"
            label="날짜"
            value={"기간을 선택해주세요."}
            onChange={(e) => setPeriod(e.target.value)}
          />

          {/* 위험도 */}
          <Select
            size="sm"
            label="위험도"
            placeholder="선택하세요."
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={[
              { label: "주의", value: "주의" },
              { label: "위험", value: "위험" },
              { label: "치명", value: "치명" },
            ]}
          />

          {/* 상태 */}
          <Select
            size="sm"
            label="상태"
            placeholder="선택하세요."
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { label: "미처리", value: "미처리" },
              { label: "처리 완료", value: "처리 완료" },
            ]}
          />
          {/* 검색 버튼 */}
          <Button text="검색" size="sm" variant="primary" />
        </div>
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
    </div>
  );
};

export default AlerEventLog;
