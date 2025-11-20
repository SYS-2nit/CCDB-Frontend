import React, { useState, useEffect, useMemo } from "react";
import "./EventSettingPanel.scss";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";
import DaysSelector from "@/components/Select/DaysSelector";
import TimeInput from "@/components/Input/TimeInput";
import LevelInput from "./LevelInput";
import { useDashboardContext } from "@/state/DashboardContext";
import {
  fetchMetricTemplatesByCategory,
  createPolicy,
  type AlertMetricTemplateResponse,
  type AlertPolicyCreateRequest,
  type AlertEventCreateRequest,
} from "@/api/alerts";
import type { AlertCategory, ThresholdFormat, DelayTime } from "@/api/alerts";

interface EventSettingPanelProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  mode?: "default" | "log";
  onPoliciesChange?: (policies: Policy[]) => void;
}

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

export interface EventCard {
  id: number;
  name: string;
  frequency: string;
  resources: string;
  eventName: string;
  graphId: number | null;
  metricKey: string;
  metricName: string;
  thresholdFormat: ThresholdFormat;
  days: string[];
  startTime: string;
  endTime: string;
  levels: {
    warning: number;
    danger: number;
    critical: number;
  };
}

function createEmptyEvent(index: number): EventCard {
  return {
    id: index,
    name: `이벤트 ${index + 1}`,
    frequency: "ONE_MINUTE", // 기본값: 1분 후
    resources: "",
    eventName: "",
    graphId: null,
    metricKey: "",
    metricName: "",
    thresholdFormat: "PERCENT",
    days: [],
    startTime: "",
    endTime: "",
    levels: {
      warning: 0,
      danger: 0,
      critical: 0,
    },
  };
}

const EventSettingPanel: React.FC<EventSettingPanelProps> = ({
  isOpen,
  mode = "default",
  onPoliciesChange,
}) => {
  const { selectedInstanceId, instances } = useDashboardContext();
  const [policyName, setPolicyName] = useState("");
  const [inputForms, setInputForms] = useState<EventCard[]>([
    createEmptyEvent(0),
  ]);
  const [createdCards, setCreatedCards] = useState<EventCard[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isInitial, setIsInitial] = useState(true);
  const [metricTemplates, setMetricTemplates] = useState<AlertMetricTemplateResponse[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>("");

  // 카테고리별 메트릭 템플릿 조회
  const loadMetricTemplates = async (category: AlertCategory | null) => {
    if (!category) {
      setMetricTemplates([]);
      setIsLoadingMetrics(false);
      return;
    }

    setIsLoadingMetrics(true);
    try {
      const templates = await fetchMetricTemplatesByCategory(category);
      console.log(`[EventSettingPanel] API 응답 전체 템플릿:`, templates);
      console.log(`[EventSettingPanel] 템플릿 개수: ${templates.length}`);
      
      // isActive가 true인 것만 필터링
      const activeTemplates = templates.filter((t) => t.isActive === true);
      console.log(`[EventSettingPanel] 활성 템플릿 (isActive=true):`, activeTemplates);
      console.log(`[EventSettingPanel] 활성 템플릿 개수: ${activeTemplates.length}`);
      
      // 각 템플릿의 ID와 메트릭 이름 로그
      activeTemplates.forEach((t) => {
        console.log(`[EventSettingPanel] 템플릿 ID: ${t.id}, 메트릭: ${t.metricName}, KEY: ${t.metricKey}`);
      });
      
      setMetricTemplates(activeTemplates);
    } catch (error) {
      console.error("[EventSettingPanel] 메트릭 템플릿 조회 실패:", error);
      setMetricTemplates([]);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // 카테고리 변경 시 메트릭 템플릿 조회
  useEffect(() => {
    const currentForm = inputForms[0];
    if (!currentForm || !currentForm.resources) {
      setMetricTemplates([]);
      return;
    }

    const categoryMap: Record<string, AlertCategory> = {
      CPU: "CPU",
      Memory: "MEMORY",
      Session: "SESSION",
      "I/O": "IO",
      Storage: "STORAGE",
    };
    const category = categoryMap[currentForm.resources];
    if (category) {
      loadMetricTemplates(category);
    } else {
      setMetricTemplates([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputForms[0]?.resources]);


  // 레벨 검증: 주의 < 위험 < 치명 (낮을수록 좋음, 높을수록 문제)
  const validateLevels = (
    levels: { warning: number; danger: number; critical: number }
  ): string | null => {
    if (levels.warning >= levels.danger) {
      return "주의 값은 위험 값보다 작아야 합니다.";
    }
    if (levels.danger >= levels.critical) {
      return "위험 값은 치명 값보다 작아야 합니다.";
    }
    return null;
  };

  const handleAdd = () => {
    const currentForm = inputForms[0];

    // 최대 7개 제한
    if (createdCards.length >= 7) {
      setValidationMessage("최대 7개까지 추가할 수 있습니다.");
      setIsValidationModalOpen(true);
      return;
    }

    // 필수 필드 검증 (요일과 시간은 선택 사항이므로 제외)
    const missingFields: string[] = [];
    if (!policyName.trim()) missingFields.push("정책 이름");
    if (!currentForm.resources.trim()) missingFields.push("카테고리");
    if (!currentForm.metricKey || !currentForm.metricKey.trim()) missingFields.push("메트릭");
    if (!currentForm.frequency || !currentForm.frequency.trim()) missingFields.push("누적 횟수");
    // 요일과 시간은 선택 사항이므로 검증에서 제외

    if (missingFields.length > 0) {
      console.error("[EventSettingPanel] 비어있는 필드:", missingFields);
      console.error("[EventSettingPanel] 현재 폼 데이터:", currentForm);
      setValidationMessage(`비어 있는 입력폼을 작성해주세요.\n누락된 필드: ${missingFields.join(", ")}`);
      setIsValidationModalOpen(true);
      return;
    }

    // 레벨 검증
    const levelError = validateLevels(currentForm.levels);
    if (levelError) {
      setValidationError(levelError);
      setValidationMessage(levelError);
      setIsValidationModalOpen(true);
      return;
    }
    setValidationError(null);

    // 새 이벤트 추가
    setCreatedCards((prev) => [...prev, { ...currentForm }]);
    setIsInitial(false);

    // 입력폼 초기화 (새 빈 이벤트로, 카테고리는 유지)
    const newEvent = createEmptyEvent(createdCards.length + 1);
    newEvent.resources = currentForm.resources; // 카테고리 유지
    newEvent.frequency = "ONE_MINUTE"; // 기본값 유지
    setInputForms([newEvent]);
  };

  const handleSave = async () => {
    if (createdCards.length === 0) {
      setValidationMessage("이벤트 하나 이상 추가하세요.");
      setIsValidationModalOpen(true);
      return;
    }

    if (!selectedInstanceId) {
      setValidationMessage("인스턴스를 선택해주세요.");
      setIsValidationModalOpen(true);
      return;
    }

    // 모든 이벤트의 레벨 검증
    for (const event of createdCards) {
      const levelError = validateLevels(event.levels);
      if (levelError) {
        setValidationMessage(`${event.metricName || event.name}: ${levelError}`);
        setIsValidationModalOpen(true);
        return;
      }
    }

    // 필수 필드 검증 (요일과 시간은 선택 사항이므로 제외)
    const hasEmptyField = createdCards.some((event) => {
      return (
        !policyName.trim() ||
        !event.resources.trim() ||
        !event.metricKey ||
        !event.frequency.trim()
        // 요일과 시간은 선택 사항이므로 검증에서 제외
      );
    });

    if (hasEmptyField) {
      setValidationMessage("비어 있는 입력폼을 작성해주세요.");
      setIsValidationModalOpen(true);
      return;
    }

    try {
      // memberId 제거 - 백엔드가 기본값 1 사용

      // frequency를 DelayTime으로 변환
      const frequencyToDelayTime = (frequency: string): DelayTime => {
        switch (frequency) {
          case "ONE_MINUTE":
            return "ONE_MINUTE";
          case "FIVE_MINUTES":
            return "FIVE_MINUTES";
          case "TEN_MINUTES":
            return "TEN_MINUTES";
          case "THIRTY_MINUTES":
            // DelayTime에 THIRTY_MINUTES가 없으므로 TEN_MINUTES로 매핑
            return "TEN_MINUTES";
          case "ONE_HOUR":
            return "ONE_HOUR";
          default:
            return "ONE_MINUTE";
        }
      };

      // days 배열을 비트마스크 숫자로 변환 (월=1, 화=2, 수=4, 목=8, 금=16, 토=32, 일=64)
      // 요일이 비어있으면 127 (모든 요일)로 설정
      const daysToBitmask = (days: string[]): number => {
        if (days.length === 0) {
          return 127; // 모든 요일 (1+2+4+8+16+32+64)
        }
        const dayMap: Record<string, number> = {
          월: 1,
          화: 2,
          수: 4,
          목: 8,
          금: 16,
          토: 32,
          일: 64,
        };
        return days.reduce((sum, day) => sum + (dayMap[day] || 0), 0);
      };

      // resources를 AlertCategory로 변환
      const resourcesToCategory = (resources: string): AlertCategory => {
        switch (resources) {
          case "CPU":
            return "CPU";
          case "Memory":
            return "MEMORY";
          case "Session":
            return "SESSION";
          case "I/O":
            return "IO";
          case "Storage":
            return "STORAGE";
          default:
            return "CPU";
        }
      };

      // 이벤트 데이터 변환 (정책 생성 후 policyId가 필요하므로, 일단 빈 배열로 전송)
      // 백엔드에서 정책 생성 시 events를 함께 처리하는지 확인 필요
      const events: AlertEventCreateRequest[] = createdCards.map((card) => ({
        policyId: 0, // 정책 생성 후 업데이트될 예정
        category: resourcesToCategory(card.resources) as AlertCategory,
        name: card.metricName || card.name,
        graphId: card.graphId || 0,
        metricKey: card.metricKey,
        metricName: card.metricName,
        thresholdFormat: card.thresholdFormat,
        warning: card.levels.warning,
        danger: card.levels.danger,
        critical: card.levels.critical,
        delayTime: frequencyToDelayTime(card.frequency),
        days: daysToBitmask(card.days),
        // 시간이 비어있으면 null로 전송 (시간 제한 없음)
        startTime: card.startTime && card.startTime.trim() ? card.startTime : null,
        endTime: card.endTime && card.endTime.trim() ? card.endTime : null,
        state: true,
        isReverse: false, // 역방향 메트릭 제거됨
      }));

      // 정책 생성 요청
      const policyRequest: AlertPolicyCreateRequest = {
        // memberId 제거 - 백엔드가 기본값 1 사용
        instanceId: selectedInstanceId,
        name: policyName.trim(),
        description: null,
        isActive: true,
        events: events,
      };

      console.log("[handleSave] 정책 생성 요청:", policyRequest);

      const createdPolicy = await createPolicy(policyRequest);

      console.log("[handleSave] 정책 생성 성공:", createdPolicy);

      // 성공 후 로컬 state 업데이트
      const newPolicy: Policy = {
        id: createdPolicy.id,
        name: createdPolicy.name,
        events: createdCards,
      };

      const updated = [...policies, newPolicy];
      setPolicies(updated);
      setIsInitial(true);
      setCreatedCards([]);
      setInputForms([createEmptyEvent(0)]);
      setPolicyName("");

      if (onPoliciesChange) onPoliciesChange(updated);
      setValidationMessage("정책이 성공적으로 저장되었습니다.\n설정 기록 탭에서 확인할 수 있습니다.");
      setIsValidationModalOpen(true);
    } catch (error: any) {
      console.error("[handleSave] 정책 생성 실패:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "정책 저장에 실패했습니다.";
      setValidationMessage(`정책 저장 실패: ${errorMessage}`);
      setIsValidationModalOpen(true);
    }
  };

  const toggleDay = (eventIndex: number, day: string) => {
    setInputForms((prev) =>
      prev.map((ev, i) =>
        i === eventIndex
          ? {
              ...ev,
              days: ev.days.includes(day)
                ? ev.days.filter((d) => d !== day)
                : [...ev.days, day],
            }
          : ev
      )
    );
  };

  // "매일" 버튼 클릭: 모든 요일 선택 해제
  const handleSelectAllDays = (eventIndex: number) => {
    setInputForms((prev) =>
      prev.map((ev, i) =>
        i === eventIndex
          ? {
              ...ev,
              days: [], // 모든 요일 선택 해제
            }
          : ev
      )
    );
  };

  // "24시간" 버튼 클릭: 시작/종료 시간 초기화
  const handleSelect24Hours = (eventIndex: number) => {
    setInputForms((prev) =>
      prev.map((ev, i) =>
        i === eventIndex
          ? {
              ...ev,
              startTime: "",
              endTime: "",
            }
          : ev
      )
    );
  };


  return (
    <div className="event-panel">
      {/* 정책 설정 헤더 */}
      <div className="event-panel-header-row">
        <Input
          placeholder="정책 이름을 입력해주세요."
          size="lg"
          variant="default"
          value={policyName}
          onChange={(e) => setPolicyName(e.target.value)}
        />
      </div>

      {isOpen && (
        <div className="event-panel__content">
          {mode === "default" && (
            <>
              {/* 입력폼 */}
              {inputForms.map((event, index) => (
                <div key={event.id} className="event-card">
                  <div className="event-panel__row">
                    <Select
                      label="카테고리"
                      placeholder="선택해주세요"
                      size="sm"
                      value={event.resources}
                      options={[
                        { label: "CPU", value: "CPU" },
                        { label: "Memory", value: "Memory" },
                        { label: "Session", value: "Session" },
                        { label: "I/O", value: "I/O" },
                        { label: "Storage", value: "Storage" },
                      ]}
                      onChange={(e) => {
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? {
                                  ...ev,
                                  resources: e.target.value,
                                  metricKey: "", // 메트릭 초기화
                                  metricName: "",
                                  graphId: null,
                                  thresholdFormat: "PERCENT",
                                  frequency: ev.frequency || "ONE_MINUTE", // frequency 유지 (없으면 기본값)
                                  levels: { warning: 0, danger: 0, critical: 0 },
                                }
                              : ev
                          )
                        );
                      }}
                    />

                    <Select
                      label="메트릭"
                      placeholder={
                        isLoadingMetrics
                          ? "로딩 중..."
                          : !event.resources
                          ? "카테고리를 먼저 선택해주세요"
                          : metricTemplates.length === 0
                          ? "메트릭이 없습니다"
                          : "메트릭을 선택해주세요"
                      }
                      size="sm"
                      value={event.metricKey}
                      disabled={!event.resources || isLoadingMetrics}
                      options={metricTemplates.map((m) => ({
                        label: m.metricName,
                        value: m.metricKey,
                      }))}
                      onChange={(e) => {
                        const selectedTemplate = metricTemplates.find(
                          (m) => m.metricKey === e.target.value
                        );
                        if (selectedTemplate) {
                          setInputForms((prev) =>
                            prev.map((ev, i) =>
                              i === index
                                ? {
                                    ...ev,
                                    metricKey: selectedTemplate.metricKey,
                                    metricName: selectedTemplate.metricName,
                                    graphId: selectedTemplate.graphId,
                                    thresholdFormat: selectedTemplate.thresholdFormat,
                                    eventName: selectedTemplate.metricName,
                                    // 기본값 적용
                                    levels: {
                                      warning:
                                        selectedTemplate.defaultWarning ?? 0,
                                      danger: selectedTemplate.defaultDanger ?? 0,
                                      critical:
                                        selectedTemplate.defaultCritical ?? 0,
                                    },
                                  }
                                : ev
                            )
                          );
                        }
                      }}
                    />

                    <Select
                      label="누적 횟수"
                      placeholder="1분 후"
                      size="sm"
                      value={event.frequency}
                      options={[
                        { label: "1분 후", value: "ONE_MINUTE" },
                        { label: "5분 후", value: "FIVE_MINUTES" },
                        { label: "10분 후", value: "TEN_MINUTES" },
                        { label: "1시간 후", value: "ONE_HOUR" },
                      ]}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, frequency: e.target.value }
                              : ev
                          )
                        )
                      }
                    />
                  </div>

                  <div className="event-panel__row">
                    <div className="field">
                      <label>요일</label>
                      <div className="days-with-button">
                        <DaysSelector
                          selectedDays={event.days}
                          onToggle={(day) => {
                            toggleDay(index, day);
                            // 요일을 선택하면 "매일" 상태가 해제됨 (이미 days 배열이 변경됨)
                          }}
                        />
                        <button
                          type="button"
                          className={`select-all-days-btn ${event.days.length === 0 ? 'active' : ''}`}
                          onClick={() => handleSelectAllDays(index)}
                        >
                          매일
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label>시작 시간</label>
                      <div className="time-with-button">
                        <TimeInput
                          value={event.startTime}
                          onChange={(e) => {
                            const newStartTime = e.target.value;
                            setInputForms((prev) =>
                              prev.map((ev, i) => {
                                if (i !== index) return ev;
                                
                                if (!newStartTime) {
                                  return { ...ev, startTime: newStartTime };
                                }
                                
                                // 시간을 분 단위로 변환하는 헬퍼 함수
                                const timeToMinutes = (time: string): number => {
                                  const [hours, minutes] = time.split(':').map(Number);
                                  return hours * 60 + minutes;
                                };
                                
                                // 분을 시간 문자열로 변환하는 헬퍼 함수
                                const minutesToTime = (minutes: number): string => {
                                  const hours = Math.floor(minutes / 60) % 24;
                                  const mins = minutes % 60;
                                  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                                };
                                
                                const newStartMinutes = timeToMinutes(newStartTime);
                                
                                // 종료 시간이 있는 경우
                                if (ev.endTime) {
                                  const endMinutes = timeToMinutes(ev.endTime);
                                  const diff = endMinutes - newStartMinutes;
                                  
                                  // 시작 시간이 종료 시간보다 이후이거나, 차이가 1분 미만인 경우
                                  if (diff <= 0) {
                                    // 종료 시간을 시작 시간 + 1분으로 설정
                                    const newEndTime = minutesToTime(newStartMinutes + 1);
                                    return { ...ev, startTime: newStartTime, endTime: newEndTime };
                                  }
                                }
                                
                                return { ...ev, startTime: newStartTime };
                              })
                            );
                          }}
                        />
                        <button
                          type="button"
                          className={`select-24h-btn ${!event.startTime && !event.endTime ? 'active' : ''}`}
                          onClick={() => handleSelect24Hours(index)}
                        >
                          24시간
                        </button>
                      </div>
                    </div>

                    <div className="field">
                      <label>종료 시간</label>
                      <TimeInput
                        value={event.endTime}
                        onChange={(e) => {
                          const newEndTime = e.target.value;
                          setInputForms((prev) =>
                            prev.map((ev, i) => {
                              if (i !== index) return ev;
                              
                              if (!newEndTime) {
                                return { ...ev, endTime: newEndTime };
                              }
                              
                              // 시간을 분 단위로 변환하는 헬퍼 함수
                              const timeToMinutes = (time: string): number => {
                                const [hours, minutes] = time.split(':').map(Number);
                                return hours * 60 + minutes;
                              };
                              
                              // 분을 시간 문자열로 변환하는 헬퍼 함수
                              const minutesToTime = (minutes: number): string => {
                                const hours = Math.floor(minutes / 60) % 24;
                                const mins = minutes % 60;
                                return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                              };
                              
                              const newEndMinutes = timeToMinutes(newEndTime);
                              
                              // 시작 시간이 있는 경우
                              if (ev.startTime) {
                                const startMinutes = timeToMinutes(ev.startTime);
                                const diff = newEndMinutes - startMinutes;
                                
                                // 종료 시간이 시작 시간보다 이전이거나, 차이가 1분 미만인 경우
                                if (diff < 1) {
                                  // 시작 시간을 종료 시간 - 1분으로 설정
                                  const newStartTime = minutesToTime(newEndMinutes - 1);
                                  return { ...ev, startTime: newStartTime, endTime: newEndTime };
                                }
                              }
                              
                              return { ...ev, endTime: newEndTime };
                            })
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div className="event-panel__row slider-row">
                    <LevelInput
                      label="주의"
                      value={event.levels.warning}
                      thresholdFormat={event.thresholdFormat}
                      min={0}
                      max={event.levels.danger > 0 ? event.levels.danger - 1 : undefined}
                      onChange={(value) => {
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? {
                                  ...ev,
                                  levels: {
                                    ...ev.levels,
                                    warning: value,
                                  },
                                }
                              : ev
                          )
                        );
                      }}
                      onValidationError={(msg) => {
                        setValidationError(msg);
                        alert(msg);
                      }}
                    />
                    <LevelInput
                      label="위험"
                      value={event.levels.danger}
                      thresholdFormat={event.thresholdFormat}
                      min={event.levels.warning + 1}
                      max={
                        event.levels.critical > 0
                          ? event.levels.critical - 1
                          : undefined
                      }
                      onChange={(value) => {
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? {
                                  ...ev,
                                  levels: {
                                    ...ev.levels,
                                    danger: value,
                                  },
                                }
                              : ev
                          )
                        );
                      }}
                      onValidationError={(msg) => {
                        setValidationError(msg);
                        alert(msg);
                      }}
                    />
                    <LevelInput
                      label="치명"
                      value={event.levels.critical}
                      thresholdFormat={event.thresholdFormat}
                      min={event.levels.danger + 1}
                      onChange={(value) => {
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? {
                                  ...ev,
                                  levels: {
                                    ...ev.levels,
                                    critical: value,
                                  },
                                }
                              : ev
                          )
                        );
                      }}
                      onValidationError={(msg) => {
                        setValidationError(msg);
                        alert(msg);
                      }}
                    />
                  </div>
                  {validationError && (
                    <div style={{ color: "red", fontSize: "12px", marginTop: "-10px" }}>
                      {validationError}
                    </div>
                  )}
                </div>
              ))}

              {/* 이벤트 목록 타이틀 및 리스트 */}
              {!isInitial && createdCards.length > 0 && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <div className="event-card__header-list-title">
                      추가된 이벤트
                    </div>
                  </div>

                  <div className="event-cards-container">
                    {createdCards.map((card, index) => (
                      <div className="event-card-item" key={card.id}>
                        <div className="event-card-item__content">
                          <div className="event-card-item__name">{card.metricName || card.name}</div>
                        </div>
                        <button
                          className="event-card-item__delete"
                          onClick={() => {
                            setCreatedCards((prev) => prev.filter((_, i) => i !== index));
                            if (createdCards.length <= 1) setIsInitial(true);
                          }}
                          aria-label="삭제"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "default" && (
            <div className="event-panel__actions">
              <Button
                text="추가"
                size="sm"
                variant="white"
                onClick={handleAdd}
              />
              <Button
                text="저장"
                size="sm"
                variant="primary"
                onClick={handleSave}
                disabled={createdCards.length === 0}
              />
            </div>
          )}

        </div>
      )}

      {/* 검증 에러 모달 */}
      {isValidationModalOpen && (
        <Modal
          title="알림"
          onClose={() => setIsValidationModalOpen(false)}
          onConfirm={() => setIsValidationModalOpen(false)}
          confirmText="확인"
          hideCancelButton={true}
          fields={[]}
        >
          <div style={{ 
            padding: "20px 0", 
            whiteSpace: "pre-line",
            textAlign: "center",
            color: "#333",
            fontSize: "14px",
            lineHeight: "1.6"
          }}>
            {validationMessage}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EventSettingPanel;




