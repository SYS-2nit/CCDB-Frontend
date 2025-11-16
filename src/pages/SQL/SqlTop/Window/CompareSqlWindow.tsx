import React from "react";
import SqlDetailPanel from "./SqlDetailPanel";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

interface CompareDetail {
  date: string;
  detail: SqlDetailData;
}

interface Props {
  base: CompareDetail;
  compare: CompareDetail;
}

const CompareSqlWindow: React.FC<Props> = ({ base, compare }) => {
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      {/* 기준 */}
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          overflowY: "auto",
          padding: "20px",
        }}
      >
        <SqlDetailPanel data={base.detail} date={base.date} />
      </div>

      {/* 비교 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px",
        }}
      >
        <SqlDetailPanel data={compare.detail} date={compare.date} />
      </div>
    </div>
  );
};

export default CompareSqlWindow;
