import React, { useState, useEffect } from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/components/Card/ChartSetting";
import { chartData } from "./data/chartData";
import StatusCard from "@/components/Card/StatusCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cloneDeep } from "lodash";
import TabMenu from "@/components/Tabs/TabMenu";

export type TabType = keyof typeof chartData;

interface DashboardProps {
  /** 처음 보여줄 탭 (예: "cpu", "memory" 등) */
  initialTab?: TabType;
  /** 선택된 탭만 보여줄지 여부 (모달 전용) */
  singleTabMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({
  initialTab = "main",
  singleTabMode = false,
}) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [charts, setCharts] = useState<string[]>(() =>
    cloneDeep(chartData[initialTab])
  );

  const handleSettingToggle = () => setIsSettingOpen((prev) => !prev);

  const tabs = [
    { id: "main", label: "Main Custom" },
    { id: "cpu", label: "CPU" },
    { id: "memory", label: "Memory" },
    { id: "session", label: "Session" },
    { id: "io", label: "I/O" },
    { id: "storage", label: "Storage" },
  ] as const;

  useEffect(() => {
    setActiveTab(initialTab);
    setCharts(cloneDeep(chartData[initialTab]));
  }, [initialTab]);

  useEffect(() => {
    setCharts(cloneDeep(chartData[activeTab]));
  }, [activeTab]);

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination) return;

    setCharts((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      return reordered;
    });
  };

  /** singleTabMode일 때는 activeTab 하나만 렌더링 */
  const visibleTabs = singleTabMode
    ? tabs.filter((tab) => tab.id === initialTab)
    : tabs;

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      {/* 탭 메뉴 — singleTabMode일 경우 해당 탭만 표시 */}
      {!singleTabMode && (
        <TabMenu
          tabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />
      )}

      <div className="dashboard__content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="charts" direction="horizontal">
            {(provided) => (
              <div
                className="dashboard__grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {activeTab !== "main" && (
                  <div className="status-cards">
                    <StatusCard label="무해" value={0} color="safe" />
                    <StatusCard label="주의" value={0} color="warning" />
                    <StatusCard label="위험" value={0} color="danger" />
                    <StatusCard label="치명" value={0} color="critical" />
                  </div>
                )}

                {charts.map((title, index) => (
                  <Draggable
                    key={title}
                    draggableId={title}
                    index={index}
                    isDragDisabled={activeTab !== "main"}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ChartCard
                          title={title}
                          status={
                            title.includes("지연량") ? "warning" : "normal"
                          }
                          onSettingClick={handleSettingToggle}
                          showDragIcon={!singleTabMode && activeTab === "main"}
                          showSettingIcon={
                            !singleTabMode && activeTab === "main"
                          }
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isSettingOpen && <ChartSetting onClose={handleSettingToggle} />}
      </div>
    </div>
  );
};

export default Dashboard;
