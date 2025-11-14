import React, { useState, useEffect, useMemo, useRef } from "react";
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
import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";
import { fetchDashboardData, fetchAllGraphs, type GraphDefinition, type GraphDataResponse } from "@/api/dashboard";
import { isAxiosError } from "axios";
import { useSearchParams } from "react-router-dom";

export type TabType = keyof typeof chartData;

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
  const [charts, setCharts] = useState<string[]>(() =>
    cloneDeep(chartData[initialTab])
  );

  const [settingTargetIndex, setSettingTargetIndex] = useState<number | null>(null);
  const [categoryGraphs, setCategoryGraphs] = useState<Map<TabType, GraphDataResponse[]>>(new Map());
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
    isFetching,
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
      performance: "CUSTOM", // PERFORMANCE는 백엔드에 없으므로 CUSTOM으로 매핑
      prevention: "CUSTOM", // PREVENTION은 백엔드에 없으므로 CUSTOM으로 매핑
    };
    return categoryMap[tab] ?? "CUSTOM";
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
    () => [
      { id: "main", label: "Main Custom" },
      { id: "cpu", label: "CPU" },
      { id: "memory", label: "Memory" },
      { id: "session", label: "Session" },
      { id: "io", label: "I/O" },
      { id: "storage", label: "Storage" },
    ] as const,
    [],
  );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (activeTab === "main") {
      if (graphList.length > 0) {
        setCharts(graphList.map((graph) => graph.name));
      } else {
        setCharts(cloneDeep(chartData.main));
      }
    } else {
      setCharts(cloneDeep(chartData[activeTab]));
    }
  }, [activeTab, graphList]);

  // 초기 로드 및 모드/인스턴스/탭 변경 시 데이터 로드
  useEffect(() => {
    if (!selectedInstanceId) {
      clearGraphs();
      setCategoryGraphs(new Map());
      setIsFetching(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const category = getCategoryByTab(activeTab);
        const response = await fetchDashboardData({
          instanceId: selectedInstanceId,
          timeUnit: resolveTimeUnit(mode),
          category,
        });
        if (cancelled) return;
        
        if (activeTab === "main") {
          setGraphs(response?.graphs ?? []);
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            next.set(activeTab, response?.graphs ?? []);
            return next;
          });
        }
      } catch (error) {
        if (cancelled) return;
        if (activeTab === "main") {
          setGraphs([]);
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
  }, [selectedInstanceId, mode, activeTab, setGraphs, clearGraphs, setIsFetching, setError]);

  // LIVE 모드일 때만 refreshToken 변경에 반응하여 데이터 자동 새로고침
  useEffect(() => {
    // LIVE 모드가 아니면 자동 새로고침하지 않음
    if (mode !== "LIVE" || !selectedInstanceId) {
      return;
    }

    // LIVE 모드일 때 02초마다 자동 새로고침
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

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
        triggerRefresh();
        // 이후 1분마다 02초에 호출
        intervalId = setInterval(() => {
          triggerRefresh();
        }, 60000);
      }, msUntilNextUpdate);
    };

    scheduleNextUpdate();

    let cancelled = false;

    const loadDashboard = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const category = getCategoryByTab(activeTab);
        const response = await fetchDashboardData({
          instanceId: selectedInstanceId,
          timeUnit: resolveTimeUnit(mode),
          category,
        });
        if (cancelled) return;
        
        if (activeTab === "main") {
          setGraphs(response?.graphs ?? []);
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            next.set(activeTab, response?.graphs ?? []);
            return next;
          });
        }
      } catch (error) {
        if (cancelled) return;
        if (activeTab === "main") {
          setGraphs([]);
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
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [refreshToken, mode, selectedInstanceId, activeTab, setGraphs, setIsFetching, setError, triggerRefresh]);

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
    let nextOrder: string[] | null = null;
    setCharts((prev) => {
      const reordered = [...prev];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      nextOrder = reordered;
      return reordered;
    });
    if (activeTab === "main" && nextOrder) {
      reorderGraphsByNames(nextOrder);
      void saveWidgetOrder().finally(() => {
        triggerRefresh();
      });
    }
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
                  charts.map((title, index) => (
                    <Draggable
                      key={title}
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
                            onSettingClick={() => handleOpenSetting(index)}
                            showDragIcon
                            showSettingIcon
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                {activeTab !== "main" && (() => {
                  const currentGraphs = categoryGraphs.get(activeTab) ?? [];
                  
                  // 카테고리별 그래프 ID 기반 매핑
                  // 로딩 중이고 데이터가 없으면 undefined 반환 (ChartCard에서 로딩 상태 표시)
                  const getGraphForTitle = (title: string): GraphDataResponse | null | undefined => {
                    // 로딩 중이고 데이터가 없으면 undefined 반환하여 로딩 상태 표시
                    if (isFetching && currentGraphs.length === 0) {
                      return undefined;
                    }
                    // CPU 카테고리 그래프 ID 매핑
                    if (activeTab === "cpu") {
                      const cpuGraphIdMap: Record<string, number> = {
                        "CPU 활동 현황 타일": 13,
                        "Foreground vs Background CPU 추이 (AAS)": 19,
                        "Host CPU Utilization (%)": 15,
                        "DB CPU Saturation - AAS vs Core (Load)": 14,
                        "DB CPU Share of Host (%)": 16,
                        "CPU Cost per Commit/Execution (ms)": 18,
                        "Run Queue per Core - Scheduler Load (%)": 17,
                        "Top SQL by CPU (Last 10 min)": 20,
                      };
                      
                      const graphId = cpuGraphIdMap[title];
                      if (graphId) {
                        const found = currentGraphs.find(g => g.id === graphId);
                        if (found) return found;
                      }
                      
                      // 이름 기반 매칭 (백엔드 이름과 일부 차이 반영)
                      const nameVariations: Record<string, string[]> = {
                        "CPU 활동 현황 타일": ["CPU Activity Overview Tiles"],
                        "Foreground vs Background CPU 추이 (AAS)": ["Foreground vs Background CPU — AAS Trend"],
                        "Host CPU Utilization (%)": ["Host CPU Utilization (%)", "Host CPU Utilization (%) – Trend"],
                        "DB CPU Saturation - AAS vs Core (Load)": ["DB CPU Saturation (AAS vs Core)"],
                        "DB CPU Share of Host (%)": ["DB CPU Share of Host (%)", "DB CPU Share of Host (%) – Trend"],
                        "CPU Cost per Commit/Execution (ms)": ["CPU Cost per Commit/Execution (ms)"],
                        "Run Queue per Core - Scheduler Load (%)": ["Run Queue per Core (Scheduler Load)", "Run Queue per Core (Scheduler Load) – Trend"],
                        "Top SQL by CPU (Last 10 min)": ["Top SQL by CPU_1m"],
                      };
                      
                      const variations = nameVariations[title];
                      if (variations) {
                        for (const variation of variations) {
                          const found = currentGraphs.find(g => g.name === variation);
                          if (found) return found;
                        }
                      }
                    }
                    
                    // Memory 카테고리 그래프 ID 매핑
                    if (activeTab === "memory") {
                      const memoryGraphIdMap: Record<string, number> = {
                        "SGA Efficiency & Memory Pools": 22,
                        "PGA Execution Memory & Processes": 21,
                        "SGA Utilization (%)": 24,
                        "PGA Utilization (%)": 23,
                        "Workarea Spill Rate (%)": 25,
                        "Library Cache Reloads per Second": 26,
                        "Buffer Cache Miss Rate (%) - Proxy": 27,
                        "Top SQL by Shared Pool Memory": 28,
                      };
                      
                      const graphId = memoryGraphIdMap[title];
                      if (graphId) {
                        const found = currentGraphs.find(g => g.id === graphId);
                        if (found) return found;
                      }
                      
                      // 이름 기반 매칭 (백엔드 이름과 일부 차이 반영)
                      const nameVariations: Record<string, string[]> = {
                        "SGA Efficiency & Memory Pools": ["SGA Efficiency & Memory Pools"],
                        "PGA Execution Memory & Processes": ["PGA Execution Memory & Processes"],
                        "SGA Utilization (%)": ["SGA Utilization (%)", "SGA Utilization (%) — Trend"],
                        "PGA Utilization (%)": ["PGA Utilization (%)", "PGA Utilization (%) – Trend"],
                        "Workarea Spill Rate (%)": ["Workarea Spill Rate (%)", "Workarea Spill Rate (%) – Trend"],
                        "Library Cache Reloads per Second": ["Library Cache Reloads per Second", "Library Cache Reloads per Second – Trend"],
                        "Buffer Cache Miss Rate (%) - Proxy": ["Buffer Cache Miss Rate (%) - Proxy", "Buffer Cache Miss Rate (%) – Proxy – Trend"],
                        "Top SQL by Shared Pool Memory": ["Top SQL by Shared Pool Memory", "Top SQL by Shared Pool Memory — Bar"],
                      };
                      
                      const variations = nameVariations[title];
                      if (variations) {
                        for (const variation of variations) {
                          const found = currentGraphs.find(g => g.name === variation);
                          if (found) return found;
                        }
                      }
                    }
                    
                    // Session 카테고리 그래프 ID 매핑 (29-36)
                    if (activeTab === "session") {
                      const sessionGraphIdMap: Record<string, number> = {
                        "Session Activity & Resource Summary": 35,
                        "Active vs Inactive Sessions": 29,
                        "Lock Wait Sessions — TX vs TM vs Total": 31,
                        "TPS": 32,
                        "On-CPU vs Wait (AAS 분해)": 30,
                        "Exec/s": 33,
                        "Logons/sec & Disconnects/sec": 34,
                        "Top Blocker Sessions — Snapshot Top 5": 36,
                      };
                      
                      const graphId = sessionGraphIdMap[title];
                      if (graphId) {
                        const found = currentGraphs.find(g => g.id === graphId);
                        if (found) return found;
                      }
                      
                      // 이름 기반 매칭 (백엔드 이름과 일부 차이 반영)
                      const nameVariations: Record<string, string[]> = {
                        "Session Activity & Resource Summary": ["Session Activity & Resource Summary"],
                        "Active vs Inactive Sessions": ["Active vs Inactive Sessions", "Active vs Inactive Sessions — Trend"],
                        "Lock Wait Sessions — TX vs TM vs Total": ["Lock Wait Sessions — TX vs TM vs Total"],
                        "TPS": ["TPS", "TPS — Trend"],
                        "On-CPU vs Wait (AAS 분해)": ["On-CPU vs Wait (AAS 분해)", "On-CPU vs Wait (AAS 분해) — Trend"],
                        "Exec/s": ["Exec/s", "Exec/s — Trend"],
                        "Logons/sec & Disconnects/sec": ["Logons/sec & Disconnects/sec", "Logons/sec & Disconnects/sec — Trend"],
                        "Top Blocker Sessions — Snapshot Top 5": ["Top Blocker Sessions — Snapshot Top 5"],
                      };
                      
                      const variations = nameVariations[title];
                      if (variations) {
                        for (const variation of variations) {
                          const found = currentGraphs.find(g => g.name === variation || g.name.includes(variation.split(" —")[0]));
                          if (found) return found;
                        }
                      }
                    }
                    
                    // I/O 카테고리 그래프 매핑 (이름 기반 우선, ID는 폴백)
                    if (activeTab === "io") {
                      // 이름 기반 매칭 (백엔드 이름과 일부 차이 반영) - 우선 실행
                      const nameVariations: Record<string, string[]> = {
                        "I/O Performance Dashboard": ["I/O Performance Dashboard"],
                        "Physical Reads vs Logical Reads": ["Physical Reads vs Logical Reads", "Physical Reads vs Logical Reads (개/초)"],
                        "Average I/O Wait Time (ms)": ["Average I/O Wait Time (ms)"],
                        "데이터파일별 I/O 통계 (Top 5)": ["데이터파일별 I/O 통계 (Top 5)"],
                        "Direct Path I/O": ["Direct Path I/O", "Direct Path I/O (개/초)"],
                        "Redo Generation Rate": ["Redo Generation Rate", "Redo Generation Rate (MB/초)"],
                        "DBWR Checkpoint Activity": ["DBWR Checkpoint Activity"],
                        "SQL Parsing & Execution": ["SQL Parsing & Execution", "SQL Parsing & Execution (개/초)"],
                      };
                      
                      const variations = nameVariations[title];
                      if (variations) {
                        for (const variation of variations) {
                          const found = currentGraphs.find(g => g.name === variation);
                          if (found) return found;
                        }
                        // 부분 매칭 시도 (예: "Physical Reads" 포함)
                        for (const variation of variations) {
                          const keyPart = variation.split(" (")[0]; // 괄호 전 부분만
                          const found = currentGraphs.find(g => g.name.includes(keyPart) || keyPart.includes(g.name.split(" (")[0]));
                          if (found) return found;
                        }
                      }
                      
                      // 이름 매칭 실패 시 ID 기반 매핑 (SQL 파일 기준: 41-48, 이미지 기준: 37-44)
                      const ioGraphIdMap: Record<string, number> = {
                        "I/O Performance Dashboard": 41,
                        "Physical Reads vs Logical Reads": 44,
                        "Average I/O Wait Time (ms)": 45,
                        "데이터파일별 I/O 통계 (Top 5)": 48,
                        "Direct Path I/O": 42,
                        "Redo Generation Rate": 46,
                        "DBWR Checkpoint Activity": 47,
                        "SQL Parsing & Execution": 43,
                      };
                      
                      const graphId = ioGraphIdMap[title];
                      if (graphId) {
                        const found = currentGraphs.find(g => g.id === graphId);
                        if (found) return found;
                      }
                    }
                    
                    // Storage 카테고리 그래프 매핑 (이름 기반 우선, ID는 폴백)
                    if (activeTab === "storage") {
                      // 이름 기반 매칭 (백엔드 이름과 일부 차이 반영) - 우선 실행
                      const nameVariations: Record<string, string[]> = {
                        "Storage Health Dashboard": ["Storage Health Dashboard"],
                        "FRA 사용률 추세 (%)": ["FRA 사용률 추세 (%)"],
                        "Undo 사용률 추세 (%)": ["Undo 사용률 추세 (%)"],
                        "Total Database Usage Trend (%)": ["Total Database Usage Trend (%)"],
                        "테이블스페이스 사용률 추세 (%)": ["테이블스페이스 사용률 추세 (%)"],
                        "테이블스페이스 증가 추세 (GB)": ["테이블스페이스 증가 추세 (GB)", "테이블스페이스 증가 추세 (GB/일)"],
                        "Temp Tablespace Active Usage (GB)": ["Temp Tablespace Active Usage (GB)"],
                        "대용량 세그먼트 Top 5": ["대용량 세그먼트 Top 5", "대용량 세그먼트 (Top 5)"],
                      };
                      
                      const variations = nameVariations[title];
                      if (variations) {
                        for (const variation of variations) {
                          const found = currentGraphs.find(g => g.name === variation);
                          if (found) return found;
                        }
                        // 부분 매칭 시도 (예: "테이블스페이스" 포함)
                        for (const variation of variations) {
                          const keyPart = variation.split(" (")[0].split(" (%)")[0]; // 괄호 및 % 제거
                          const found = currentGraphs.find(g => {
                            const graphPart = g.name.split(" (")[0].split(" (%)")[0];
                            return g.name.includes(keyPart) || keyPart.includes(graphPart);
                          });
                          if (found) return found;
                        }
                      }
                      
                      // 이름 매칭 실패 시 ID 기반 매핑 (SQL 파일 기준: 49-56, 이미지 기준: 45-52)
                      const storageGraphIdMap: Record<string, number> = {
                        "Storage Health Dashboard": 49,
                        "FRA 사용률 추세 (%)": 53,
                        "Undo 사용률 추세 (%)": 54,
                        "Total Database Usage Trend (%)": 55,
                        "테이블스페이스 사용률 추세 (%)": 51,
                        "테이블스페이스 증가 추세 (GB)": 52,
                        "Temp Tablespace Active Usage (GB)": 50,
                        "대용량 세그먼트 Top 5": 56,
                      };
                      
                      const graphId = storageGraphIdMap[title];
                      if (graphId) {
                        const found = currentGraphs.find(g => g.id === graphId);
                        if (found) return found;
                      }
                    }
                    
                    // 매핑되지 않은 경우 이름 기반 매핑 시도
                    return currentGraphs.find(g => g.name === title) ?? null;
                  };
                  
                  return (
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
                            onSettingClick={handleOpenSetting.bind(null, 0)}
                            showDragIcon={false}
                            showSettingIcon={false}
                            graphData={getGraphForTitle(charts[0])}
                          />
                        )}
                      </div>

                      <div className="dashboard__row row-2">
                        {charts.slice(1, 3).map((title, index) => (
                          <ChartCard
                            key={title}
                            title={title}
                            status="normal"
                            onSettingClick={handleOpenSetting.bind(null, index + 1)}
                            showDragIcon={false}
                            showSettingIcon={false}
                            graphData={getGraphForTitle(title)}
                          />
                        ))}
                      </div>

                      <div className="dashboard__row row-3">
                        {charts.slice(3, 5).map((title, index) => (
                          <ChartCard
                            key={title}
                            title={title}
                            status="normal"
                            onSettingClick={handleOpenSetting.bind(null, index + 3)}
                            showDragIcon={false}
                            showSettingIcon={false}
                            graphData={getGraphForTitle(title)}
                          />
                        ))}
                      </div>

                      <div className="dashboard__row row-4">
                        {charts.slice(5, 8).map((title, index) => (
                          <ChartCard
                            key={title}
                            title={title}
                            status="normal"
                            onSettingClick={handleOpenSetting.bind(null, index + 5)}
                            showDragIcon={false}
                            showSettingIcon={false}
                            graphData={getGraphForTitle(title)}
                          />
                        ))}
                      </div>
                    </>
                  );
                })()}

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
                  const foundGraph = allGraphs.find((g) => g.name === newChartTitle);
                  if (foundGraph) {
                    await handleGraphSwap(foundGraph);
                  } else {
                    // 그래프를 찾지 못한 경우 이름만으로 처리
                    await handleGraphSwap({ 
                      id: 0, 
                      name: newChartTitle,
                      category: "CUSTOM",
                      type: 1,
                      info: null
                    } as GraphDefinition);
                  }
                } catch (error) {
                  console.error("그래프 정보 조회 실패:", error);
                  await handleGraphSwap({ 
                    id: 0, 
                    name: newChartTitle,
                    category: "CUSTOM",
                    type: 1,
                    info: null
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
