import React, { useEffect, useState } from "react";
import "./Header.scss";
import BedgeSuccessIcon from "@/assets/header/bedge-success.svg";
import TimeIcon from "@/assets/header/time.svg";
import AlertIcon from "@/assets/header/alert.svg";
import LightIcon from "@/assets/header/light.svg";
import DarkIcon from "@/assets/header/dark.svg";
import Select from "../Select/Select";
import { fetchInstancesByDatabase, type DatabaseInstanceListItem } from "@/api/databases";
import { useDashboardContext, type InstanceOption, type DashboardMode } from "@/state/DashboardContext";
import { isAxiosError } from "axios";
import {
  fetchUnreadAlertCount,
  fetchPendingAlerts,
  type EventResponse,
} from "@/api/alerts";

const SELECTED_DB_STORAGE_KEY = "selectedDatabase";

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
};

const Header: React.FC = () => {
  // 다크모드 상태 로드 및 초기화
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark");
      return true;
    } else if (savedTheme === "light") {
      document.body.classList.remove("dark");
      return false;
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) document.body.classList.add("dark");
      return prefersDark;
    }
  });

  // 알림 패널 상태
  const [showAlertPanel, setShowAlertPanel] = useState(false);
  
  // 알림 관련 상태
  const [unreadCount, setUnreadCount] = useState(0);
  const [alerts, setAlerts] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const memberId = 3; // 기본 사용자 ID

  // 테마 전환
  const handleModeToggle = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle("dark", newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  const {
    dbId,
    dbName,
    setDbInfo,
    instances,
    setInstances,
    selectedInstanceId,
    selectInstance,
    mode,
    rangeMinutes,
    setMode,
    triggerRefresh,
    setError,
    clearGraphs,
  } = useDashboardContext();

  // 시간 관련 상태
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem(SELECTED_DB_STORAGE_KEY);
    if (!stored) {
      setDbInfo({ id: null, name: null });
      clearGraphs();
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { id?: number | string; name?: string };
      if (parsed?.id !== undefined && parsed.id !== null) {
        const numericId =
          typeof parsed.id === "number" ? parsed.id : Number(parsed.id);
        if (!Number.isNaN(numericId)) {
          setDbInfo({ id: numericId, name: parsed.name ?? null });
          return;
        }
      }
      setDbInfo({ id: null, name: parsed?.name ?? null });
    } catch (error) {
      console.warn("[Header] 저장된 DB 정보를 읽는 중 오류", error);
      setDbInfo({ id: null, name: null });
    }
  }, [setDbInfo, clearGraphs]);

  useEffect(() => {
    if (!dbId) {
      setInstances([]);
      selectInstance(null);
      clearGraphs();
      return;
    }

    let mounted = true;

    const mapInstanceToOption = (item: DatabaseInstanceListItem): InstanceOption => ({
      id: item.id,
      label:
        item.sid ?? item.serverName ?? item.databaseName ?? `SID ${item.id}`,
      sid: item.sid ?? null,
    });

    const loadInstances = async () => {
      try {
        const fetched = await fetchInstancesByDatabase(dbId);
        if (!mounted) return;
        const options = fetched.map(mapInstanceToOption);
        setInstances(options);

        let nextSelection: InstanceOption | null = null;
        const stored = sessionStorage.getItem("selectedInstance");
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as {
              id?: number | string;
              name?: string;
            };
            if (parsed?.id !== undefined && parsed.id !== null) {
              const numericId =
                typeof parsed.id === "number" ? parsed.id : Number(parsed.id);
              if (!Number.isNaN(numericId)) {
                nextSelection = options.find((opt) => opt.id === numericId) ?? null;
              }
            }
          } catch (error) {
            console.warn("[Header] 저장된 인스턴스를 읽는 중 오류", error);
          }
        }

        if (!nextSelection && options.length > 0) {
          nextSelection = options[0];
        }

        selectInstance(nextSelection);

        if (nextSelection) {
          sessionStorage.setItem(
            "selectedInstance",
            JSON.stringify({ id: nextSelection.id, name: nextSelection.label })
          );
          triggerRefresh();
        } else {
          clearGraphs();
        }

        setError(null);
      } catch (error) {
        if (!mounted) return;
        const message = getErrorMessage(error);
        setError(message);
        setInstances([]);
        selectInstance(null);
        clearGraphs();
      }
    };

    loadInstances();

    return () => {
      mounted = false;
    };
  }, [dbId, setInstances, selectInstance, triggerRefresh, setError, clearGraphs]);

  useEffect(() => {
    const handleDbChange = (event: Event) => {
      const detail = (event as CustomEvent<{ id: number | null; name: string | null }>)
        .detail;
      if (!detail) return;
      setDbInfo({ id: detail.id, name: detail.name ?? null });
      if (!detail.id) {
        setInstances([]);
        selectInstance(null);
        clearGraphs();
        sessionStorage.removeItem(SELECTED_DB_STORAGE_KEY);
      } else {
        sessionStorage.setItem(
          SELECTED_DB_STORAGE_KEY,
          JSON.stringify({ id: detail.id, name: detail.name ?? null }),
        );
      }
    };

    window.addEventListener("dashboard:selected-db", handleDbChange);
    return () => {
      window.removeEventListener("dashboard:selected-db", handleDbChange);
    };
  }, [setDbInfo, setInstances, selectInstance, clearGraphs]);

  useEffect(() => {
    const timer = setInterval(() => {
      const formatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const formatted = formatter.formatToParts(new Date());
      const year = Number(formatted.find((part) => part.type === "year")?.value ?? "0");
      const month = Number(formatted.find((part) => part.type === "month")?.value ?? "1");
      const day = Number(formatted.find((part) => part.type === "day")?.value ?? "1");
      const hour = Number(formatted.find((part) => part.type === "hour")?.value ?? "0");
      const minute = Number(formatted.find((part) => part.type === "minute")?.value ?? "0");
      const second = Number(formatted.find((part) => part.type === "second")?.value ?? "0");

      const now = new Date();
      now.setFullYear(year, month - 1, day);
      now.setHours(hour, minute, second, 0);
      setCurrentTime(now);

      if (mode === "LIVE") {
        const seconds = now.getSeconds();
        const ms = now.getMilliseconds();
        const percent = ((seconds * 1000 + ms) / 60000) * 100;
        setProgress(percent);
      } else {
        setProgress(0);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode === "LIVE" || !rangeMinutes) {
      setRangeStart(null);
    } else {
      setRangeStart(new Date(Date.now() - rangeMinutes * 60 * 1000));
    }
  }, [mode, rangeMinutes]);

  useEffect(() => {
    if (mode !== "LIVE" || !selectedInstanceId) {
      return;
    }

    let timeoutId: number | undefined;
    let intervalId: number | undefined;

    const getSeoulNow = () => {
      const formatter = new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      const year = Number(parts.find((p) => p.type === "year")?.value ?? "0");
      const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
      const day = Number(parts.find((p) => p.type === "day")?.value ?? "1");
      const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      const second = Number(parts.find((p) => p.type === "second")?.value ?? "0");

      const date = new Date();
      date.setFullYear(year, month - 1, day);
      date.setHours(hour, minute, second, 0);
      return date;
    };

    const scheduleAlignedRefresh = () => {
      const now = getSeoulNow();
      const elapsedMs = (now.getSeconds() * 1000 + now.getMilliseconds()) % 60_000;
      const msUntilNextMinute = elapsedMs === 0 ? 60_000 : 60_000 - elapsedMs;

      timeoutId = window.setTimeout(() => {
        triggerRefresh();
        intervalId = window.setInterval(() => {
          triggerRefresh();
        }, 60_000);
      }, msUntilNextMinute);
    };

    scheduleAlignedRefresh();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [mode, selectedInstanceId, triggerRefresh]);

  useEffect(() => {
    if (!selectedInstanceId) {
      return;
    }
    if (mode === "LIVE") return; // 이미 다른 effect에서 처리
    triggerRefresh();
  }, [mode, selectedInstanceId, triggerRefresh]);

  useEffect(() => {
    const handleInstanceSelected = (event: Event) => {
      const detail = (event as CustomEvent<{ id: number | null; name?: string | null }>).detail;
      if (!detail || detail.id === null) return;
      const option = instances.find((opt) => opt.id === detail.id);
      if (option) {
        selectInstance(option);
        triggerRefresh();
      }
    };

    window.addEventListener("dashboard:selected-instance", handleInstanceSelected);
    return () => {
      window.removeEventListener("dashboard:selected-instance", handleInstanceSelected);
    };
  }, [instances, selectInstance, triggerRefresh]);

  // 알림 개수 조회 (컴포넌트 마운트 시 및 30초마다 갱신)
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await fetchUnreadAlertCount(memberId);
        setUnreadCount(count);
      } catch (error) {
        console.error("[Header] 알림 개수 조회 실패:", error);
        // 에러 발생 시에도 UI는 정상 동작하도록 처리
      }
    };

    // 초기 로드
    loadUnreadCount();

    // 30초마다 갱신
    const intervalId = setInterval(loadUnreadCount, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [memberId]);

  // 알림 모달 열릴 때 알림 목록 조회
  useEffect(() => {
    if (!showAlertPanel) {
      return;
    }

    const loadAlerts = async () => {
      setIsLoading(true);
      try {
        const result = await fetchPendingAlerts(memberId, 0, 20);
        setAlerts(result.content);
      } catch (error) {
        console.error("[Header] 알림 목록 조회 실패:", error);
        setAlerts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
  }, [showAlertPanel, memberId]);

  const formatClock = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}시 ${mm}분 ${ss}초`;
  };

  const formatFullDateTime = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  };

  // 시간 포맷 유틸리티 함수 (N분 전, N시간 전 형식)
  const formatTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return "방금 전";
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return formatFullDateTime(created);
    }
  };

  const handleInstanceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    const next = instances.find((opt) => opt.id === value) ?? null;
    selectInstance(next ?? null);
    if (next) {
      sessionStorage.setItem(
        "selectedInstance",
        JSON.stringify({ id: next.id, name: next.label }),
      );
      window.dispatchEvent(
        new CustomEvent("dashboard:selected-instance", {
          detail: { id: next.id, name: next.label },
        }),
      );
      triggerRefresh();
    } else {
      sessionStorage.removeItem("selectedInstance");
      clearGraphs();
    }
  };

  const handleSelectRange = (label: DashboardMode, minutes: number | null) => {
    setMode(label, minutes);
    if (label === "LIVE") {
      setRangeStart(null);
    } else if (minutes) {
      setRangeStart(new Date(Date.now() - minutes * 60 * 1000));
    }
    triggerRefresh();
    setShowDropdown(false);
  };

  const badgeLabel = mode === "LIVE" ? "LIVE" : mode;

  const renderTimeSection = () => {
    if (mode === "LIVE") {
      return (
        <div className="header-time">
          <div className="header-time__info">
            <img
              src={TimeIcon}
              alt="Time icon"
              className="header-time__icon"
              onClick={() => setShowDropdown((prev) => !prev)}
            />
            <span className="header-time__text">{formatClock(currentTime)}</span>
            <span className="header-time__badge header-time__badge--live">
              LIVE
            </span>
          </div>
          <div className="header-time__bar">
            <div
              className="header-time__progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {showDropdown && (
            <div className="header-time__dropdown">
              <div
                className="header-time__option"
                onClick={() => handleSelectRange("LIVE", null)}
              >
                실시간 (LIVE)
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelectRange("10분", 10)}
              >
                실시간 10분
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelectRange("1시간", 60)}
              >
                실시간 1시간
              </div>
              <div
                className="header-time__option"
                onClick={() => handleSelectRange("1일", 1440)}
              >
                실시간 1일
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="header-time">
        <div className="header-time__info">
          <img
            src={TimeIcon}
            alt="Time icon"
            className="header-time__icon"
            onClick={() => setShowDropdown((prev) => !prev)}
          />
          <span className="header-time__text">
            {rangeStart ? `${formatFullDateTime(rangeStart)} ~ ` : ""}
            {formatFullDateTime(currentTime)}
          </span>
          <span className="header-time__badge">{badgeLabel}</span>
        </div>

        {showDropdown && (
          <div className="header-time__dropdown">
            <div
              className="header-time__option"
              onClick={() => handleSelectRange("LIVE", null)}
            >
              실시간 (LIVE)
            </div>
            <div
              className="header-time__option"
              onClick={() => handleSelectRange("10분", 10)}
            >
              실시간 10분
            </div>
            <div
              className="header-time__option"
              onClick={() => handleSelectRange("1시간", 60)}
            >
              실시간 1시간
            </div>
            <div
              className="header-time__option"
              onClick={() => handleSelectRange("1일", 1440)}
            >
              실시간 1일
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="header">
        {/* 왼쪽: DB + 인스턴스 + 시간 */}
        <div className="header__left">
          <div className="header__dbinfo">
            <img src={BedgeSuccessIcon} alt="DB badge" />
            <div className="header__dbname">{dbName ?? "DB Name"}</div>
          </div>

          <Select
            placeholder="인스턴스 선택"
            size="sm"
            options={instances.map((instance) => ({
              label: instance.label,
              value: String(instance.id),
            }))}
            value={
              selectedInstanceId !== null ? String(selectedInstanceId) : ""
            }
            onChange={handleInstanceChange}
          />

          {renderTimeSection()}
        </div>

        {/* 오른쪽: 알림 + 테마 + 현재 시간 */}
        <div className="header__right">
          <div className="header__right-icons">
            {/* 알림 버튼 */}
            <button
              className="header__right-alert"
              onClick={() => setShowAlertPanel(true)}
            >
              <img src={AlertIcon} alt="alert" />
              {unreadCount > 0 && (
                <span className="header__right-alert-badge">{unreadCount}</span>
              )}
            </button>

            {/* 테마 토글 */}
            <div
              className="header__right-theme-toggle"
              onClick={handleModeToggle}
            >
              <img src={isDarkMode ? DarkIcon : LightIcon} alt="theme" />
            </div>
          </div>

          {/* 업데이트 시각 */}
          <div className="header__update">
            <div className="header__date">
              {formatFullDateTime(currentTime)}
            </div>
            <div className="header__text">최종 업데이트</div>
          </div>
        </div>
      </header>

      {/* 알림 패널 */}
      {showAlertPanel && (
        <div
          className="alert-panel__overlay"
          onClick={() => setShowAlertPanel(false)}
        >
          <div className="alert-panel" onClick={(e) => e.stopPropagation()}>
            <div className="alert-panel__header">
              <h3>알림 목록</h3>
              <button
                className="alert-panel__close"
                onClick={() => setShowAlertPanel(false)}
              >
                ✕
              </button>
            </div>
            <div className="alert-panel__content">
              {isLoading ? (
                <div className="alert-panel__empty">
                  로딩 중...
                </div>
              ) : alerts.length === 0 ? (
                <div className="alert-panel__empty">
                  알림이 없습니다.
                </div>
              ) : (
                alerts.map((alert) => {
                  // 심각도별 아이콘 및 색상 결정
                  let icon = "⚠️";
                  let severityClass = "alert-item__icon--warning"; // 기본 노란색 (WARNING)
                  
                  if (alert.severity === 2) {
                    icon = "⚠️";
                    severityClass = "alert-item__icon--danger"; // 주황색 (DANGER)
                  } else if (alert.severity === 3) {
                    icon = "🚨";
                    severityClass = "alert-item__icon--critical"; // 빨간색 (CRITICAL)
                  }

                  return (
                    <div key={alert.id} className="alert-item">
                      <div className={`alert-item__icon ${severityClass}`}>
                        {icon}
                      </div>
                      <div className="alert-item__text">
                        <strong>{alert.message}</strong>
                        <div className="alert-item__sub">
                          {formatTimeAgo(alert.createdAt)} · 인스턴스 ID: {alert.instanceId ?? "N/A"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
