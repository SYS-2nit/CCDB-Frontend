<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from "react";
=======
import React, { useState, useEffect } from "react";
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
import {
  getDashboardData,
  getMemberWidgets,
  saveMemberWidgets,
  type GraphDataResponse,
  type WidgetConfig,
} from "@/api";
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b

export type TabType = keyof typeof chartData;

interface DashboardProps {
  initialTab?: TabType;
  singleTabMode?: boolean;
<<<<<<< HEAD
  instanceId?: number; // 인스턴스 ID (선택적)
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
}

const Dashboard: React.FC<DashboardProps> = ({
  initialTab = "main",
  singleTabMode = false,
<<<<<<< HEAD
  instanceId = 1, // 기본값: 1 (임시)
}) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // main 탭은 백엔드에서 받은 그래프 목록 사용, 다른 탭은 하드코딩된 데이터 사용
  const [charts, setCharts] = useState<string[]>(() => {
    if (initialTab === "main") {
      return []; // main 탭은 API 응답 후 업데이트
    }
    return cloneDeep(chartData[initialTab]);
  });
  const [graphDataMap, setGraphDataMap] = useState<
    Map<string, GraphDataResponse>
  >(new Map());
  const [timeUnit] = useState<"1m" | "10m" | "1h" | "1d">("1m");
  const [isLoading, setIsLoading] = useState(false);

  const handleSettingToggle = () => setIsSettingOpen((prev) => !prev);

  // API 호출 함수
  const fetchDashboardData = useCallback(async () => {
    // custom (main) 카테고리만 API 호출
    if (activeTab !== "main") {
      return;
    }

    setIsLoading(true);
    try {
      console.log("대시보드 데이터 조회 시작:", { instanceId, timeUnit, category: "CUSTOM" });
      
      const response = await getDashboardData({
        instanceId,
        timeUnit,
        category: "CUSTOM",
      });

      console.log("대시보드 데이터 조회 성공:", {
        graphsCount: response.graphs.length,
        graphs: response.graphs.map(g => ({
          id: g.id,
          name: g.name,
          type: g.type,
          dataCount: g.data?.length || 0,
          hasData: g.data && g.data.length > 0
        }))
      });

      // 그래프 데이터를 맵으로 변환 (이름을 키로 사용)
      const newMap = new Map<string, GraphDataResponse>();
      response.graphs.forEach((graph) => {
        newMap.set(graph.name, graph);
        // 각 그래프의 데이터 확인
        if (!graph.data || graph.data.length === 0) {
          console.warn(`그래프 '${graph.name}' (ID: ${graph.id})에 데이터가 없습니다.`);
        } else {
          console.log(`그래프 '${graph.name}' (ID: ${graph.id}) 데이터:`, {
            dataCount: graph.data.length,
            firstDataPoint: graph.data[0],
            lastDataPoint: graph.data[graph.data.length - 1]
          });
        }
      });
      setGraphDataMap(newMap);

      // 백엔드에서 받은 그래프 이름 목록으로 차트 목록 업데이트
      // (위젯 설정이 있으면 백엔드에서 이미 순서대로 정렬되어 옴)
      const graphNames = response.graphs.map((graph) => graph.name);
      if (graphNames.length > 0) {
        setCharts(graphNames);
      }
    } catch (error) {
      console.error("대시보드 데이터 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, instanceId, timeUnit]);

  // 초기 로드 및 매 분 00초에 데이터 갱신
  useEffect(() => {
    if (activeTab === "main") {
      // 초기 로드
      fetchDashboardData();

      let timeoutId: ReturnType<typeof setTimeout>;
      let intervalId: ReturnType<typeof setInterval>;

      // 00초에 정확히 호출하기 위한 스케줄링
      const scheduleNextUpdate = () => {
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // 다음 00초까지 남은 시간 계산
        const msUntilNextMinute = (60 - seconds) * 1000 - milliseconds;
        
        timeoutId = setTimeout(() => {
          fetchDashboardData();
          // 이후 1분마다 호출
          intervalId = setInterval(() => {
            fetchDashboardData();
          }, 60000); // 1분 = 60000ms
        }, msUntilNextMinute);
      };

      scheduleNextUpdate();

      // cleanup
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [fetchDashboardData, activeTab]);

=======
}) => {
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [charts, setCharts] = useState<string[]>(() =>
    cloneDeep(chartData[initialTab])
  );

  const handleSettingToggle = () => setIsSettingOpen((prev) => !prev);

>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
    // main 탭이 아닌 경우에만 하드코딩된 차트 데이터 사용
    if (initialTab !== "main") {
      setCharts(cloneDeep(chartData[initialTab]));
    }
  }, [initialTab]);

  useEffect(() => {
    // main 탭이 아닌 경우에만 하드코딩된 차트 데이터 사용
    // main 탭은 백엔드에서 받은 그래프 목록 사용
    if (activeTab !== "main") {
      setCharts(cloneDeep(chartData[activeTab]));
    }
  }, [activeTab]);

  // 위젯 설정 저장 함수
  const saveWidgetConfig = useCallback(
    async (chartNames: string[]) => {
      if (activeTab !== "main") {
        return;
      }

      try {
        // 그래프 이름을 graphId로 변환
        const widgets: WidgetConfig[] = chartNames
          .map((name, index) => {
            const graphData = graphDataMap.get(name);
            if (!graphData) {
              return null;
            }
            return {
              graphId: graphData.id,
              position: index + 1, // 1부터 시작
            };
          })
          .filter((widget): widget is WidgetConfig => widget !== null);

        if (widgets.length > 0) {
          await saveMemberWidgets({ widgets });
          console.log("위젯 설정 저장 완료");
        }
      } catch (error) {
        console.error("위젯 설정 저장 실패:", error);
      }
    },
    [activeTab, graphDataMap]
  );

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination || activeTab !== "main") return;

    // 드래그는 로컬 상태 변경
=======
    setCharts(cloneDeep(chartData[initialTab]));
  }, [initialTab]);

  useEffect(() => {
    setCharts(cloneDeep(chartData[activeTab]));
  }, [activeTab]);

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination) return;
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
    setCharts((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
<<<<<<< HEAD
      
      // 위젯 설정 저장 (비동기)
      saveWidgetConfig(reordered).catch((error) => {
        console.error("위젯 설정 저장 중 오류:", error);
      });
      
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
      return reordered;
    });
  };

<<<<<<< HEAD
  // 그래프 타입 변경 시 API 재요청은 ChartSetting에서 처리

=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
  const visibleTabs = singleTabMode
    ? tabs.filter((tab) => tab.id === initialTab)
    : tabs;

  return (
    <div
      className={`dashboard ${isSettingOpen ? "dashboard--with-setting" : ""}`}
    >
<<<<<<< HEAD
      {/* 탭 메뉴 */}
=======
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
<<<<<<< HEAD
                {activeTab !== "main" && (
                  <div className="dashboard__header-row">
                    {/* 상태 카드 */}
                    <div className="status-cards">
                      <div className="status-cards-column">
                        <StatusCard label="정상" value={2} color="safe" />
                        <StatusCard label="주의" value={5} color="warning" />
                      </div>
                      <div className="status-cards-column">
                        <StatusCard label="위험" value={8} color="danger" />
                        <StatusCard label="에러" value={1} color="critical" />
                      </div>
                    </div>

                    {/* 첫 번째 MetricCard가 있을 경우만 오른쪽에 표시 */}
                    {charts[1] && (
                      <div className="dashboard__metric-wrapper">
=======
                {/* 메인 탭일 때는 기존 유지 */}
                {activeTab === "main" &&
                  charts.map((title, index) => (
                    <Draggable
                      key={title}
                      draggableId={title}
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
                            onSettingClick={handleSettingToggle}
                            showDragIcon
                            showSettingIcon
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                {/* 메인 제외 탭 (4행 구조) */}
                {activeTab !== "main" && (
                  <>
                    {/* 1행: StatusCard + Metric */}
                    <div className="dashboard__row row-1">
                      <div className="dashboard__status-wrap">
                        <StatusCard label="정상" value={2} color="safe" />
                        <StatusCard label="주의" value={5} color="warning" />
                        <StatusCard label="위험" value={8} color="danger" />
                        <StatusCard label="에러" value={1} color="critical" />
                      </div>
                      {charts[0] && (
>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
                        <ChartCard
                          title={charts[0]}
                          status="normal"
                          onSettingClick={handleSettingToggle}
                          showDragIcon={false}
                          showSettingIcon={false}
                        />
<<<<<<< HEAD
                      </div>
                    )}
                  </div>
                )}

                {/* 메인 탭이 아닌 경우 1번째 인덱스 차트부터 시작 */}

                {(activeTab === "main" ? charts : charts.slice(1)).map(
                  (title, index) => (
                    <Draggable
                      key={title}
                      draggableId={title}
                      index={activeTab === "main" ? index : index + 1}
                      isDragDisabled={activeTab !== "main"}
                    >
                      {(provided) => (
                        <div
                          className={`chart-card-wrapper ${
                            activeTab !== "main" && index === 0
                              ? "chart-card-wrapper--full"
                              : ""
                          }`}
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
                            showDragIcon={
                              !singleTabMode && activeTab === "main"
                            }
                            showSettingIcon={
                              !singleTabMode && activeTab === "main"
                            }
                            graphData={
                              activeTab === "main"
                                ? graphDataMap.get(title) || null
                                : null
                            }
                            isLoading={isLoading && activeTab === "main"}
                          />
                        </div>
                      )}
                    </Draggable>
                  )
                )}
=======
                      )}
                    </div>

                    {/* 2행: 2개의 차트 */}
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

                    {/* 3행: 2개의 차트 */}
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

                    {/* 4행: 3개의 차트 */}
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

>>>>>>> db11cb046b5755231bd985ce52bf91082ac2342b
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
