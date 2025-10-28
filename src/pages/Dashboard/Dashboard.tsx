import React, { useState } from "react";
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

// chartData 키와 동일한 타입으로 명시
type TabType = keyof typeof chartData;

const Dashboard: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  // 초기값을 실제 존재하는 key로 변경
  const [activeTab, setActiveTab] = useState<TabType>("main");

  const [charts, setCharts] = useState<string[]>(() =>
    cloneDeep(chartData["main"])
  );

  const handleSettingToggle = () => setIsSettingOpen((prev) => !prev);

  const tabs = [
    { id: "main", label: "Main Custom" },
    { id: "cpu", label: "CPU" },
    { id: "memory", label: "Memory" },
    { id: "session", label: "Session" },
    { id: "io", label: "I/O" },
    { id: "storage", label: "Storage" },
  ] as const; // 리터럴 타입 유지

  React.useEffect(() => {
    // 타입 단언으로 안전하게 접근
    setCharts([...chartData[activeTab]]);
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

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      {/* setActiveTab을 콜백으로 래핑 */}
      <TabMenu
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

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
                          showDragIcon={activeTab === "main"}
                          showSettingIcon={activeTab === "main"}
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
