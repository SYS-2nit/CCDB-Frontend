import React, { useEffect, useMemo, useState } from "react";
import "./ChartSetting.scss";
import SearchIcon from "@/assets/general/search.svg";
import { fetchAllGraphs, type GraphDefinition } from "@/api/dashboard";

interface ChartSettingProps {
  onClose: () => void;
  position: number;
  currentGraph: { id: number; name: string } | null;
  onConfirm: (graph: GraphDefinition) => Promise<void> | void;
}

const CATEGORY_LABELS: Record<string, string> = {
  CUSTOM: "Custom",
  CPU: "CPU",
  MEMORY: "Memory",
  SESSION: "Session",
  IO: "I/O",
  STORAGE: "Storage",
  PREVENTION: "장애 예방",
  PERFORMANCE: "성능 개선",
};

const ChartSetting: React.FC<ChartSettingProps> = ({
  onClose,
  position,
  currentGraph,
  onConfirm,
}) => {
  const [graphs, setGraphs] = useState<GraphDefinition[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("CUSTOM");
  const [selectedGraphId, setSelectedGraphId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGraphs = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAllGraphs();
        setGraphs(response ?? []);
        if (currentGraph) {
          setSelectedGraphId(currentGraph.id);
          const current = response.find(
            (graph) => graph.id === currentGraph.id
          );
          if (current) {
            setActiveCategory(current.category);
          }
        }
        setError(null);
      } catch (err) {
        console.warn("[ChartSetting] 그래프 목록 조회 실패", err);
        setError("그래프 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadGraphs();
  }, [currentGraph]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    graphs.forEach((graph) => set.add(graph.category));
    return Array.from(set);
  }, [graphs]);

  useEffect(() => {
    if (!graphs.length) return;
    if (!categories.includes(activeCategory)) {
      setActiveCategory(categories[0] ?? "CUSTOM");
    }
  }, [categories, graphs.length, activeCategory]);

  const filteredGraphs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return graphs.filter((graph) => {
      const matchesCategory =
        graph.category === activeCategory || term.length > 0;
      const matchesSearch = term
        ? graph.name.toLowerCase().includes(term)
        : graph.category === activeCategory;
      return matchesCategory && matchesSearch;
    });
  }, [graphs, activeCategory, searchTerm]);

  const handleSelectGraph = (graphId: number) => {
    setSelectedGraphId(graphId);
  };

  const handleConfirmClick = async () => {
    if (selectedGraphId === null) {
      onClose();
      return;
    }
    const selected = graphs.find((graph) => graph.id === selectedGraphId);
    if (!selected) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      await onConfirm(selected);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="chart-setting">
      <div className="chart-setting__header">
        <span className="chart-setting__header--title">차트 변경</span>
        <span className="chart-setting__header--subtitle">
          위치 {position + 1}번 그래프를 변경합니다.
        </span>
      </div>

      <div className="chart-setting__body">
        <div className="chart-setting__body--search">
          <img src={SearchIcon} alt="search" />
          <input
            type="text"
            placeholder="그래프 이름을 검색하세요."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="chart-setting__tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`chart-setting__tab ${
                activeCategory === category ? "active" : ""
              }`}
              onClick={() => {
                setActiveCategory(category);
                setSearchTerm("");
              }}
            >
              {CATEGORY_LABELS[category] ?? category}
            </button>
          ))}
        </div>

        <div className="chart-setting__body--preview">
          {selectedGraphId !== null
            ? graphs.find((graph) => graph.id === selectedGraphId)?.name ?? ""
            : currentGraph?.name ?? "그래프를 선택해주세요."}
        </div>

        <div className="chart-setting__body--options">
          {isLoading ? (
            <span className="chart-setting__body--no-result">
              불러오는 중입니다...
            </span>
          ) : error ? (
            <span className="chart-setting__body--no-result">{error}</span>
          ) : filteredGraphs.length > 0 ? (
            filteredGraphs.map((graph) => (
              <label
                key={graph.id}
                className={selectedGraphId === graph.id ? "active" : ""}
                onClick={() => handleSelectGraph(graph.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedGraphId === graph.id}
                  readOnly
                />
                {graph.name} (
                {CATEGORY_LABELS[graph.category] ?? graph.category})
              </label>
            ))
          ) : (
            <span className="chart-setting__body--no-result">
              검색 결과가 없습니다.
            </span>
          )}
        </div>
      </div>

      <div className="chart-setting__footer">
        <button className="cancel" onClick={onClose} disabled={isSaving}>
          취소
        </button>
        <button
          className="confirm"
          onClick={handleConfirmClick}
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>
    </aside>
  );
};

export default ChartSetting;
