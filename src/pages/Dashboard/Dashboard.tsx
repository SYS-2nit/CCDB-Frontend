import React, { useState } from "react";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/components/Card/ChartSetting";
import { chartData, type TabType } from "./data/chartData";
import StatusCard from "@/components/Card/StatusCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

const Dashboard: React.FC = () => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("main");

  // chart 순서 관리 state
  const [charts, setCharts] = useState<string[]>(chartData["main"]);

  const handleSettingToggle = () => {
    setIsSettingOpen((prev) => !prev);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "main", label: "Main Custom" },
    { id: "cpu", label: "CPU" },
    { id: "memory", label: "Memory" },
    { id: "session", label: "Session" },
    { id: "io", label: "I/O" },
    { id: "storage", label: "Storage" },
  ];

  React.useEffect(() => {
    setCharts(chartData[activeTab]);
  }, [activeTab]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(charts);
    const [movedItem] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, movedItem);
    setCharts(reordered);
  };

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
      {/* 탭 메뉴 */}
      <div className="dashboard__tabs">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            className={`dashboard__tab ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div className="dashboard__content">
        {/* 차트 그리드 */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="charts" direction="horizontal">
            {(provided) => (
              <div
                className="dashboard__grid"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {activeTab !== "main" && (
                  <div className="dashboard__status-cards">
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
