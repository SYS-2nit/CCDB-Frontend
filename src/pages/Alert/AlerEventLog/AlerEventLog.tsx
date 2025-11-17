import React, { useState, useEffect, useCallback } from "react";
import "./AlerEventLog.scss";
import AlertTable from "./AlertTable/AlertTable";
import DownloadIcon from "@/assets/general/download.svg";
import Button from "@/components/Button/Button";
import Select from "@/components/Select/Select";
import DateInput from "@/components/Input/DateInput";
import {
  fetchAlerts,
  type EventResponse,
  type AlertStatus,
  type AlertLevel,
  type Page,
} from "@/api/alerts";

const AlerEventLog: React.FC = () => {
  const memberId = 3; // 기본 사용자 ID

  // 필터 상태
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [severity, setSeverity] = useState<AlertLevel | "">("");
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [keyword, setKeyword] = useState("");

  // 데이터 상태
  const [alerts, setAlerts] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // 알림 목록 조회
  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: {
        memberId: number;
        status?: AlertStatus;
        severity?: AlertLevel;
        page: number;
        size: number;
      } = {
        memberId,
        page,
        size: pageSize,
      };

      if (status) {
        params.status = status;
      }

      if (severity) {
        params.severity = severity;
      }

      const result: Page<EventResponse> = await fetchAlerts(params);
      setAlerts(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error("[AlerEventLog] 알림 목록 조회 실패:", error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [memberId, status, severity, page]);

  // 초기 로드 및 필터 변경 시 조회
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setPage(0); // 첫 페이지로 리셋
    loadAlerts();
  };

  // 필터 초기화
  const handleReset = () => {
    setCategory("");
    setStartDate(null);
    setEndDate(null);
    setSeverity("");
    setStatus("");
    setKeyword("");
    setPage(0);
  };

  // 위험도 매핑
  const severityOptions = [
    { label: "주의", value: 1 as AlertLevel },
    { label: "위험", value: 2 as AlertLevel },
    { label: "치명", value: 3 as AlertLevel },
  ];

  // 상태 매핑
  const statusOptions = [
    { label: "미처리", value: "PENDING" as AlertStatus },
    { label: "처리 완료", value: "CLOSED" as AlertStatus },
  ];

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
            value={
              startDate && endDate
                ? `${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}`
                : "기간을 선택해주세요."
            }
            onChange={(e) => {
              // DateInput 컴포넌트의 실제 구현에 따라 조정 필요
              // 일단 placeholder로 처리
            }}
          />

          {/* 위험도 */}
          <Select
            size="sm"
            label="위험도"
            placeholder="선택하세요."
            value={severity.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setSeverity(value ? (Number(value) as AlertLevel) : "");
            }}
            options={severityOptions.map((opt) => ({
              label: opt.label,
              value: opt.value.toString(),
            }))}
          />

          {/* 상태 */}
          <Select
            size="sm"
            label="상태"
            placeholder="선택하세요."
            value={status}
            onChange={(e) => setStatus(e.target.value as AlertStatus | "")}
            options={statusOptions}
          />

          {/* 검색 버튼 */}
          <Button
            text="검색"
            size="sm"
            variant="primary"
            onClick={handleSearch}
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="alert-log__table-wrapper">
        <div className="alert-log__table-header">
          <span className="alert-log__table-title">
            조회 결과 ({totalElements}건)
          </span>
          <div className="alert-log__table-icons">
            <img src={DownloadIcon} alt="Download Icon" />
          </div>
        </div>
        <AlertTable
          alerts={alerts}
          isLoading={isLoading}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default AlerEventLog;
