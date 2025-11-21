import React, { useState, useEffect, useMemo, useRef } from "react";
import { chartData } from "./data/chartData";
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/pages/Dashboard/InstanceMap/Dashboard/Card/ChartSetting";
import StatusCard from "@/components/Card/StatusCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import TabMenu from "@/components/Tabs/TabMenu";
import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";
import {
  fetchDashboardData,
  fetchAllGraphs,
  type GraphDefinition,
  type GraphDataResponse,
} from "@/api/dashboard";
import { isAxiosError } from "axios";
import { useSearchParams } from "react-router-dom";

export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

interface DashboardProps {
  initialTab?: TabType;
  singleTabMode?: boolean;
}

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

const resolveTimeUnit = (mode: DashboardMode): "1m" | "10m" | "1h" | "1d" => {
  switch (mode) {
    case "10분":
      return "10m";
    case "1시간":
      return "1h";
    case "1일":
      return "1d";
    case "LIVE":
    default:
      return "1m";
  }
};

const Dashboard: React.FC<DashboardProps> = ({
  initialTab = "main",
  singleTabMode = false,
}) => {
  const [searchParams] = useSearchParams();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // 서버에서 받은 그래프 데이터를 그대로 사용 (이름 배열이 아닌 GraphDataResponse 배열)
  const [charts, setCharts] = useState<GraphDataResponse[]>([]);

  const [settingTargetIndex, setSettingTargetIndex] = useState<number | null>(
    null
  );
  const [categoryGraphs, setCategoryGraphs] = useState<
    Map<TabType, GraphDataResponse[]>
  >(new Map());
  const lastLoadedTabRef = useRef<TabType | null>(null);
  // 서버에서 받은 그래프 데이터를 그대로 사용 (하드코딩된 chartData 제거)
  const {
    selectedInstanceId: contextInstanceId,
    selectInstance,
    instances,
    mode,
    refreshToken,
    graphList,
    setGraphs,
    reorderGraphsByNames,
    replaceGraphAt,
    clearGraphs,
    isWidgetOrderDirty,
    saveWidgetOrder,
    setIsFetching,
    setError,
    triggerRefresh,
  } = useDashboardContext();

  // URL 쿼리 파라미터에서 instanceId 읽기
  const urlInstanceId = useMemo(() => {
    const instanceIdParam = searchParams.get("instanceId");
    return instanceIdParam ? Number(instanceIdParam) : null;
  }, [searchParams]);

  // URL 쿼리 파라미터의 instanceId를 우선 사용, 없으면 context의 instanceId 사용
  const selectedInstanceId = urlInstanceId ?? contextInstanceId;

  // URL에서 instanceId를 읽어서 context에 설정
  useEffect(() => {
    if (urlInstanceId !== null) {
      // instances에서 해당 instanceId를 찾아서 설정
      const instance = instances.find((inst) => inst.id === urlInstanceId);
      if (instance) {
        selectInstance(instance);
      } else if (instances.length > 0) {
        // instances가 로드되지 않았거나 찾을 수 없는 경우, 나중에 다시 시도
        // instances가 로드되면 자동으로 설정됨
      }
    }
  }, [urlInstanceId, instances, selectInstance]);

  const getCategoryByTab = (tab: TabType): string => {
    const categoryMap: Record<TabType, string> = {
      main: "CUSTOM",
      cpu: "CPU",
      memory: "MEMORY",
      session: "SESSION",
      io: "IO",
      storage: "STORAGE",
    };
    return categoryMap[tab] ?? "CUSTOM";
  };

  // chartData.ts의 순서에 맞춰 그래프 정렬
  const orderGraphsByTab = (
    graphs: GraphDataResponse[]
  ): GraphDataResponse[] => {
    if (!graphs || graphs.length === 0) return [];
    if (activeTab === "main") {
      return graphs; // 메인 탭은 정렬하지 않음 (드래그 앤 드롭 유지)
    }
    const order = chartData[activeTab] ?? [];
    const graphMap = new Map(graphs.map((g) => [g.name, g]));
    const sorted = order
      .map((name) => graphMap.get(name))
      .filter((g): g is GraphDataResponse => g !== undefined);
    const remaining = graphs.filter((g) => !order.includes(g.name));
    return [...sorted, ...remaining];
  };

  const handleOpenSetting = (index: number) => {
    setSettingTargetIndex(index);
    setIsSettingOpen(true);
  };
  const handleCloseSetting = () => {
    setSettingTargetIndex(null);
    setIsSettingOpen(false);
  };

  const tabs = useMemo(
    () =>
      [
        { id: "main", label: "Main Custom" },
        { id: "cpu", label: "CPU" },
        { id: "memory", label: "Memory" },
        { id: "session", label: "Session" },
        { id: "io", label: "I/O" },
        { id: "storage", label: "Storage" },
      ] as const,
    []
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // 서버에서 받은 그래프 데이터를 그대로 사용
  useEffect(() => {
    if (activeTab === "main") {
      // main 탭은 graphList를 그대로 사용
      setCharts(graphList);
    } else {
      // 다른 탭은 categoryGraphs에서 그래프 데이터를 그대로 사용
      const currentGraphs = categoryGraphs.get(activeTab) ?? [];
      setCharts(currentGraphs);
    }
  }, [activeTab, graphList, categoryGraphs]);

  // 초기 로드 및 모드/인스턴스/탭 변경 시 데이터 로드
  useEffect(() => {
    if (!selectedInstanceId) {
      clearGraphs();
      setCategoryGraphs(new Map());
      setIsFetching(false);
      setError(null);
      lastLoadedTabRef.current = null;
      return;
    }

    // 캐시된 데이터 확인
    const hasCachedData =
      activeTab === "main"
        ? graphList.length > 0
        : (categoryGraphs.get(activeTab)?.length ?? 0) > 0;

    // 캐시된 데이터가 없으면 즉시 로딩 상태 표시 (렌더링 전에 설정)
    if (!hasCachedData) {
      setIsFetching(true);
    }

    let cancelled = false;

    // LIVE 이외 모드에서 그래프 포인트 수를 제한 (현재 시점 기준 최근 10개만 유지)
    const normalizeGraphsForMode = (
      graphs: GraphDataResponse[] | undefined
    ): GraphDataResponse[] => {
      if (!graphs || graphs.length === 0) return [];
      // LIVE 모드는 백엔드에서 분 단위로 계속 받아오고, 별도 머지 로직이 있으므로 그대로 사용
      if (mode === "LIVE") return graphs;

      const limit = 10;
      return graphs.map((graph) => {
        const sorted = [...(graph.data ?? [])].sort((a, b) => {
          const ta = new Date(a.timestamp ?? 0).getTime();
          const tb = new Date(b.timestamp ?? 0).getTime();
          return ta - tb;
        });
        const sliced = sorted.length > limit ? sorted.slice(-limit) : sorted;
        return { ...graph, data: sliced };
      });
    };

    const loadDashboard = async () => {
      setError(null);
      try {
        const category = getCategoryByTab(activeTab);
        const response = await fetchDashboardData({
          instanceId: selectedInstanceId,
          timeUnit: resolveTimeUnit(mode),
          category,
        });
        if (cancelled) return;
        const normalizedGraphs = normalizeGraphsForMode(response?.graphs);
        const orderedGraphs = orderGraphsByTab(normalizedGraphs);

        if (activeTab === "main") {
          setGraphs(orderedGraphs);
          lastLoadedTabRef.current = activeTab;
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            next.set(activeTab, orderedGraphs);
            return next;
          });
        }
      } catch (error) {
        if (cancelled) return;
        if (activeTab === "main") {
          setGraphs([]);
          lastLoadedTabRef.current = activeTab;
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            next.set(activeTab, []);
            return next;
          });
        }
        setError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [
    selectedInstanceId,
    mode,
    activeTab,
    refreshToken,
    setGraphs,
    clearGraphs,
    setIsFetching,
    setError,
  ]);

  // categoryGraphs가 업데이트된 후 lastLoadedTabRef 설정
  useEffect(() => {
    if (activeTab !== "main" && selectedInstanceId) {
      const currentGraphs = categoryGraphs.get(activeTab);
      // 데이터가 로드되었는지 확인 (빈 배열이어도 로드된 것으로 간주)
      if (currentGraphs !== undefined) {
        lastLoadedTabRef.current = activeTab;
      }
    }
  }, [categoryGraphs, activeTab, selectedInstanceId]);

  // LIVE 모드일 때만 1분마다 지정된 시간(02초)에 데이터 자동 새로고침
  useEffect(() => {
    // LIVE 모드가 아니면 자동 새로고침하지 않음
    if (mode !== "LIVE" || !selectedInstanceId) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;
    let cancelled = false;

    // 기존 데이터에 새 데이터 포인트를 추가하는 함수
    const mergeGraphData = (
      existingGraphs: GraphDataResponse[],
      newGraphs: GraphDataResponse[]
    ): GraphDataResponse[] => {
      const existingMap = new Map(existingGraphs.map((g) => [g.id, g]));

      return newGraphs.map((newGraph) => {
        const existing = existingMap.get(newGraph.id);
        if (!existing || !existing.data || existing.data.length === 0) {
          return newGraph;
        }

        // 기존 데이터의 마지막 타임스탬프 확인
        const existingTimestamps = new Set(
          existing.data.map((d) => d.timestamp).filter(Boolean)
        );

        // 새로운 데이터 포인트만 필터링 (중복 제거)
        const newDataPoints = (newGraph.data ?? []).filter(
          (point) => !existingTimestamps.has(point.timestamp)
        );

        if (newDataPoints.length === 0) {
          return existing; // 새 데이터가 없으면 기존 데이터 유지
        }

        // 기존 데이터에 새 포인트 추가 (타임스탬프 순서 유지)
        const mergedData = [...existing.data, ...newDataPoints].sort((a, b) => {
          const timeA = new Date(a.timestamp ?? 0).getTime();
          const timeB = new Date(b.timestamp ?? 0).getTime();
          return timeA - timeB;
        });

        // 최대 100개 데이터 포인트만 유지 (메모리 관리)
        const maxPoints = 100;
        const trimmedData =
          mergedData.length > maxPoints
            ? mergedData.slice(-maxPoints)
            : mergedData;

        return {
          ...newGraph,
          data: trimmedData,
        };
      });
    };

    const loadDashboard = async () => {
      if (cancelled) return;

      // 로딩 상태를 표시하지 않음 (백그라운드 업데이트)
      setError(null);
      try {
        const category = getCategoryByTab(activeTab);
        const response = await fetchDashboardData({
          instanceId: selectedInstanceId,
          timeUnit: resolveTimeUnit(mode),
          category,
        });
        if (cancelled) return;

        const orderedNewGraphs = orderGraphsByTab(response?.graphs ?? []);

        if (activeTab === "main") {
          setGraphs((prev) => {
            if (prev.length === 0) {
              return orderedNewGraphs;
            }
            return mergeGraphData(prev, orderedNewGraphs);
          });
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            const existing = next.get(activeTab) ?? [];

            if (existing.length === 0) {
              next.set(activeTab, orderedNewGraphs);
            } else {
              next.set(activeTab, mergeGraphData(existing, orderedNewGraphs));
            }
            return next;
          });
        }
      } catch (error) {
        if (cancelled) return;
        setError(getErrorMessage(error));
      }
    };

    const scheduleNextUpdate = () => {
      const now = new Date();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      // 02초에 데이터 호출하도록 설정
      let msUntilNextUpdate: number;
      if (seconds < 2) {
        // 아직 02초가 안 지났으면 다음 02초까지 대기
        msUntilNextUpdate = (2 - seconds) * 1000 - milliseconds;
      } else {
        // 02초가 지났으면 다음 분의 02초까지 대기
        msUntilNextUpdate = (60 - seconds + 2) * 1000 - milliseconds;
      }

      timeoutId = setTimeout(() => {
        if (cancelled) return;
        void loadDashboard();
        // 이후 1분마다 02초에 호출
        intervalId = setInterval(() => {
          if (cancelled) return;
          void loadDashboard();
        }, 60000);
      }, msUntilNextUpdate);
    };

    scheduleNextUpdate();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [mode, selectedInstanceId, activeTab, refreshToken, setGraphs, setError]);

  useEffect(() => {
    if (activeTab === "main" && graphList.length > 0) {
      void saveWidgetOrder();
    }
  }, [refreshToken, activeTab, graphList, saveWidgetOrder]);

  const prevTabRef = useRef<TabType>(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (prevTab === "main" && activeTab !== "main" && isWidgetOrderDirty) {
      void saveWidgetOrder();
    }
    prevTabRef.current = activeTab;
  }, [activeTab, isWidgetOrderDirty, saveWidgetOrder]);

  const handleDragEnd = ({ source, destination }: DropResult) => {
    if (!destination || destination.index === source.index) return;
    if (activeTab !== "main") return;

    setCharts((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      // GraphDataResponse 배열에서 이름 배열로 변환
      const names = reordered.map((graph) => graph.name);
      reorderGraphsByNames(names);
      void saveWidgetOrder().finally(() => {
        triggerRefresh();
      });

      return reordered;
    });
  };

  const handleGraphSwap = async (graph: GraphDefinition) => {
    if (settingTargetIndex === null) return;
    replaceGraphAt(settingTargetIndex, {
      id: graph.id,
      name: graph.name,
      description: graph.info ?? "",
      type: graph.type ?? 0,
      data: [],
    });
    await saveWidgetOrder();
    triggerRefresh();
    handleCloseSetting();
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
                {activeTab === "main" &&
                  charts.map((graph, index) => (
                    <Draggable
                      key={graph.id}
                      draggableId={`${graph.id}-${index}`}
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
                            title={graph.name}
                            status="normal"
                            onSettingClick={() => handleOpenSetting(index)}
                            showDragIcon
                            showSettingIcon
                            graphData={graph}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

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
                          title={charts[0].name}
                          status="normal"
                          onSettingClick={handleOpenSetting.bind(null, 0)}
                          showDragIcon={false}
                          showSettingIcon={false}
                          graphData={charts[0]}
                        />
                      )}
                    </div>

                    <div className="dashboard__row row-2">
                      {charts.slice(1, 3).map((graph, index) => (
                        <ChartCard
                          key={graph.id}
                          title={graph.name}
                          status="normal"
                          onSettingClick={handleOpenSetting.bind(
                            null,
                            index + 1
                          )}
                          showDragIcon={false}
                          showSettingIcon={false}
                          graphData={graph}
                        />
                      ))}
                    </div>

                    <div className="dashboard__row row-3">
                      {charts.slice(3, 5).map((graph, index) => (
                        <ChartCard
                          key={graph.id}
                          title={graph.name}
                          status="normal"
                          onSettingClick={handleOpenSetting.bind(
                            null,
                            index + 3
                          )}
                          showDragIcon={false}
                          showSettingIcon={false}
                          graphData={graph}
                        />
                      ))}
                    </div>

                    <div className="dashboard__row row-4">
                      {charts.slice(5, 8).map((graph, index) => (
                        <ChartCard
                          key={graph.id}
                          title={graph.name}
                          status="normal"
                          onSettingClick={handleOpenSetting.bind(
                            null,
                            index + 5
                          )}
                          showDragIcon={false}
                          showSettingIcon={false}
                          graphData={graph}
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

        {isSettingOpen && settingTargetIndex !== null && (
          <ChartSetting
            onClose={handleCloseSetting}
            onSave={async (newChartTitle: string) => {
              if (settingTargetIndex !== null) {
                // 그래프 이름으로 GraphDefinition 찾기
                try {
                  const allGraphs = await fetchAllGraphs();
                  const foundGraph = allGraphs.find(
                    (g) => g.name === newChartTitle
                  );
                  if (foundGraph) {
                    await handleGraphSwap(foundGraph);
                  } else {
                    // 그래프를 찾지 못한 경우 이름만으로 처리
                    await handleGraphSwap({
                      id: 0,
                      name: newChartTitle,
                      category: "CUSTOM",
                      type: 1,
                      info: null,
                    } as GraphDefinition);
                  }
                } catch (error) {
                  console.error("그래프 정보 조회 실패:", error);
                  await handleGraphSwap({
                    id: 0,
                    name: newChartTitle,
                    category: "CUSTOM",
                    type: 1,
                    info: null,
                  } as GraphDefinition);
                }
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
