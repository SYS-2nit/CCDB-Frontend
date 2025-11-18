import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState, useEffect } from "react";
import "./AlertEventSetting.scss";
import Modal, { type FieldItem } from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import Switch from "@/components/Toggle/Switch";
import type { EventCard } from "./EventSettingPanel/EventSettingPanel";
import EventSettingPanel from "./EventSettingPanel/EventSettingPanel";
import { useDashboardContext } from "@/state/DashboardContext";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  testNotification,
  fetchPolicies,
  fetchEventsByPolicy,
  togglePolicy,
  toggleEvent,
  deletePolicy,
  type AlertPolicyResponse,
  type AlertEventResponse,
} from "@/api/alerts";

type AlertTabType = "1" | "2";

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
  eventStates?: boolean[]; // 이벤트 상태 정보 (임시 저장용)
}


const AlertEventSetting: React.FC = () => {
  const memberId = 3; // 기본 사용자 ID
  const [isReceiveModal, setIsReceiveModal] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<{
    email: string;
    slackAddress: string;
    warningChannel: string;
    dangerChannel: string;
    criticalChannel: string;
  }>({
    email: "",
    slackAddress: "",
    warningChannel: "",
    dangerChannel: "",
    criticalChannel: "",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestResultModalOpen, setIsTestResultModalOpen] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<{
    email: string;
    slackAddress: string;
    warningChannel: string;
    dangerChannel: string;
    criticalChannel: string;
  } | null>(null);
  const [hasTested, setHasTested] = useState(false);

  // 수신 설정 모달 열릴 때 항상 DB에서 최신 설정 조회
  useEffect(() => {
    if (isReceiveModal) {
      loadNotificationSettings();
      setHasTested(false);
    }
  }, [isReceiveModal]);

  // 모달이 닫힐 때 원본 값 복원 (테스트만 하고 저장하지 않은 경우)
  useEffect(() => {
    if (!isReceiveModal && hasTested && originalSettings) {
      console.log("[AlertEventSetting] 모달 닫힘 - 원본 값으로 복원");
      // 원본 값으로 DB 복원
      restoreOriginalSettings();
      setHasTested(false);
      setOriginalSettings(null);
    }
  }, [isReceiveModal, hasTested, originalSettings]);

  const loadNotificationSettings = async () => {
    setIsLoadingSettings(true);
    try {
      console.log(`[AlertEventSetting] 알림 설정 조회 시작: memberId=${memberId}`);
      // 항상 DB에서 최신 값 조회
      const settings = await fetchNotificationSettings(memberId);
      console.log("[AlertEventSetting] 알림 설정 조회 성공:", settings);
      const loadedSettings = {
        email: settings.email || "",
        slackAddress: settings.slackAddress || "",
        warningChannel: settings.warningChannel || "",
        dangerChannel: settings.dangerChannel || "",
        criticalChannel: settings.criticalChannel || "",
      };
      // 상태를 항상 최신 DB 값으로 초기화
      setNotificationSettings(loadedSettings);
      // 원본 값도 최신 DB 값으로 저장
      setOriginalSettings(loadedSettings);
    } catch (error: any) {
      console.error("[AlertEventSetting] 알림 설정 조회 실패:", error);
      console.error("[AlertEventSetting] 에러 상세:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      const errorMessage = error?.response?.data?.message || error?.message || "알림 설정을 불러오는데 실패했습니다.";
      alert(`알림 설정 조회 실패: ${errorMessage}`);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const restoreOriginalSettings = async () => {
    if (!originalSettings) return;
    try {
      console.log("[AlertEventSetting] 원본 값으로 복원 시작:", originalSettings);
      await updateNotificationSettings(memberId, {
        email: originalSettings.email || null,
        slackAddress: originalSettings.slackAddress || null,
        warningChannel: (originalSettings.warningChannel as "email" | "slack") || null,
        dangerChannel: (originalSettings.dangerChannel as "email" | "slack") || null,
        criticalChannel: (originalSettings.criticalChannel as "email" | "slack") || null,
      });
      console.log("[AlertEventSetting] 원본 값으로 복원 완료");
      // 상태도 원본으로 복원
      setNotificationSettings(originalSettings);
    } catch (error) {
      console.error("[AlertEventSetting] 원본 값 복원 실패:", error);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateNotificationSettings(memberId, {
        email: notificationSettings.email || null,
        slackAddress: notificationSettings.slackAddress || null,
        warningChannel: (notificationSettings.warningChannel as "email" | "slack") || null,
        dangerChannel: (notificationSettings.dangerChannel as "email" | "slack") || null,
        criticalChannel: (notificationSettings.criticalChannel as "email" | "slack") || null,
      });
      // 저장 성공 시 원본 값 업데이트 (복원할 필요 없음)
      setOriginalSettings({
        email: notificationSettings.email,
        slackAddress: notificationSettings.slackAddress,
        warningChannel: notificationSettings.warningChannel,
        dangerChannel: notificationSettings.dangerChannel,
        criticalChannel: notificationSettings.criticalChannel,
      });
      setHasTested(false); // 저장했으므로 복원 불필요
      setIsReceiveModal(false);
    } catch (error: any) {
      console.error("[AlertEventSetting] 알림 설정 저장 실패:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "알림 설정 저장에 실패했습니다.";
      alert(`알림 설정 저장 실패: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      // 입력값 검증
      const channels: string[] = [];
      if (notificationSettings.email) channels.push("email");
      if (notificationSettings.slackAddress) channels.push("slack");
      
      if (channels.length === 0) {
        setTestResult("테스트할 채널이 없습니다.\nEmail 또는 Slack 주소를 입력해주세요.");
        setIsTestResultModalOpen(true);
        setIsTesting(false);
        return;
      }

      // 테스트 전에 임시 저장 (입력한 값으로 DB 업데이트)
      // 백엔드 API가 DB의 값을 사용하므로 테스트를 위해 임시 저장 필요
      console.log("[AlertEventSetting] 테스트를 위한 임시 저장 시작:", notificationSettings);
      await updateNotificationSettings(memberId, {
        email: notificationSettings.email || null,
        slackAddress: notificationSettings.slackAddress || null,
        warningChannel: (notificationSettings.warningChannel as "email" | "slack") || null,
        dangerChannel: (notificationSettings.dangerChannel as "email" | "slack") || null,
        criticalChannel: (notificationSettings.criticalChannel as "email" | "slack") || null,
      });
      console.log("[AlertEventSetting] 테스트를 위한 임시 저장 완료");
      setHasTested(true); // 테스트 실행 표시

      // 저장된 값으로 테스트 실행
      const result = await testNotification(memberId, { channels });
      setTestResult(result || "테스트 알림이 전송되었습니다.");
      setIsTestResultModalOpen(true);
      
      // 테스트 후 원본 값으로 즉시 복원 (저장하지 않음)
      if (originalSettings) {
        console.log("[AlertEventSetting] 테스트 완료 - 원본 값으로 즉시 복원");
        await updateNotificationSettings(memberId, {
          email: originalSettings.email || null,
          slackAddress: originalSettings.slackAddress || null,
          warningChannel: (originalSettings.warningChannel as "email" | "slack") || null,
          dangerChannel: (originalSettings.dangerChannel as "email" | "slack") || null,
          criticalChannel: (originalSettings.criticalChannel as "email" | "slack") || null,
        });
        console.log("[AlertEventSetting] 원본 값으로 복원 완료");
        // 상태는 그대로 유지 (사용자가 입력한 값)
      }
    } catch (error: any) {
      console.error("[AlertEventSetting] 알림 테스트 실패:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "알림 테스트에 실패했습니다.";
      setTestResult(`테스트 실패: ${errorMessage}`);
      setIsTestResultModalOpen(true);
    } finally {
      setIsTesting(false);
    }
  };

  const handleFieldChange = (label: string, value: string) => {
    // 필드 이름 매핑 (UI label -> state key)
    const fieldMap: Record<string, keyof typeof notificationSettings> = {
      Slack: "slackAddress",
      Email: "email",
      Critical: "criticalChannel",
      Warning: "warningChannel",
      Danger: "dangerChannel",
    };
    
    const stateKey = fieldMap[label] || label.toLowerCase();
    setNotificationSettings((prev) => ({
      ...prev,
      [stateKey]: value,
    }));
  };
  const { selectedInstanceId } = useDashboardContext();
  const [isEventModal, setIsEventModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const [openPanel, setOpenPanel] = useState<boolean>(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyStates, setPolicyStates] = useState<boolean[]>([]);
  const [eventStates, setEventStates] = useState<boolean[][]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [expandedPolicies, setExpandedPolicies] = useState<Set<number>>(new Set());

  const tabs = [
    { id: "1", label: "정책 설정" },
    { id: "2", label: "설정 기록" },
  ] as const;

  const handleToggle = () => setOpenPanel((prev) => !prev);

  // 비트마스크를 요일 배열로 변환
  const bitmaskToDays = (bitmask: number | null): string[] => {
    if (!bitmask) return [];
    const dayMap: Record<number, string> = {
      1: "월",
      2: "화",
      4: "수",
      8: "목",
      16: "금",
      32: "토",
      64: "일",
    };
    const days: string[] = [];
    Object.entries(dayMap).forEach(([value, day]) => {
      if (bitmask & Number(value)) {
        days.push(day);
      }
    });
    return days;
  };

  // DelayTime을 frequency 문자열로 변환
  const delayTimeToFrequency = (delayTime: string | null): string => {
    switch (delayTime) {
      case "ONE_MINUTE":
        return "ONE_MINUTE";
      case "FIVE_MINUTES":
        return "FIVE_MINUTES";
      case "TEN_MINUTES":
        return "TEN_MINUTES";
      case "ONE_HOUR":
        return "ONE_HOUR";
      default:
        return "ONE_MINUTE";
    }
  };

  // AlertCategory를 resources 문자열로 변환
  const categoryToResources = (category: string | null): string => {
    switch (category) {
      case "CPU":
        return "CPU";
      case "MEMORY":
        return "Memory";
      case "SESSION":
        return "Session";
      case "IO":
        return "I/O";
      case "STORAGE":
        return "Storage";
      default:
        return "CPU";
    }
  };

  // AlertEventResponse를 EventCard로 변환
  const convertEventToCard = (event: AlertEventResponse): EventCard => {
    return {
      id: event.id,
      name: event.metricName || event.name,
      frequency: delayTimeToFrequency(event.delayTime),
      resources: categoryToResources(event.category),
      eventName: event.name,
      graphId: event.graphId,
      metricKey: event.metricKey,
      metricName: event.metricName,
      thresholdFormat: event.thresholdFormat,
      days: bitmaskToDays(event.days),
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      levels: {
        warning: event.warning,
        danger: event.danger,
        critical: event.critical,
      },
    };
  };

  // 정책 목록 및 이벤트 목록 조회
  const loadPolicies = async () => {
    if (!selectedInstanceId) {
      setPolicies([]);
      return;
    }

    setIsLoadingPolicies(true);
    try {
      console.log("[AlertEventSetting] 정책 목록 조회 시작:", {
        memberId,
        instanceId: selectedInstanceId,
      });

      // 정책 목록 조회
      const policyList = await fetchPolicies(memberId, selectedInstanceId);
      console.log("[AlertEventSetting] 정책 목록 조회 성공:", policyList);

      // 각 정책의 이벤트 목록 조회
      const policiesWithEvents = await Promise.all(
        policyList.map(async (policy) => {
          try {
            const events = await fetchEventsByPolicy(policy.id);
            console.log(
              `[AlertEventSetting] 정책 ${policy.id}의 이벤트 목록:`,
              events
            );
            return {
              id: policy.id,
              name: policy.name,
              events: events.map(convertEventToCard),
              isActive: policy.isActive,
              eventStates: events.map((e) => e.state), // 이벤트 상태 저장
            };
          } catch (error) {
            console.error(
              `[AlertEventSetting] 정책 ${policy.id}의 이벤트 조회 실패:`,
              error
            );
            return {
              id: policy.id,
              name: policy.name,
              events: [],
              isActive: policy.isActive,
              eventStates: [],
            };
          }
        })
      );

      setPolicies(policiesWithEvents);

      // 정책 및 이벤트 상태 초기화
      setPolicyStates(policiesWithEvents.map((p) => p.isActive));
      setEventStates(policiesWithEvents.map((p) => p.eventStates || []));
    } catch (error: any) {
      console.error("[AlertEventSetting] 정책 목록 조회 실패:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "정책 목록을 불러오는데 실패했습니다.";
      alert(`정책 목록 조회 실패: ${errorMessage}`);
      setPolicies([]);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  // 설정 기록 탭이 활성화될 때 정책 목록 조회
  useEffect(() => {
    if (activeTab === "2") {
      loadPolicies();
    }
  }, [activeTab, selectedInstanceId, memberId]);

  /* 정책 / 이벤트 상태 초기화 */
  useEffect(() => {
    setPolicyStates((prev) => {
      const next = [...prev];
      while (next.length < policies.length) next.push(false);
      while (next.length > policies.length) next.pop();
      return next;
    });

    setEventStates((prev) =>
      policies.map((p, i) => {
        const prevArr = prev[i] || [];
        const next = [...prevArr];
        while (next.length < p.events.length) next.push(false);
        while (next.length > p.events.length) next.pop();
        return next;
      })
    );
  }, [policies]);

  /* 정책 on/off */
  const handlePolicyToggle = async (
    policyIndex: number,
    checked: boolean
  ) => {
    const policy = policies[policyIndex];
    if (!policy) return;

    try {
      // API 호출
      await togglePolicy(policy.id);
      console.log(
        `[AlertEventSetting] 정책 ${policy.id} 토글 성공: ${checked}`
      );

      // 로컬 state 업데이트
      setPolicyStates((prev) => {
        const updated = [...prev];
        updated[policyIndex] = checked;
        return updated;
      });
      setEventStates((prev) => {
        const updated = [...prev];
        updated[policyIndex] = updated[policyIndex].map(() => checked);
        return updated;
      });
    } catch (error: any) {
      console.error(
        `[AlertEventSetting] 정책 ${policy.id} 토글 실패:`,
        error
      );
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "정책 상태 변경에 실패했습니다.";
      alert(`정책 상태 변경 실패: ${errorMessage}`);
    }
  };

  /* 이벤트 on/off */
  const handleEventToggle = async (
    policyIndex: number,
    eventIndex: number,
    checked: boolean
  ) => {
    const policy = policies[policyIndex];
    const event = policy?.events[eventIndex];
    if (!event) return;

    try {
      // API 호출
      await toggleEvent(event.id);
      console.log(
        `[AlertEventSetting] 이벤트 ${event.id} 토글 성공: ${checked}`
      );

      // 로컬 state 업데이트
      setEventStates((prev) => {
        const updated = [...prev];
        updated[policyIndex][eventIndex] = checked;

        const hasActive = updated[policyIndex].some(Boolean);
        setPolicyStates((prevPolicy) => {
          const newPolicy = [...prevPolicy];
          newPolicy[policyIndex] = hasActive;
          return newPolicy;
        });
        return updated;
      });
    } catch (error: any) {
      console.error(
        `[AlertEventSetting] 이벤트 ${event.id} 토글 실패:`,
        error
      );
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "이벤트 상태 변경에 실패했습니다.";
      alert(`이벤트 상태 변경 실패: ${errorMessage}`);
    }
  };

  /* 정책 펼치기/접기 토글 */
  const handlePolicyExpand = (policyId: number) => {
    setExpandedPolicies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(policyId)) {
        newSet.delete(policyId);
      } else {
        newSet.add(policyId);
      }
      return newSet;
    });
  };

  /* 이벤트 클릭 시 상세 모달 (토글 버튼 제외) */
  const handleEventClick = (event: EventCard) => {
    setSelectedEvent(event);
    setIsEventModal(true);
  };

  /* 정책 삭제 */
  const handleDeletePolicy = async (policyIndex: number) => {
    const policy = policies[policyIndex];
    if (!policy) return;

    if (!confirm(`정책 "${policy.name}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      // API 호출
      await deletePolicy(policy.id);
      console.log(`[AlertEventSetting] 정책 ${policy.id} 삭제 성공`);

      // 로컬 state 업데이트
      setPolicies((prev) => prev.filter((_, i) => i !== policyIndex));
      setPolicyStates((prev) => prev.filter((_, i) => i !== policyIndex));
      setEventStates((prev) => prev.filter((_, i) => i !== policyIndex));
    } catch (error: any) {
      console.error(`[AlertEventSetting] 정책 ${policy.id} 삭제 실패:`, error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "정책 삭제에 실패했습니다.";
      alert(`정책 삭제 실패: ${errorMessage}`);
    }
  };

  // 페이지네이션 제거 - 전체 정책을 스크롤로 확인

  /* 이벤트 상세 모달 필드 */
  const eventFields: FieldItem[] = selectedEvent
    ? [
        {
          label: "이벤트 이름",
          type: "text",
          placeholder: selectedEvent.eventName,
        },
        {
          label: "누적 횟수",
          type: "text",
          placeholder: selectedEvent.frequency,
        },
        {
          label: "자원",
          type: "text",
          placeholder: selectedEvent.resources,
        },
        {
          label: "요일",
          type: "text",
          placeholder: selectedEvent.days.join(", "),
        },
        {
          label: "시작 시간",
          type: "text",
          placeholder: selectedEvent.startTime,
        },
        {
          label: "종료 시간",
          type: "text",
          placeholder: selectedEvent.endTime,
        },
        {
          label: "레벨 설정",
          type: "table",
          tableHeaders: ["구간", "값"],
          tableData: [
            {
              구간: "Warning",
              값: `${selectedEvent.levels.warning}${selectedEvent.thresholdFormat === "PERCENT" ? "%" : selectedEvent.thresholdFormat === "MBPS" ? "MBPS" : selectedEvent.thresholdFormat === "MS" ? "MS" : "COUNT"}`,
            },
            {
              구간: "Danger",
              값: `${selectedEvent.levels.danger}${selectedEvent.thresholdFormat === "PERCENT" ? "%" : selectedEvent.thresholdFormat === "MBPS" ? "MBPS" : selectedEvent.thresholdFormat === "MS" ? "MS" : "COUNT"}`,
            },
            {
              구간: "Critical",
              값: `${selectedEvent.levels.critical}${selectedEvent.thresholdFormat === "PERCENT" ? "%" : selectedEvent.thresholdFormat === "MBPS" ? "MBPS" : selectedEvent.thresholdFormat === "MS" ? "MS" : "COUNT"}`,
            },
          ],
        },
      ]
    : [];

  return (
    <div className="alert-setting">
      {/* 상단 탭 + 수신 설정 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <TabMenu tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <Button
          text="수신 설정"
          size="sm"
          variant="white"
          onClick={() => setIsReceiveModal(true)}
        />
      </div>

      {/* 기본 탭 */}
      {activeTab === "1" && (
        <EventSettingPanel
          title="정책 설정"
          isOpen={openPanel}
          onToggle={handleToggle}
          mode="default"
          onPoliciesChange={(updatedPolicies) => {
            setPolicies(updatedPolicies);
            // 정책 저장 후 설정 기록 탭으로 자동 전환
            if (updatedPolicies.length > 0 && activeTab === "1") {
              setActiveTab("2");
              // 정책 목록 새로고침
              setTimeout(() => {
                loadPolicies();
              }, 500);
            }
          }}
        />
      )}

      {/* 설정 기록 탭 */}
      {activeTab === "2" && (
        <div className="log-policy">
          {isLoadingPolicies ? (
            <div className="log-policy-empty">정책 목록을 불러오는 중...</div>
          ) : !selectedInstanceId ? (
            <div className="log-policy-empty">인스턴스를 선택해주세요.</div>
          ) : policies.length === 0 ? (
            <div className="log-policy-empty">저장된 정책이 없습니다.</div>
          ) : (
            <div className="log-policy-scroll">
              {policies.map((policy, policyIndex) => {
                const isExpanded = expandedPolicies.has(policy.id);
                return (
                  <div
                    key={policy.id}
                    className={`log-policy-container ${
                      policyStates[policyIndex] ? "" : "disabled"
                    }`}
                  >
                    {/* 정책 헤더 */}
                    <div className="log-policy-container-title">
                      <div className="log-policy-container-title-left">
                        <button
                          className="log-policy-expand-btn"
                          onClick={() => handlePolicyExpand(policy.id)}
                          aria-label={isExpanded ? "접기" : "펼치기"}
                        >
                          {isExpanded ? "▼" : "▶"}
                        </button>
                        <div
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <Switch
                            checked={policyStates[policyIndex] || false}
                            onChange={(checked) =>
                              handlePolicyToggle(policyIndex, checked)
                            }
                            size="sm"
                          />
                        </div>
                        {policy.name}
                      </div>
                      <Button
                        text="삭제"
                        size="sm"
                        variant="error"
                        onClick={() => handleDeletePolicy(policyIndex)}
                      />
                    </div>

                    {/* 이벤트 리스트 (펼쳐진 경우에만 표시) */}
                    {isExpanded && (
                      <div className="log-policy-events">
                        {policy.events.map((event, eventIndex) => (
                          <div
                            key={event.id}
                            className="log-policy-container-content clickable"
                            onClick={() => handleEventClick(event)}
                          >
                            <div
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            >
                              <Switch
                                checked={
                                  eventStates[policyIndex]?.[eventIndex] ||
                                  false
                                }
                                onChange={(checked) =>
                                  handleEventToggle(
                                    policyIndex,
                                    eventIndex,
                                    checked
                                  )
                                }
                                size="sm"
                              />
                            </div>
                            <div className="log-policy-event-name">
                              {event.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 수신 설정 모달 */}
      {isReceiveModal && (
        <Modal
          title="수신 설정"
          cancelText={isTesting ? "테스트 중..." : "테스트"}
          confirmText={isSaving ? "저장 중..." : "저장"}
          onClose={() => setIsReceiveModal(false)}
          onConfirm={handleSaveSettings}
          onReset={handleTestNotification}
          fields={[
            {
              label: "Slack",
              type: "textarea",
              placeholder: "https://hooks.slack.com/services/...",
              value: notificationSettings.slackAddress,
              onChange: handleFieldChange,
            },
            {
              label: "Email",
              type: "textarea",
              placeholder: "example@company.com",
              value: notificationSettings.email,
              onChange: handleFieldChange,
            },
            {
              label: "Critical",
              type: "select",
              placeholder: "주요 알림 채널을 선택해주세요.",
              options: ["slack", "email"],
              value: notificationSettings.criticalChannel,
              onChange: handleFieldChange,
            },
            {
              label: "Warning",
              type: "select",
              placeholder: "주요 알림 채널을 선택해주세요.",
              options: ["slack", "email"],
              value: notificationSettings.warningChannel,
              onChange: handleFieldChange,
            },
            {
              label: "Danger",
              type: "select",
              placeholder: "주요 알림 채널을 선택해주세요.",
              options: ["slack", "email"],
              value: notificationSettings.dangerChannel,
              onChange: handleFieldChange,
            },
          ]}
          theme="light"
          onChange={(label, value) => {
            handleFieldChange(label, value);
          }}
          isTesting={isTesting}
          isSaving={isSaving}
        />
      )}

      {/* 테스트 결과 모달 */}
      {isTestResultModalOpen && (
        <Modal
          title="테스트 결과"
          confirmText="확인"
          onClose={() => {
            setIsTestResultModalOpen(false);
            setTestResult(null);
          }}
          onConfirm={() => {
            setIsTestResultModalOpen(false);
            setTestResult(null);
          }}
          fields={[]}
          theme="light"
        >
          <div style={{ 
            padding: "20px 0",
            lineHeight: "1.8",
            fontSize: "14px",
            color: "#333"
          }}>
            {(() => {
              if (!testResult) return null;
              
              // 이메일과 Slack 메시지 파싱
              // 이메일: "이메일 테스트 전송 완료: 이메일주소. "
              const emailMatch = testResult.match(/이메일 테스트 전송 완료:\s*([^\s.]+(?:\.[^\s.]+)*)/);
              // Slack: "Slack 테스트 전송 완료: URL. " (URL은 https://로 시작)
              const slackMatch = testResult.match(/Slack 테스트 전송 완료:\s*([^\s.]+(?:\.[^\s.]+)*)/);
              const isError = testResult.includes("실패") || testResult.includes("없습니다");
              
              const results = [];
              
              // 이메일 결과
              if (emailMatch) {
                const email = emailMatch[1];
                results.push({
                  type: "email",
                  title: "이메일 테스트 전송 완료",
                  value: email,
                });
              }
              
              // Slack 결과 - 더 정확한 파싱
              // "Slack 테스트 전송 완료: " 다음에 오는 모든 문자를 URL로 간주 (마지막 . 제외)
              const slackFullMatch = testResult.match(/Slack 테스트 전송 완료:\s*([^.]+)/);
              if (slackFullMatch) {
                const slackUrl = slackFullMatch[1].trim();
                results.push({
                  type: "slack",
                  title: "Slack 테스트 전송 완료",
                  value: slackUrl,
                });
              }
              
              // 에러 메시지
              if (isError && results.length === 0) {
                results.push({
                  type: "error",
                  title: testResult,
                  value: null,
                });
              }
              
              return results.map((result, index) => (
                <div 
                  key={index} 
                  style={{ 
                    marginBottom: "16px",
                    padding: "12px",
                    backgroundColor: result.type === "error" ? "#fff5f5" : "#f0f9ff",
                    borderRadius: "6px",
                    borderLeft: `3px solid ${
                      result.type === "error" ? "#ef4444" : 
                      result.type === "email" ? "#3b82f6" : "#10b981"
                    }`,
                  }}
                >
                  <div style={{ 
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px"
                  }}>
                    <span style={{ 
                      fontSize: "16px",
                      lineHeight: "1",
                      marginTop: "2px",
                      flexShrink: 0
                    }}>
                      {result.type === "error" ? "❌" : "✅"}
                    </span>
                    <span style={{ flex: 1, fontWeight: "500" }}>
                      {result.title}
                    </span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </Modal>
      )}

      {/* 이벤트 상세 모달 */}
      {selectedEvent && isEventModal && (
        <Modal
          title="이벤트 상세"
          onClose={() => {
            setIsEventModal(false);
            setSelectedEvent(null);
          }}
          onConfirm={() => {
            setIsEventModal(false);
            setSelectedEvent(null);
          }}
          fields={eventFields}
          confirmText="닫기"
          hideCancelButton
          theme="light"
        />
      )}
    </div>
  );
};

export default AlertEventSetting;
