import React from "react";
import SqlDetailPanel from "./SqlDetailPanel";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";

/*
 ******************************************************************
 작성자: 오수경
 ******************************************************************
 */

interface CompareDetail {
  date: string;
  detail: SqlDetailData;
}

interface Props {
  base: CompareDetail;
  compare: CompareDetail;
}

// 선택된 두 SQL의 상세 정보를 새 창에서 비교
const CompareSqlWindow: React.FC<Props> = ({ base, compare }) => {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--color-bg)",
        color: "var(--color-text)",
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
          background: "var(--color-surface)",
          borderRight: "1px solid var(--color-border)",
        }}
      >
        <SqlDetailPanel data={base.detail} date={base.date} />
      </div>

      {/* 비교 */}
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100%",
          overflowY: "auto",
          padding: "20px",
          background: "var(--color-surface)",
        }}
      >
        <SqlDetailPanel data={compare.detail} date={compare.date} />
      </div>
    </div>
  );
};

export default CompareSqlWindow;
