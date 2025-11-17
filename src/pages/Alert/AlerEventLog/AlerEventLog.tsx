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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [severity, setSeverity] = useState<AlertLevel | "">("");
  const [status, setStatus] = useState<AlertStatus | "">("");
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

      // 상태 필터 (전체가 아닐 때만)
      if (status && status !== "") {
        params.status = status as AlertStatus;
      }

      // 심각도 필터 (전체가 아닐 때만)
      if (severity && severity !== "") {
        params.severity = severity as AlertLevel;
      }

      // 카테고리와 날짜 필터는 백엔드 API에 파라미터가 없어서 일단 클라이언트 사이드 필터링
      // 나중에 백엔드에서 지원하면 서버 사이드로 이동

      const result: Page<EventResponse> = await fetchAlerts(params);
      
      // 클라이언트 사이드 필터링 (카테고리, 날짜)
      let filteredAlerts = result.content;

      // 카테고리 필터링
      if (category && category !== "") {
        filteredAlerts = filteredAlerts.filter(
          (alert) => alert.category === category
        );
      }

      // 날짜 필터링 (백엔드에서 지원되면 서버 사이드로 이동)
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

      // 클라이언트 사이드 필터링 (카테고리, 날짜)
      // 주의: 서버에서 이미 페이지네이션된 데이터를 받으므로,
      // 클라이언트 필터링은 현재 페이지의 데이터만 필터링합니다.
      // 전체 필터링을 하려면 서버에서 전체 데이터를 받아야 합니다.
      
      // 일단 서버에서 받은 페이지네이션 정보 사용
      setAlerts(filteredAlerts);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error("[AlerEventLog] 알림 목록 조회 실패:", error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [memberId, status, severity, page, category, startDate, endDate]);

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
