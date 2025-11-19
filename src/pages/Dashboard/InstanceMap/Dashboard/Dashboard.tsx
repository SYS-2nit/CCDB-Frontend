/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
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

import {
  fetchDashboardData,
  fetchAllGraphs,
  type GraphDefinition,
  type GraphDataResponse,
} from "@/api/Dashboard/dashboard";

import { isAxiosError } from "axios";
import { useSearchParams } from "react-router-dom";

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

    const hasCache =
      activeTab === "main"
        ? graphList.length > 0
        : (categoryGraphs.get(activeTab)?.length ?? 0) > 0;

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

        const norm = normalize(res?.graphs);

        if (activeTab === "main") {
          setGraphs(norm);
        } else {
          setCategoryGraphs((prev) => {
            const next = new Map(prev);
            next.set(activeTab, norm);
            return next;
          });
        }
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
    graphList,
    clearGraphs,
    setGraphs,
    setError,
    setIsFetching,
  ]);

  /* -------------------------------------------------------
      charts & layout 동기화
  -------------------------------------------------------- */
  useEffect(() => {
    const newCharts =
      activeTab === "main" ? graphList : categoryGraphs.get(activeTab) ?? [];
    setCharts(newCharts);

    // layout과 charts 동기화
    setLayout(() => {
      return newCharts.map((c, index) => ({
        i: String(c.id),
        x: index % 3,
        y: Math.floor(index / 3),
        w: 1,
        h: 1,
      }));
    });
  }, [activeTab, graphList, categoryGraphs]);

  /* -------------------------------------------------------
      react-grid-layout drag → layout + charts 순서 업데이트
  -------------------------------------------------------- */
  const handleLayoutChange = (currentLayout: any[]) => {
    setLayout(currentLayout);

    const sortedIds = [...currentLayout]
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((l) => l.i);

    const newOrderNames: string[] = [];

    sortedIds.forEach((id) => {
      const match = charts.find((c) => String(c.id) === id);
      if (match) newOrderNames.push(match.name);
    });

    reorderGraphsByNames(newOrderNames);
    void saveWidgetOrder();
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

    await saveWidgetOrder();
    triggerRefresh();
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
          <div className="dashboard__grid dashboard__grid--main">
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
              rowHeight={290}
              onLayoutChange={handleLayoutChange}
              compactType="vertical"
            >
              {charts.map((graph) => (
                <div key={String(graph.id)}>
                  <ChartCard
                    title={graph.name}
                    status="normal"
                    onSettingClick={() => {
                      const idx = charts.findIndex((c) => c.id === graph.id);
                      setSettingTargetIndex(idx);
                      setIsSettingOpen(true);
                    }}
                    showDragIcon
                    showSettingIcon
                    graphData={graph}
                  />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>
        )}

        {/* ======================= OTHER TABS ========================= */}
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
                  onSettingClick={() => {
                    setSettingTargetIndex(0);
                    setIsSettingOpen(true);
                  }}
                  showDragIcon={false}
                  showSettingIcon={false}
                  graphData={charts[0]}
                />
              )}
            </div>

            <div className="dashboard__row row-2">
              {charts.slice(1, 3).map((graph, i) => (
                <ChartCard
                  key={graph.id}
                  title={graph.name}
                  status="normal"
                  onSettingClick={() => {
                    setSettingTargetIndex(i + 1);
                    setIsSettingOpen(true);
                  }}
                  showDragIcon={false}
                  showSettingIcon={false}
                  graphData={graph}
                />
              ))}
            </div>

            <div className="dashboard__row row-3">
              {charts.slice(3, 5).map((graph, i) => (
                <ChartCard
                  key={graph.id}
                  title={graph.name}
                  status="normal"
                  onSettingClick={() => {
                    setSettingTargetIndex(i + 3);
                    setIsSettingOpen(true);
                  }}
                  showDragIcon={false}
                  showSettingIcon={false}
                  graphData={graph}
                />
              ))}
            </div>

            <div className="dashboard__row row-4">
              {charts.slice(5, 8).map((graph, i) => (
                <ChartCard
                  key={graph.id}
                  title={graph.name}
                  status="normal"
                  onSettingClick={() => {
                    setSettingTargetIndex(i + 5);
                    setIsSettingOpen(true);
                  }}
                  showDragIcon={false}
                  showSettingIcon={false}
                  graphData={graph}
                />
              ))}
            </div>
          </>
        )}

        {isSettingOpen && settingTargetIndex !== null && (
          <ChartSetting
            onClose={() => setIsSettingOpen(false)}
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
    </div>
  );
};

export default Dashboard;
