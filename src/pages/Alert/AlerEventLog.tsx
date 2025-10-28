import React, { useState } from "react";
import "./AlerEventLog.scss";
import Modal from "@/components/Modal/Modal";
import SearchBar from "./AlerEventLog/SearchBar";
import FilterButton from "./AlerEventLog/FilterButton";
import AlertTable from "./AlerEventLog/AlertTable";
import InfoIcon from "@/assets/general/info.svg";
import SettingIcon from "@/assets/general/setting.svg";
import DownloadIcon from "@/assets/general/download.svg";

const AlerEventLog: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="alert-log">
      {/* 상단 검색 + 필터 */}
      <div className="alert-log__top">
        <SearchBar placeholder="키워드를 입력해주세요. (예: FRA, Deadlock)" />
        <FilterButton onClick={() => setIsFilterOpen(true)} />
      </div>

      {/* 테이블 */}
      <div className="alert-log__table-wrapper">
        <div className="alert-log__table-header">
          <span className="alert-log__table-title">조회 결과</span>
          <div className="alert-log__table-icons">
            <img src={InfoIcon} alt="Info Icon" />
            <img src={SettingIcon} alt="Setting Icon" />
            <img src={DownloadIcon} alt="Download Icon" />
          </div>
        </div>
        <AlertTable />
      </div>

      {/* 필터 모달 */}
      {isFilterOpen && (
        <Modal
          title="필터"
          onClose={() => setIsFilterOpen(false)}
          onConfirm={() => setIsFilterOpen(false)}
          confirmText="적용"
          cancelText="초기화"
          theme="light"
          fields={[
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
