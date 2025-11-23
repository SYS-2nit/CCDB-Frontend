import React from "react";
import Button from "@/components/Button/Button";
import TableChart from "@/components/Chart/TableChart";
import BarGauge from "@/components/Chart/BarGauge";
import Checkbox from "@/components/Checkbox/Checkbox";
import Spinner from "@/components/Spinner/Spinner";
import type { RankData } from "./rank";

interface SqlTopTableProps {
  date: string;
  list: RankData[];
  isTableLoading: boolean;
  metricLabel: string;
  selectedSqlId: string | null;
  onSelectChange: (sqlId: string | null) => void;
  onRowClick: (row: RankData) => void;
  showRankChanged?: boolean;
  showCompareButton?: boolean;
  onCompareClick?: () => void;
  isCompareDisabled?: boolean;
}

export const SqlTopTable: React.FC<SqlTopTableProps> = ({
  date,
  list,
  isTableLoading,
  metricLabel,
  selectedSqlId,
  onSelectChange,
  onRowClick,
  showRankChanged = false,
  showCompareButton = false,
  onCompareClick,
  isCompareDisabled = false,
}) => {
  const columns = showRankChanged
    ? [
        { key: "check", label: "check" },
        { key: "rankChanged", label: "rank changed" },
        { key: "ratio", label: "ratio" },
        { key: "exec", label: metricLabel },
        { key: "hash", label: "SQL ID" },
        { key: "query", label: "query" },
      ]
    : [
        { key: "check", label: "check" },
        { key: "ratio", label: "ratio" },
        { key: "exec", label: metricLabel },
        { key: "hash", label: "SQL ID" },
        { key: "query", label: "query" },
      ];

  const rows = list.map((row) => {
    const rowData: React.ReactNode[] = [
      <Checkbox
        key={`check-${row.sqlId}`}
        size="sm"
        checked={selectedSqlId === row.sqlId}
        onChange={() =>
          onSelectChange(selectedSqlId === row.sqlId ? null : row.sqlId)
        }
      />,
    ];

    if (showRankChanged) {
      rowData.push(row.rankChanged);
    }

    rowData.push(
      <BarGauge key={`ratio-${row.sqlId}`} value={row.ratio} />,
      row.exec,
      row.sqlId,
      <span
        key={`query-${row.sqlId}`}
        className="sql-top__query-link"
        onClick={() => onRowClick(row)}
      >
        {row.query}
      </span>
    );

    return rowData;
  });

  return (
    <div className="sql-top__table-block">
      <div className="sql-top__table-block-header">
        <div className="sql-top__table-block-header-left">
          {date || "YYYY-MM-DD"}
        </div>
        <div className="sql-top__table-block-header-right">
          {showCompareButton && (
            <Button
              text="비교하기"
              size="sm"
              variant="primary"
              disabled={isCompareDisabled}
              onClick={onCompareClick}
            />
          )}
        </div>
      </div>

      {isTableLoading ? (
        <div className="sql-stat__spinner-wrapper">
          <Spinner message="테이블 데이터 불러오는 중..." />
        </div>
      ) : list.length === 0 ? (
        <div className="sql-stat__table-null">검색 결과가 없습니다.</div>
      ) : (
        <TableChart columns={columns} rows={rows} />
      )}
    </div>
  );
};

