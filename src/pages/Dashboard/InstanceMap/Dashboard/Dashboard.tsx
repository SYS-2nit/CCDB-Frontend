/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { chartData } from "./data/chartData";
// import { type DropResult } from "@hello-pangea/dnd"; // 추가
import "./Dashboard.scss";
import ChartCard from "@/components/Card/ChartCard";
import ChartSetting from "@/pages/Dashboard/InstanceMap/Dashboard/Card/ChartSetting";
import StatusCard from "@/components/Card/StatusCard";
import TabMenu from "@/components/Tabs/TabMenu";

import { Responsive, WidthProvider } from "react-grid-layout";
const ResponsiveGridLayout = WidthProvider(Responsive);

import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

import {
  fetchDashboardData,
  fetchAllGraphs,
  type GraphDefinition,
  type GraphDataResponse,
} from "@/api/Dashboard/dashboard";
import { getCategoryByGraphId } from "@/components/Card/utils/getChartByTitle";

import { isAxiosError } from "axios";
import { useSearchParams } from "react-router-dom";
import {
  fetchAlertStatistics,
  type AlertStatisticsResponse,
  type AlertCategory,
} from "@/api/Alert/alerts";

export type TabType = "main" | "cpu" | "memory" | "session" | "io" | "storage";

interface DashboardProps {
  initialTab?: TabType;
  singleTabMode?: boolean;
}

/* -------------------------------------------------------
    Utility
-------------------------------------------------------- */
const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
};

const resolveTimeUnit = (mode: DashboardMode): "1m" | "10m" | "1h" | "1d" => {
  switch (mode) {
    case "10분":
      return "1h"; // 10분 버튼 클릭 시 1시간 단위 데이터 요청
    case "1시간":
      return "10m"; // 1시간 버튼 클릭 시 10분 단위 데이터 요청
    case "1일":
      return "1d";
    case "LIVE":
    default:
      return "1m";
  }
};

/* -------------------------------------------------------
    Dashboard Component
-------------------------------------------------------- */
const Dashboard: React.FC<DashboardProps> = ({
  initialTab = "main",
  singleTabMode = false,
}) => {
  const [searchParams] = useSearchParams();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [charts, setCharts] = useState<GraphDataResponse[]>([]);
  const [layout, setLayout] = useState<any[]>([]); // ⭐ layout은 state에 고정
  const [settingTargetIndex, setSettingTargetIndex] = useState<number | null>(
    null
  );

  const [categoryGraphs, setCategoryGraphs] = useState<
    Map<TabType, GraphDataResponse[]>
  >(new Map());

  // 알림 통계 state
  const [alertStatistics, setAlertStatistics] =
    useState<AlertStatisticsResponse | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);

  // HEAD 브랜치 기능: 마지막으로 로드한 탭 추적
  const lastLoadedTabRef = useRef<TabType | null>(null);
  // mode 변경 추적을 위한 ref 추가
  const lastLoadedModeRef = useRef<DashboardMode | null>(null);

  /* Dashboard Context */
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
    saveWidgetOrder,
    isWidgetOrderDirty, // 추가
    setIsFetching,
    setError,
    triggerRefresh,
  } = useDashboardContext();

  /* instanceId from URL */
  const urlInstanceId = useMemo(() => {
    const id = searchParams.get("instanceId");
    return id ? Number(id) : null;
  }, [searchParams]);

  const selectedInstanceId = urlInstanceId ?? contextInstanceId;

  useEffect(() => {
    if (urlInstanceId !== null) {
      const inst = instances.find((i) => i.id === urlInstanceId);
      if (inst) selectInstance(inst);
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

  // const handleOpenSetting = (index: number) => {
  //   setSettingTargetIndex(index);
  //   setIsSettingOpen(true);
  // };
  // const handleCloseSetting = () => {
  //   setSettingTargetIndex(null);
  //   setIsSettingOpen(false);
  // };

  // const tabs = useMemo(
  //   () =>
  //     [
  //       { id: "main", label: "Main Custom" },
  //       { id: "cpu", label: "CPU" },
  //       { id: "memory", label: "Memory" },
  //       { id: "session", label: "Session" },
  //       { id: "io", label: "I/O" },
  //       { id: "storage", label: "Storage" },
  //     ] as const,
  //   []
  // );

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // 서버에서 받은 그래프 데이터를 그대로 사용
  // 주의: 이 useEffect는 graphList가 변경될 때마다 charts를 업데이트하지만,
  // reorderGraphsByNames로 인한 순서 변경 시에는 데이터를 보존해야 함
  // mode가 변경되었을 때는 새로운 데이터를 사용해야 함
  useEffect(() => {
    if (activeTab === "main") {
      // main 탭은 graphList를 그대로 사용
      // 하지만 순서만 변경된 경우 charts의 데이터를 보존
      setCharts((prevCharts) => {
        // graphList가 비어있으면 prevCharts 유지
        if (graphList.length === 0 && prevCharts.length > 0) {
          return prevCharts;
        }

        // mode가 변경되었으면 기존 데이터 보존하지 않고 새로운 데이터 사용
        // mode가 dependency에 포함되어 있으므로 mode 변경 시 이 useEffect가 실행됨
        // lastLoadedModeRef는 데이터 로드 시 업데이트되므로, 여기서는 현재 mode와 비교
        const modeChanged =
          lastLoadedModeRef.current !== null &&
          lastLoadedModeRef.current !== mode;

        // mode가 변경되었으면 기존 데이터 보존하지 않고 새로운 데이터 사용
        if (modeChanged) {
          return graphList;
        }

        // graphList의 ID와 prevCharts의 ID가 같으면 데이터 보존
        const prevIds = prevCharts
          .map((c) => c.id)
          .sort()
          .join(",");
        const newIds = graphList
          .map((c) => c.id)
          .sort()
          .join(",");

        // ID 목록이 같으면 순서만 변경된 것이므로 데이터 보존
        if (
          prevIds === newIds &&
          prevCharts.length === graphList.length &&
          prevCharts.length > 0
        ) {
          // graphList의 순서에 맞춰 prevCharts 재정렬
          // 데이터가 있는 경우 데이터를 보존하고, 없는 경우 graphList 사용
          const chartMap = new Map(prevCharts.map((c) => [c.id, c]));
          return graphList.map((g) => {
            const existing = chartMap.get(g.id);
            // 기존 데이터가 있으면 항상 기존 데이터 사용 (데이터 보존 우선)
            if (existing) {
              // existing의 data가 있으면 existing.data 사용, 없으면 g.data 사용
              return {
                ...g,
                ...existing,
                data:
                  existing.data && existing.data.length > 0
                    ? existing.data
                    : g.data || existing.data || [],
              };
            }
            return g;
          });
        }

        // ID가 다르면 새로운 그래프이므로 graphList 사용
        // 하지만 prevCharts에 데이터가 있으면 보존
        if (prevCharts.length > 0) {
          const chartMap = new Map(prevCharts.map((c) => [c.id, c]));
          return graphList.map((g) => {
            const existing = chartMap.get(g.id);
            // existing이 있으면 existing의 데이터를 우선 사용
            if (existing) {
              return {
                ...g,
                ...existing,
                data:
                  existing.data && existing.data.length > 0
                    ? existing.data
                    : g.data || existing.data || [],
              };
            }
            return g;
          });
        }

        return graphList;
      });
    } else {
      // 다른 탭은 categoryGraphs에서 그래프 데이터를 그대로 사용
      const currentGraphs = categoryGraphs.get(activeTab) ?? [];
      setCharts(currentGraphs);
    }
  }, [activeTab, graphList, categoryGraphs, mode]);

  // 초기 로드 및 모드/인스턴스/탭 변경 시 데이터 로드
  /* -------------------------------------------------------
      데이터 로드
  -------------------------------------------------------- */
  useEffect(() => {
    if (!selectedInstanceId) {
      clearGraphs();
      setCategoryGraphs(new Map());
      setError(null);
      setIsFetching(false);
      return;
    }

    // mode가 변경되었는지 확인
    const modeChanged = lastLoadedModeRef.current !== mode;

    const hasCache =
      activeTab === "main"
        ? graphList.length > 0 &&
          lastLoadedTabRef.current === activeTab &&
          !modeChanged
        : (categoryGraphs.get(activeTab)?.length ?? 0) > 0 && !modeChanged;

    if (!hasCache) setIsFetching(true);

    let cancelled = false;

    const normalize = (graphs?: GraphDataResponse[]) => {
      if (!graphs || graphs.length === 0) return [];
      if (mode === "LIVE") return graphs;

      return graphs.map((g) => {
        const sorted = [...(g.data ?? [])].sort(
          (a, b) =>
            new Date(a.timestamp ?? 0).getTime() -
            new Date(b.timestamp ?? 0).getTime()
        );
        const sliced = sorted.length > 10 ? sorted.slice(-10) : sorted;
        return { ...g, data: sliced };
      });
    };

    const load = async () => {
      try {
        const category = getCategoryByTab(activeTab);
        const res = await fetchDashboardData({
          instanceId: selectedInstanceId,
          timeUnit: resolveTimeUnit(mode),
          category,
        });

        if (cancelled) return;
        if (cancelled) return;

        // normalize 함수 사용 (이미 정의되어 있음 - dev 브랜치)
        const normalizedGraphs = normalize(res?.graphs);
        // orderGraphsByTab 사용 (HEAD 브랜치 기능)
        const orderedGraphs = orderGraphsByTab(normalizedGraphs);

        if (activeTab === "main") {
          setGraphs(orderedGraphs);
          lastLoadedTabRef.current = activeTab; // HEAD 브랜치 기능
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            next.set(activeTab, orderedGraphs);
            return next;
          });
        }

        // mode 추적 업데이트
        lastLoadedModeRef.current = mode;
      } catch (err) {
        if (!cancelled) {
          if (activeTab === "main") setGraphs([]);
          else
            setCategoryGraphs((prev) => {
              const next = new Map(prev);
              next.set(activeTab, []);
              return next;
            });
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    selectedInstanceId,
    activeTab,
    mode,
    refreshToken,
    // graphList,
    clearGraphs,
    setGraphs,
    setError,
    setIsFetching,
  ]);

  // 카테고리별 알림 통계 조회
  useEffect(() => {
    if (activeTab === "main" || !selectedInstanceId) {
      setAlertStatistics(null);
      return;
    }

    const loadStatistics = async () => {
      setIsLoadingStatistics(true);
      try {
        const category = getCategoryByTab(activeTab) as AlertCategory;
        const stats = await fetchAlertStatistics(category, selectedInstanceId);
        setAlertStatistics(stats);
      } catch (error) {
        console.error("[Dashboard] 알림 통계 조회 실패:", error);
        setAlertStatistics(null);
      } finally {
        setIsLoadingStatistics(false);
      }
    };

    void loadStatistics();
  }, [activeTab, selectedInstanceId]);

  /* -------------------------------------------------------
    charts & layout 동기화
-------------------------------------------------------- */
  const prevChartIdsRef = useRef<string>("");
  const prevLayoutRef = useRef<any[]>([]);

  useEffect(() => {
    const newCharts =
      activeTab === "main" ? graphList : categoryGraphs.get(activeTab) ?? [];

    // layout은 그래프가 추가/제거될 때만 재계산 (순서 변경 시에는 재계산하지 않음)
    const currentChartIds = newCharts
      .map((c) => String(c.id))
      .sort()
      .join(",");

    // 그래프 ID 목록이 변경되었거나 layout이 비어있을 때만 재계산
    if (currentChartIds !== prevChartIdsRef.current || layout.length === 0) {
      const newLayout = newCharts.map((c, index) => ({
        i: String(c.id),
        x: index % 3,
        y: Math.floor(index / 3),
        w: 1,
        h: 1,
      }));
      setLayout(newLayout);
      prevLayoutRef.current = newLayout;
      prevChartIdsRef.current = currentChartIds;
    }
  }, [activeTab, graphList, categoryGraphs, layout.length]);

  // HEAD 브랜치: LIVE 모드일 때만 1분마다 지정된 시간(02초)에 데이터 자동 새로고침
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

          // 알림 통계도 함께 갱신 (main 탭이 아닐 때만)
          try {
            const stats = await fetchAlertStatistics(
              category as AlertCategory,
              selectedInstanceId
            );
            if (!cancelled) {
              setAlertStatistics(stats);
            }
          } catch (error) {
            console.error("[Dashboard] 통계 갱신 실패:", error);
          }
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

  // HEAD 브랜치: refreshToken 변경 시 위젯 순서 저장
  useEffect(() => {
    if (activeTab === "main" && graphList.length > 0) {
      void saveWidgetOrder();
    }
  }, [refreshToken, activeTab, graphList, saveWidgetOrder]);

  // HEAD 브랜치: 탭 변경 시 위젯 순서 저장
  const prevTabRef = useRef<TabType>(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    if (prevTab === "main" && activeTab !== "main" && isWidgetOrderDirty) {
      void saveWidgetOrder();
    }
    prevTabRef.current = activeTab;
  }, [activeTab, isWidgetOrderDirty, saveWidgetOrder]);

  /* -------------------------------------------------------
      react-grid-layout drag → layout + charts 순서 업데이트
  -------------------------------------------------------- */
  const reorderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLayoutChange = (currentLayout: any[]) => {
    const prevLayout = prevLayoutRef.current;

    // 초기 로드 시에는 그대로 설정
    if (prevLayout.length === 0) {
      const normalizedLayout = currentLayout.map((item) => ({
        ...item,
        x: Math.max(0, Math.min(2, item.x)),
        y: Math.max(0, Math.min(8, item.y)),
      }));
      setLayout(normalizedLayout);
      prevLayoutRef.current = normalizedLayout;
      return;
    }

    // 이전 layout과 현재 layout 비교하여 이동한 항목 찾기
    const movedItem = currentLayout.find((current) => {
      const prev = prevLayout.find((p) => p.i === current.i);
      if (!prev) return false;
      return prev.x !== current.x || prev.y !== current.y;
    });

    if (!movedItem) {
      // 아무것도 이동하지 않았으면 그대로 유지
      setLayout(currentLayout);
      prevLayoutRef.current = currentLayout;
      return;
    }

    // 이동한 항목의 새 위치에 원래 있던 항목 찾기
    const targetItem = prevLayout.find(
      (prev) =>
        prev.x === movedItem.x &&
        prev.y === movedItem.y &&
        prev.i !== movedItem.i
    );

    // 스왑 로직: 두 항목만 서로 위치 교환
    const swappedLayout = prevLayout.map((item) => {
      if (item.i === movedItem.i) {
        // 이동한 항목: 새 위치로
        return {
          ...item,
          x: Math.max(0, Math.min(2, movedItem.x)),
          y: Math.max(0, Math.min(8, movedItem.y)),
        };
      }
      if (targetItem && item.i === targetItem.i) {
        // 대상 항목: 이동한 항목의 원래 위치로
        const prevMoved = prevLayout.find((p) => p.i === movedItem.i);
        return {
          ...item,
          x: prevMoved ? Math.max(0, Math.min(2, prevMoved.x)) : item.x,
          y: prevMoved ? Math.max(0, Math.min(8, prevMoved.y)) : item.y,
        };
      }
      // 나머지는 그대로 유지
      return {
        ...item,
        x: Math.max(0, Math.min(2, item.x)),
        y: Math.max(0, Math.min(8, item.y)),
      };
    });

    setLayout(swappedLayout);
    prevLayoutRef.current = swappedLayout;

    // 메인 탭에서만 순서 변경 처리
    if (activeTab !== "main") return;

    // 이전 타이머 취소
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }

    // 드래그 종료 후 300ms 후에 순서 변경 (debounce)
    reorderTimeoutRef.current = setTimeout(() => {
      // 현재 charts의 데이터를 보존하기 위해 charts를 사용
      const currentCharts =
        activeTab === "main" ? charts : categoryGraphs.get(activeTab) ?? [];
      const sortedIds = [...swappedLayout]
        .sort((a, b) => a.y - b.y || a.x - b.x)
        .map((l) => l.i);

      const newOrderNames: string[] = [];

      sortedIds.forEach((id) => {
        const match = currentCharts.find((c) => String(c.id) === id);
        if (match) newOrderNames.push(match.name);
      });

      // 순서만 변경 (데이터는 그대로 유지)
      if (
        newOrderNames.length > 0 &&
        newOrderNames.length === currentCharts.length
      ) {
        // 현재 charts의 데이터를 graphList에 먼저 반영하여 데이터 보존
        if (activeTab === "main") {
          // charts의 데이터를 graphList에 반영 (동기적으로 처리)
          setGraphs((prevGraphList) => {
            // charts의 데이터로 graphList 업데이트 (데이터 보존)
            const chartsMap = new Map(currentCharts.map((c) => [c.id, c]));
            const updatedGraphList = prevGraphList.map((g) => {
              const chartData = chartsMap.get(g.id);
              // charts에 데이터가 있으면 charts 데이터 사용, 없으면 graphList 데이터 유지
              if (chartData) {
                // charts의 데이터를 우선 사용하되, graphList의 다른 속성도 유지
                return {
                  ...g,
                  ...chartData,
                  // data가 있으면 charts의 data 사용, 없으면 graphList의 data 유지
                  data:
                    chartData.data && chartData.data.length > 0
                      ? chartData.data
                      : g.data || [],
                };
              }
              return g;
            });

            // 순서 변경을 위해 mapNamesToGraphs와 유사한 로직 적용
            const nameMap = new Map(
              updatedGraphList.map((g) => [g.name, g] as const)
            );
            const reordered = newOrderNames
              .map((name) => nameMap.get(name))
              .filter((g): g is GraphDataResponse => Boolean(g));
            const leftovers = updatedGraphList.filter(
              (g) => !reordered.includes(g)
            );
            const finalGraphList = [...reordered, ...leftovers];

            // charts의 데이터를 최종적으로 보존
            const finalChartsMap = new Map(currentCharts.map((c) => [c.id, c]));
            return finalGraphList.map((g) => {
              const chartData = finalChartsMap.get(g.id);
              if (chartData && chartData.data && chartData.data.length > 0) {
                return { ...g, data: chartData.data };
              }
              return g;
            });
          });

          // setGraphs가 완료된 후 reorderGraphsByNames를 호출하여 isWidgetOrderDirty 설정
          // 하지만 이미 setGraphs에서 순서가 변경되었으므로, reorderGraphsByNames는 순서만 확인
          setTimeout(() => {
            reorderGraphsByNames(newOrderNames);
            void saveWidgetOrder();
          }, 0);
        } else {
          // 다른 탭은 기존 로직 유지
          reorderGraphsByNames(newOrderNames);
          void saveWidgetOrder();
        }
      }
    }, 300);
  };

  /* -------------------------------------------------------
        그래프 스왑
  -------------------------------------------------------- */
  const handleGraphSwap = async (graph: GraphDefinition) => {
    if (settingTargetIndex === null) return;

    replaceGraphAt(settingTargetIndex, {
      id: graph.id,
      name: graph.name,
      description: graph.info ?? "",
      type: graph.type ?? 0,
      data: [],
    });

    //  saveWidgetOrder를 먼저 완료 (백엔드에 저장)
    await saveWidgetOrder();

    // 약간의 지연을 두어 저장이 완료된 후 새로고침
    setTimeout(() => {
      triggerRefresh();
    }, 100);

    setSettingTargetIndex(null);
    setIsSettingOpen(false);
  };

  const colsConfig = {
    xxl: 3,
    xl: 3,
    lg: 3,
    md: 3,
    sm: 1,
    xs: 1,
    xxs: 1,
  };

  const visibleTabs = singleTabMode
    ? [{ id: initialTab, label: initialTab }]
    : [
        { id: "main", label: "Main Custom" },
        { id: "cpu", label: "CPU" },
        { id: "memory", label: "Memory" },
        { id: "session", label: "Session" },
        { id: "io", label: "I/O" },
        { id: "storage", label: "Storage" },
      ];

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
        {/* ======================= MAIN TAB ========================= */}
        {activeTab === "main" && (
          <div
            className={
              activeTab === "main"
                ? "dashboard__grid dashboard__grid--main"
                : "dashboard__grid dashboard__grid--other"
            }
          >
            <ResponsiveGridLayout
              className="dashboard-grid-layout"
              cols={colsConfig}
              layouts={{
                xxl: layout,
                xl: layout,
                lg: layout,
                md: layout,
                sm: layout,
                xs: layout,
                xxs: layout,
              }}
              margin={[10, 10]}
              rowHeight={258}
              onLayoutChange={handleLayoutChange}
              compactType={null}
              preventCollision={false}
              draggableHandle=".chart-card__drag-handle"
            >
              {charts.map((graph) => {
                // 같은 카테고리의 그래프 필터링
                const graphCategory = getCategoryByGraphId(graph.id);
                const allGraphsInCategory = graphList.filter(
                  (g) => getCategoryByGraphId(g.id) === graphCategory
                );

                return (
                  <div key={String(graph.id)}>
                    <ChartCard
                      // title={graph.name}
                      title={graph.id === 27 ? "SGA 효율" : graph.name}
                      status="normal"
                      onSettingClick={() => {
                        const idx = charts.findIndex((c) => c.id === graph.id);
                        setSettingTargetIndex(idx);
                        setIsSettingOpen(true);
                      }}
                      showDragIcon
                      showSettingIcon
                      graphData={graph}
                      allGraphsInCategory={allGraphsInCategory}
                    />
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          </div>
        )}

        {/* ======================= OTHER TABS ========================= */}

        {activeTab !== "main" && (
          <>
            <div className="dashboard__grid--other">
              <div className="dashboard__row row-1">
                <div className="dashboard__status-wrap">
                  <StatusCard
                    label="정상"
                    value={
                      isLoadingStatistics ? "-" : alertStatistics?.normal ?? 0
                    }
                    color="safe"
                    change={alertStatistics?.normalChange}
                  />
                  <StatusCard
                    label="주의"
                    value={
                      isLoadingStatistics ? "-" : alertStatistics?.warning ?? 0
                    }
                    color="warning"
                    change={alertStatistics?.warningChange}
                  />
                  <StatusCard
                    label="위험"
                    value={
                      isLoadingStatistics ? "-" : alertStatistics?.danger ?? 0
                    }
                    color="danger"
                    change={alertStatistics?.dangerChange}
                  />
                  <StatusCard
                    label="치명"
                    value={
                      isLoadingStatistics ? "-" : alertStatistics?.critical ?? 0
                    }
                    color="critical"
                    change={alertStatistics?.criticalChange}
                  />
                </div>

                {charts[0] && (
                  <ChartCard
                    // title={charts[0].name}
                    title={charts[0].id === 27 ? "SGA 효율" : charts[0].name}
                    status="normal"
                    onSettingClick={() => {
                      setSettingTargetIndex(0);
                      setIsSettingOpen(true);
                    }}
                    showDragIcon={false}
                    showSettingIcon={false}
                    graphData={charts[0]}
                    allGraphsInCategory={charts}
                  />
                )}
              </div>

              <div className="dashboard__row row-2">
                {charts.slice(1, 3).map((graph, i) => (
                  <ChartCard
                    key={graph.id}
                    // title={graph.name}
                    title={graph.id === 27 ? "SGA 효율" : graph.name}
                    status="normal"
                    onSettingClick={() => {
                      setSettingTargetIndex(i + 1);
                      setIsSettingOpen(true);
                    }}
                    showDragIcon={false}
                    showSettingIcon={false}
                    graphData={graph}
                    allGraphsInCategory={charts}
                  />
                ))}
              </div>

              <div className="dashboard__row row-3">
                {charts.slice(3, 5).map((graph, i) => (
                  <ChartCard
                    key={graph.id}
                    // title={graph.name}
                    title={graph.id === 27 ? "SGA 효율" : graph.name}
                    status="normal"
                    onSettingClick={() => {
                      setSettingTargetIndex(i + 3);
                      setIsSettingOpen(true);
                    }}
                    showDragIcon={false}
                    showSettingIcon={false}
                    graphData={graph}
                    allGraphsInCategory={charts}
                  />
                ))}
              </div>

              <div className="dashboard__row row-4">
                {charts.slice(5, 8).map((graph, i) => (
                  <ChartCard
                    key={graph.id}
                    // title={graph.name}
                    title={graph.id === 27 ? "SGA 효율" : graph.name}
                    status="normal"
                    onSettingClick={() => {
                      setSettingTargetIndex(i + 5);
                      setIsSettingOpen(true);
                    }}
                    showDragIcon={false}
                    showSettingIcon={false}
                    graphData={graph}
                    allGraphsInCategory={charts}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {isSettingOpen && settingTargetIndex !== null && (
        <ChartSetting
          isOpen={isSettingOpen}
          onClose={() => {
            setIsSettingOpen(false);
            setSettingTargetIndex(null);
          }}
          onSave={async (newChartTitle: string) => {
            try {
              const all = await fetchAllGraphs();
              const found = all.find((g) => g.name === newChartTitle);

              if (found) await handleGraphSwap(found);
              else
                await handleGraphSwap({
                  id: 0,
                  name: newChartTitle,
                  category: "CUSTOM",
                  type: 1,
                  info: null,
                } as GraphDefinition);
            } catch {
              await handleGraphSwap({
                id: 0,
                name: newChartTitle,
                category: "CUSTOM",
                type: 1,
                info: null,
              } as GraphDefinition);
            }
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
