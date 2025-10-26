import React from "react";
import "./TableChart.scss";

interface TableChartProps {
  columns: string[];
  rows: (string | number)[][];
}

const TableChart: React.FC<TableChartProps> = ({ columns, rows }) => {
  return (
    <div className="table-chart__wrapper">
      <table className="table-chart">
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
                <td key={cIdx}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableChart;
