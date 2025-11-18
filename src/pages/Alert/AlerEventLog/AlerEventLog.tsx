import React, { useState, useEffect, useCallback } from "react";
import "./AlerEventLog.scss";
import AlertTable from "./AlertTable/AlertTable";
import DownloadIcon from "@/assets/general/download.svg";
import Button from "@/components/Button/Button";
import Select from "@/components/Select/Select";
import DateInput from "@/components/Input/DateInput";
import {
  fetchAlerts,
  isEventRead,
  type EventResponse,
  type AlertStatus,
  type AlertLevel,
  type Page,
} from "@/api/alerts";

const AlerEventLog: React.FC = () => {
  const memberId = 3; // 기본 사용자 ID

  // 필터 상태
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [severity, setSeverity] = useState<AlertLevel | "">("");
  const [status, setStatus] = useState<AlertStatus | "">("");
  const [readStatus, setReadStatus] = useState<"all" | "read" | "unread">("all"); // 읽음/안읽음 필터
  const [keyword, setKeyword] = useState("");

  // 데이터 상태
  const [alerts, setAlerts] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // 알림 목록 조회
  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      // 클라이언트 사이드 필터링을 위해 전체 데이터를 가져옴
      // (카테고리, 날짜, 읽음/안읽음 필터가 클라이언트 사이드에서 처리되므로)
      const params: {
        memberId: number;
        status?: AlertStatus;
        severity?: AlertLevel;
        page: number;
        size: number;
      } = {
        memberId,
        page: 0, // 전체 데이터를 가져오기 위해 첫 페이지부터
        size: 1000, // 충분히 큰 값으로 설정 (또는 백엔드에서 전체 데이터 조회 API 사용)
      };

      // 상태 필터 (전체가 아닐 때만)
      if (status && status !== "") {
        params.status = status as AlertStatus;
      }

      // 심각도 필터 (전체가 아닐 때만)
      if (severity && severity !== "") {
        params.severity = severity as AlertLevel;
      }

      // 전체 데이터 조회
      const result: Page<EventResponse> = await fetchAlerts(params);
      
      // 클라이언트 사이드 필터링 (카테고리, 날짜, 읽음/안읽음)
      let filteredAlerts = result.content;

      // 카테고리 필터링
      if (category && category !== "") {
        filteredAlerts = filteredAlerts.filter(
          (alert) => alert.category === category
        );
      }

      // 읽음/안읽음 필터링
      if (readStatus === "read") {
        filteredAlerts = filteredAlerts.filter((alert) => isEventRead(alert));
      } else if (readStatus === "unread") {
        filteredAlerts = filteredAlerts.filter((alert) => !isEventRead(alert));
      }

      // 날짜 필터링
      if (startDate && endDate) {
        filteredAlerts = filteredAlerts.filter((alert) => {
          const alertDate = new Date(alert.createdAt);
          const start = new Date(startDate);
          const end = new Date(endDate);
          // 종료일은 하루 끝까지 포함
          end.setHours(23, 59, 59, 999);
          return alertDate >= start && alertDate <= end;
        });
      } else if (startDate) {
        // 시작일만 있는 경우
        filteredAlerts = filteredAlerts.filter((alert) => {
          const alertDate = new Date(alert.createdAt);
          const start = new Date(startDate);
          return alertDate >= start;
        });
      } else if (endDate) {
        // 종료일만 있는 경우
        filteredAlerts = filteredAlerts.filter((alert) => {
          const alertDate = new Date(alert.createdAt);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return alertDate <= end;
        });
      }

      // 클라이언트 사이드 페이지네이션
      const totalFiltered = filteredAlerts.length;
      const totalPagesFiltered = Math.ceil(totalFiltered / pageSize);
      const startIndex = page * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

      setAlerts(paginatedAlerts);
      setTotalPages(totalPagesFiltered);
      setTotalElements(totalFiltered);
    } catch (error) {
      console.error("[AlerEventLog] 알림 목록 조회 실패:", error);
      setAlerts([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [memberId, status, severity, page, category, startDate, endDate, readStatus, pageSize]);

  // 필터 변경 시 페이지를 0으로 리셋
  useEffect(() => {
    setPage(0);
  }, [category, startDate, endDate, severity, status, readStatus]);

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
    setStartDate("");
    setEndDate("");
    setSeverity("");
    setStatus("");
    setReadStatus("all");
    setKeyword("");
    setPage(0);
    // 초기화 후 자동으로 조회 (useEffect가 필터 변경을 감지하여 자동 조회)
  };

  // 위험도 매핑
  const severityOptions = [
    { label: "전체", value: "" },
    { label: "주의", value: "1" },
    { label: "위험", value: "2" },
    { label: "치명", value: "3" },
  ];

  // 상태 매핑
  const statusOptions = [
    { label: "전체", value: "" },
    { label: "미처리", value: "PENDING" },
    { label: "처리 완료", value: "CLOSED" },
  ];

  // 읽음/안읽음 매핑
  const readStatusOptions = [
    { label: "전체", value: "all" },
    { label: "읽음", value: "read" },
    { label: "안읽음", value: "unread" },
  ];

  // 카테고리 매핑 (백엔드 값: CPU, MEMORY, SESSION, IO, STORAGE)
  const categoryOptions = [
    { label: "전체", value: "" },
    { label: "CPU", value: "CPU" },
    { label: "Memory", value: "MEMORY" },
    { label: "Session", value: "SESSION" },
    { label: "I/O", value: "IO" },
    { label: "Storage", value: "STORAGE" },
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
            options={categoryOptions}
          />

          {/* 시작일 */}
          <DateInput
            size="sm"
            label="시작일"
            value={startDate}
            onChange={(e) => {
              const newStartDate = e.target.value;
              setStartDate(newStartDate);
              // 시작일이 종료일보다 늦으면 종료일 초기화
              if (endDate && newStartDate > endDate) {
                setEndDate("");
              }
            }}
          />

          {/* 종료일 */}
          <DateInput
            size="sm"
            label="종료일"
            value={endDate}
            onChange={(e) => {
              const newEndDate = e.target.value;
              // 종료일이 시작일보다 앞이면 선택 불가
              if (!startDate || newEndDate >= startDate) {
                setEndDate(newEndDate);
              }
            }}
            min={startDate || undefined}
          />

          {/* 위험도 */}
          <Select
            size="sm"
            label="위험도"
            placeholder="선택하세요."
            value={severity === "" ? "" : severity.toString()}
            onChange={(e) => {
              const value = e.target.value;
              setSeverity(value ? (Number(value) as AlertLevel) : "");
            }}
            options={severityOptions}
          />

          {/* 상태 */}
          <Select
            size="sm"
            label="상태"
            placeholder="선택하세요."
            value={status}
            onChange={(e) => {
              const value = e.target.value;
              setStatus(value ? (value as AlertStatus) : "");
            }}
            options={statusOptions}
          />

          {/* 읽음/안읽음 */}
          <Select
            size="sm"
            label="읽음/안읽음"
            placeholder="선택하세요."
            value={readStatus}
            onChange={(e) => {
              setReadStatus(e.target.value as "all" | "read" | "unread");
            }}
            options={readStatusOptions}
          />

          {/* 초기화 버튼 */}
          <Button
            text="초기화"
            size="sm"
            variant="white"
            onClick={handleReset}
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
                pageSize={pageSize}
                onPageChange={setPage}
                onRefresh={loadAlerts}
              />
      </div>
    </div>
  );
};

export default AlerEventLog;
