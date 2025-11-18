import TabMenu from "@/components/Tabs/TabMenu";
import React, { useState, useEffect } from "react";
import "./AlertEventSetting.scss";
import Modal, { type FieldItem } from "@/components/Modal/Modal";
import Button from "@/components/Button/Button";
import Switch from "@/components/Toggle/Switch";
import Pagination from "@/components/Pagination/Pagination";
import type { EventCard } from "./EventSettingPanel/EventSettingPanel";
import EventSettingPanel from "./EventSettingPanel/EventSettingPanel";
import {
  fetchNotificationSettings,
  updateNotificationSettings,
  testNotification,
} from "@/api/alerts";

type AlertTabType = "1" | "2";

interface Policy {
  id: number;
  name: string;
  events: EventCard[];
}

const ITEMS_PER_PAGE = 3;

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
  const [isEventModal, setIsEventModal] = useState(false);
  const [activeTab, setActiveTab] = useState<AlertTabType>("1");
  const [openPanel, setOpenPanel] = useState<boolean>(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyStates, setPolicyStates] = useState<boolean[]>([]);
  const [eventStates, setEventStates] = useState<boolean[][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<EventCard | null>(null);

  const tabs = [
    { id: "1", label: "기본" },
    { id: "2", label: "설정 기록" },
  ] as const;

  const handleToggle = () => setOpenPanel((prev) => !prev);

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
  const handlePolicyToggle = (policyIndex: number, checked: boolean) => {
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
  };

  /* 이벤트 on/off */
  const handleEventToggle = (
    policyIndex: number,
    eventIndex: number,
    checked: boolean
  ) => {
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
  };

  /* 이벤트 클릭 시 상세 모달 */
  const handleEventClick = (event: EventCard) => {
    setSelectedEvent(event);
    setIsEventModal(true);
  };

  /* 정책 삭제 */
  const handleDeletePolicy = (policyIndex: number) => {
    setPolicies((prev) => prev.filter((_, i) => i !== policyIndex));
    setPolicyStates((prev) => prev.filter((_, i) => i !== policyIndex));
    setEventStates((prev) => prev.filter((_, i) => i !== policyIndex));
  };

  /* 페이지네이션 계산 */
  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPolicies = policies.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
          onPoliciesChange={(updatedPolicies) => setPolicies(updatedPolicies)}
        />
      )}

      {/* 설정 기록 탭 */}
      {activeTab === "2" && (
        <div className="log-policy">
          {policies.length === 0 ? (
            <div className="log-policy-empty">저장된 정책이 없습니다.</div>
          ) : (
            <>
              {paginatedPolicies.map((policy, policyIndex) => {
                const globalIndex = startIdx + policyIndex;
                return (
                  <div
                    key={policy.id}
                    className={`log-policy-container ${
                      policyStates[globalIndex] ? "" : "disabled"
                    }`}
                  >
                    {/* 정책 헤더 */}
                    <div className="log-policy-container-title">
                      <div className="log-policy-container-title-left">
                        <Switch
                          checked={policyStates[globalIndex] || false}
                          onChange={(checked) =>
                            handlePolicyToggle(globalIndex, checked)
                          }
                          size="sm"
                        />
                        {policy.name}
                      </div>
                      <Button
                        text="삭제"
                        size="sm"
                        variant="error"
                        onClick={() => handleDeletePolicy(globalIndex)}
                      />
                    </div>

                    {/* 이벤트 리스트 */}
                    {policy.events.map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="log-policy-container-content clickable"
                        onClick={() => handleEventClick(event)}
                      >
                        <Switch
                          checked={
                            eventStates[globalIndex]?.[eventIndex] || false
                          }
                          onChange={(checked) =>
                            handleEventToggle(globalIndex, eventIndex, checked)
                          }
                          size="sm"
                        />
                        <div>{event.name}</div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* 페이지네이션 */}
              {policies.length > ITEMS_PER_PAGE && (
                <div className="log-policy__pagination">
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
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
          cancelText="취소"
          theme="light"
        />
      )}
    </div>
  );
};

export default AlertEventSetting;
