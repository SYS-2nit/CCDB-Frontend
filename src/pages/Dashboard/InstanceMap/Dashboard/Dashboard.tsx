import React, { useState, useEffect } from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/pages/Dashboard/InstanceMap/Dashboard/Card/ChartSetting";
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
  initialTab?: TabType;
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
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  const handleSettingOpen = (index: number) => {
    setTargetIndex(index);
    setIsSettingOpen(true);
  };
  const handleSettingToggle = () => setIsSettingOpen((prev) => !prev);

  // 선택한 그래프 저장 (메인 탭만)
  const handleSaveChart = (newChartTitle: string) => {
    if (targetIndex === null) return;
    setCharts((prev) =>
      prev.map((c, i) => (i === targetIndex ? newChartTitle : c))
    );
    setIsSettingOpen(false);
    setTargetIndex(null);
  };

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

  const visibleTabs = singleTabMode
    ? tabs.filter((tab) => tab.id === initialTab)
    : tabs;

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      {!singleTabMode && (
        <TabMenu
          tabs={visibleTabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
        />
      )}

      <div className="dashboard__content">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="charts">
            {(provided) => (
              <div
                className={`dashboard__grid ${
                  activeTab === "main"
                    ? "dashboard__grid--main"
                    : "dashboard__grid--other"
                }`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {/* 메인 탭일 경우 */}
                {activeTab === "main" &&
                  charts.map((title, index) => (
                    <Draggable
                      key={`${title}-${index}`}
                      draggableId={`${title}-${index}`}
                      index={index}
                      isDragDisabled={false}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ChartCard
                            title={title}
                            status="normal"
                            onSettingClick={() => handleSettingOpen(index)}
                            showDragIcon
                            showSettingIcon
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                {/* 메인 제외 탭 */}
                {activeTab !== "main" && (
                  <>
                    <div className="dashboard__row row-1">
                      <div className="dashboard__status-wrap">
                        <StatusCard label="정상" value={2} color="safe" />
                        <StatusCard label="주의" value={5} color="warning" />
                        <StatusCard label="위험" value={8} color="danger" />
                        <StatusCard label="에러" value={1} color="critical" />
                      </div>
                      {charts[0] && (
                        <ChartCard
                          title={charts[0]}
                          status="normal"
                          onSettingClick={handleSettingToggle}
                          showDragIcon={false}
                          showSettingIcon={false}
                        />
                      )}
                    </div>

                    <div className="dashboard__row row-2">
                      {charts.slice(1, 3).map((title) => (
                        <ChartCard
                          key={title}
                          title={title}
                          status="normal"
                          onSettingClick={handleSettingToggle}
                          showDragIcon={false}
                          showSettingIcon={false}
                        />
                      ))}
                    </div>

                    <div className="dashboard__row row-3">
                      {charts.slice(3, 5).map((title) => (
                        <ChartCard
                          key={title}
                          title={title}
                          status="normal"
                          onSettingClick={handleSettingToggle}
                          showDragIcon={false}
                          showSettingIcon={false}
                        />
                      ))}
                    </div>

                    <div className="dashboard__row row-4">
                      {charts.slice(5, 8).map((title) => (
                        <ChartCard
                          key={title}
                          title={title}
                          status="normal"
                          onSettingClick={handleSettingToggle}
                          showDragIcon={false}
                          showSettingIcon={false}
                        />
                      ))}
                    </div>
                  </>
                )}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* 메인 탭에서만 ChartSetting 활성 */}
        {isSettingOpen && activeTab === "main" && (
          <ChartSetting
            onClose={handleSettingToggle}
            onSave={handleSaveChart}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
