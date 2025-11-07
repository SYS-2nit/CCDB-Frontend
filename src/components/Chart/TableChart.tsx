import React from "react";
import "./TableChart.scss";

interface TableChartProps {
  columns: { key: string; label: string }[];
  rows: React.ReactNode[][];
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  sortable?: boolean;
  sortConfig?: { key: string; direction: "asc" | "desc" } | null;
  onSort?: (key: string) => void;
}

const TableChart: React.FC<TableChartProps> = ({
  columns,
  rows,
  size = "sm",
  onClick,
  sortable = false,
  sortConfig = null,
  onSort,
}) => {
  return (
    <div className={`table-chart__wrapper table-chart__wrapper--${size}`}>
      <table className={`table-chart table-chart--${size}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => sortable && onSort && onSort(col.key)}
                className={`table-chart__th ${sortable ? "sortable" : ""}`}
              >
                <div className="table-chart__th-content">
                  <span>{col.label}</span>
                  {sortable && (
                    <span className="table-chart__sort-icon">
                      {sortConfig?.key === col.key ? (
                        sortConfig.direction === "asc" ? (
                          "▲"
                        ) : (
                          "▼"
                        )
                      ) : (
                        <span className="placeholder">▲</span>
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="table-chart__row">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`table-chart__cell ${
                    typeof cell === "number" ? "numeric" : ""
                  }`}
                  onClick={cIdx === 1 && onClick ? onClick : undefined}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableChart;
