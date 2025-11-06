import React from "react";
import "./TableChart.scss";

interface TableChartProps {
  columns: string[];
  rows: React.ReactNode[][];
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const TableChart: React.FC<TableChartProps> = ({
  columns,
  rows,
  size = "sm",
  onClick,
}) => {
  return (
    <div className={`table-chart__wrapper table-chart__wrapper--${size}`}>
      <table className={`table-chart table-chart--${size}`}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
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
