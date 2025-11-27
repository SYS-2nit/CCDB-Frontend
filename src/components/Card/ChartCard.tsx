import React, { useState, memo, useMemo, useCallback } from "react";
import "./ChartCard.scss";
import SettingIcon from "@/assets/general/setting.svg";
import InfoIcon from "@/assets/general/info.svg";
import DragIcon from "@/assets/general/drag.svg";
import { getChartByTitle } from "./utils/getChartByTitle";
import {
  renderDynamicChart,
  GRAPH_TITLE_SUFFIX_FORMATTERS,
} from "./utils/renderDynamicChart";

import {
  useDashboardContext,
  type DashboardMode,
} from "@/state/DashboardContext";
import ChartInfoModal from "./ChartInfoModal";
import type { GraphDataResponse } from "@/api/Dashboard/dashboard";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface ChartCardProps {
  title: string;
  status?: "normal" | "warning";
  onSettingClick?: () => void;
  showSettingIcon?: boolean;
  showDragIcon?: boolean;
  graphData?: GraphDataResponse | null;
  mode?: DashboardMode;
  allGraphsInCategory?: GraphDataResponse[];
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  status = "normal",
  onSettingClick,
  showSettingIcon = true,
  showDragIcon = true,
  graphData,
  mode: propMode,
  allGraphsInCategory,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  const {
    graphsByName,
    isFetching,
    error,
    selectedInstanceId,
    mode: contextMode,
  } = useDashboardContext();

  const [showInfo, setShowInfo] = useState(false);

  const data = useMemo(
    () => graphData ?? graphsByName[title],
    [graphData, graphsByName, title]
  );
  const mode = propMode ?? contextMode;

  // 모달 고정 위치
  const modalPos = useMemo(() => ({ x: -300, y: 0 }), []);

  const handleInfoEnter = useCallback(() => {
    setShowInfoModal(true);
  }, []);

  const handleInfoLeave = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  // Description 가공 - 메모이제이션
  const formattedDescription = useMemo(
    () => graphData?.description?.split("\n").join("<br />") ?? "",
    [graphData?.description]
  );

  // bodyContent 메모이제이션 - 성능 최적화 핵심
  const bodyContent = useMemo(() => {
    if (!graphData && !selectedInstanceId) {
      return (
        <div className="chart-placeholder">인스턴스를 선택해주세요.</div>
      );
    }
    if (!graphData && isFetching) {
      return (
        <div className="chart-placeholder">데이터를 불러오는 중입니다...</div>
      );
    }
    if (!graphData && error) {
      return <div className="chart-placeholder">{error}</div>;
    }
    if (data) {
      const rendered = renderDynamicChart(
        title,
        data,
        mode,
        allGraphsInCategory
      );
      return rendered ?? getChartByTitle(title, data, mode);
    }
    return getChartByTitle(title, data, mode);
  }, [
    graphData,
    selectedInstanceId,
    isFetching,
    error,
    data,
    title,
    mode,
    allGraphsInCategory,
  ]);

  // 그래프별 제목 suffix 가져오기 - 메모이제이션
  const titleSuffix = useMemo(() => {
    if (graphData && graphData.id && GRAPH_TITLE_SUFFIX_FORMATTERS[graphData.id]) {
      return GRAPH_TITLE_SUFFIX_FORMATTERS[graphData.id](graphData);
    }
    return null;
  }, [graphData]);

  // alertSeverity에서 borderColor 계산 - 메모이제이션
  const borderColor = useMemo(() => {
    if (!graphData?.alertSeverity) return undefined;
    switch (graphData.alertSeverity) {
      case 1:
        return "#FACC15"; // 주의 (노란색)
      case 2:
        return "#DC2626"; // 위험 (빨간색)
      case 3:
        return "#151515"; // 치명 (검은색)
      default:
        return undefined;
    }
  }, [graphData?.alertSeverity]);

  return (
    <div
      className={`chart-card ${status}`}
      style={
        borderColor
          ? {
              border: `3px solid ${borderColor}`,
              borderRadius: "8px",
              boxSizing: "border-box",
            }
          : {}
      }
    >
      <div className="chart-card__header">
        <div className="chart-card__left chart-card__drag-handle">
          {showDragIcon && <img src={DragIcon} alt="Drag" />}
          <span className="chart-card__title">
            {title}
            {titleSuffix && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#666",
                  marginLeft: "12px",
                  fontWeight: "normal",
                }}
              >
                {titleSuffix}
              </span>
            )}
          </span>
        </div>

        <div className="chart-card__right">
          <div
            onMouseEnter={handleInfoEnter}
            onMouseLeave={handleInfoLeave}
            style={{ position: "relative" }}
          >
            <img src={InfoIcon} alt="info" />

            {showInfoModal && graphData?.description && (
              <ChartInfoModal
                pos={modalPos}
                description={formattedDescription}
                onMouseEnter={() => setShowInfoModal(true)}
                onMouseLeave={() => setShowInfoModal(false)}
              />
            )}
          </div>

          {showSettingIcon && (
            <div
              className="chart-card__setting-wrapper"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onSettingClick) {
                  onSettingClick();
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <img
                src={SettingIcon}
                alt="setting"
                className="chart-card__setting"
              />
            </div>
          )}
        </div>
      </div>

      <div className="chart-card__body">{bodyContent}</div>

      {/* Info Modal for click */}
      {showInfo && data?.description && (
        <ChartInfoModal
          pos={modalPos}
          description={formattedDescription}
          onMouseEnter={() => setShowInfo(false)}
          onMouseLeave={() => setShowInfo(true)}
        />
      )}
    </div>
  );
};

// 성능 최적화: props 비교 함수 추가
export default memo(ChartCard, (prevProps, nextProps) => {
  // 기본 props 비교
  if (
    prevProps.title !== nextProps.title ||
    prevProps.status !== nextProps.status ||
    prevProps.showSettingIcon !== nextProps.showSettingIcon ||
    prevProps.showDragIcon !== nextProps.showDragIcon ||
    prevProps.mode !== nextProps.mode
  ) {
    return false; // 리렌더링 필요
  }

  // graphData 깊은 비교 (id와 data만 비교)
  const prevGraphData = prevProps.graphData;
  const nextGraphData = nextProps.graphData;

  if (prevGraphData === nextGraphData) {
    return true; // 동일한 참조
  }

  if (!prevGraphData && !nextGraphData) {
    return true; // 둘 다 null
  }

  if (!prevGraphData || !nextGraphData) {
    return false; // 하나만 null
  }

  // id 비교
  if (prevGraphData.id !== nextGraphData.id) {
    return false;
  }

  // data 배열 길이 비교
  const prevDataLength = prevGraphData.data?.length ?? 0;
  const nextDataLength = nextGraphData.data?.length ?? 0;
  if (prevDataLength !== nextDataLength) {
    return false;
  }

  // 마지막 데이터 포인트만 비교 (성능 최적화)
  if (prevDataLength > 0 && nextDataLength > 0) {
    const prevLast = prevGraphData.data![prevDataLength - 1];
    const nextLast = nextGraphData.data![nextDataLength - 1];
    if (prevLast.timestamp !== nextLast.timestamp) {
      return false;
    }
  }

  // allGraphsInCategory 비교 (길이만 비교)
  const prevAllGraphsLength = prevProps.allGraphsInCategory?.length ?? 0;
  const nextAllGraphsLength = nextProps.allGraphsInCategory?.length ?? 0;
  if (prevAllGraphsLength !== nextAllGraphsLength) {
    return false;
  }

  // onSettingClick 함수 참조 비교 (일반적으로 동일한 함수이므로 무시)
  // 실제로는 함수가 변경되지 않으므로 true 반환
  return true; // 리렌더링 불필요
});
