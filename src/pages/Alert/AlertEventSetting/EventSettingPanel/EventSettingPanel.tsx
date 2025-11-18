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
  type AlertMetricTemplateResponse,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [metricTemplates, setMetricTemplates] = useState<AlertMetricTemplateResponse[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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

    // 필수 필드 검증 (디버깅용)
    const missingFields: string[] = [];
    if (!policyName.trim()) missingFields.push("정책 이름");
    if (!currentForm.resources.trim()) missingFields.push("카테고리");
    if (!currentForm.metricKey || !currentForm.metricKey.trim()) missingFields.push("메트릭");
    if (!currentForm.frequency || !currentForm.frequency.trim()) missingFields.push("누적 횟수");
    if (currentForm.days.length === 0) missingFields.push("요일");
    if (!currentForm.startTime || !currentForm.startTime.trim()) missingFields.push("시작 시간");
    if (!currentForm.endTime || !currentForm.endTime.trim()) missingFields.push("종료 시간");

    if (missingFields.length > 0) {
      console.error("[EventSettingPanel] 비어있는 필드:", missingFields);
      console.error("[EventSettingPanel] 현재 폼 데이터:", currentForm);
      alert(`비어 있는 입력폼을 작성해주세요.\n누락된 필드: ${missingFields.join(", ")}`);
      return;
    }

    // 레벨 검증
    const levelError = validateLevels(currentForm.levels);
    if (levelError) {
      setValidationError(levelError);
      alert(levelError);
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
      alert("이벤트 하나 이상 추가하세요.");
      return;
    }

    if (!selectedInstanceId) {
      alert("인스턴스를 선택해주세요.");
      return;
    }

    // 모든 이벤트의 레벨 검증
    for (const event of createdCards) {
      const levelError = validateLevels(event.levels);
      if (levelError) {
        alert(`${event.name}: ${levelError}`);
        return;
      }
    }

    const hasEmptyField = createdCards.some((event) => {
      return (
        !policyName.trim() ||
        !event.resources.trim() ||
        !event.metricKey ||
        !event.frequency.trim() ||
        event.days.length === 0 ||
        !event.startTime.trim() ||
        !event.endTime.trim()
      );
    });

    if (hasEmptyField) {
      alert("비어 있는 입력폼을 작성해주세요.");
      return;
    }

    // TODO: API 호출로 정책 생성
    // const memberId = 3; // 실제 사용자 ID
    // await createPolicy({ ... });

    const newPolicy: Policy = {
      id: policies.length,
      name: policyName,
      events: createdCards,
    };

    const updated = [...policies, newPolicy];
    setPolicies(updated);
    setIsInitial(true);
    setCreatedCards([]);
    setInputForms([createEmptyEvent(0)]);
    setPolicyName("");

    if (onPoliciesChange) onPoliciesChange(updated);
    alert(
      "정책이 성공적으로 저장되었습니다. \n설정 기록 탭에서 확인할 수 있습니다."
    );
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

  const handleConfirmDelete = () => {
    if (targetIndex !== null) {
      setCreatedCards((prev) => prev.filter((_, i) => i !== targetIndex));
      setTargetIndex(null);
      setIsModalOpen(false);
      if (createdCards.length <= 1) setIsInitial(true);
    }
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
                      <DaysSelector
                        selectedDays={event.days}
                        onToggle={(day) => toggleDay(index, day)}
                      />
                    </div>

                    <TimeInput
                      label="시작 시간"
                      value={event.startTime}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, startTime: e.target.value }
                              : ev
                          )
                        )
                      }
                    />

                    <TimeInput
                      label="종료 시간"
                      value={event.endTime}
                      onChange={(e) =>
                        setInputForms((prev) =>
                          prev.map((ev, i) =>
                            i === index
                              ? { ...ev, endTime: e.target.value }
                              : ev
                          )
                        )
                      }
                    />
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
                      추가된 이벤트 ({createdCards.length})
                    </div>
                  </div>

                  {createdCards.map((card, index) => (
                    <div className="event-card__header-list" key={card.id}>
                      <div className="event-card__header-list-title">
                        {card.name}
                      </div>
                      <Button
                        text="삭제"
                        size="sm"
                        variant="error"
                        onClick={() => {
                          setTargetIndex(index);
                          setIsModalOpen(true);
                        }}
                      />
                    </div>
                  ))}
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

          {isModalOpen && (
            <Modal
              title="이벤트 삭제"
              onClose={() => setIsModalOpen(false)}
              onConfirm={handleConfirmDelete}
              confirmText="확인"
              cancelText="취소"
              fields={[
                {
                  label:
                    "이벤트를 삭제하면 더 이상 해당 알림을 받을 수 없습니다.\n정말 삭제하시겠습니까?",
                },
              ]}
            />
          )}

        </div>
      )}
    </div>
  );
};

export default EventSettingPanel;




