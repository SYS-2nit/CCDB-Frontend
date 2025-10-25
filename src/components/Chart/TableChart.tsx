import React from "react";

const TableChart: React.FC = () => {
  const columns = ["Text", "Text", "Text", "Text", "Text", "Text"];
  const rows = Array.from({ length: 5 }).map(() =>
    Array.from({ length: 6 }, () => "Data")
  );

  return (
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
  );
};

export default TableChart;
