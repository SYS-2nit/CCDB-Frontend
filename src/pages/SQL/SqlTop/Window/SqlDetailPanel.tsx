import React from "react";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import LineChart from "@/components/Chart/LineChart";

interface Props {
  data: SqlDetailData;
  date: string;
}

// 단일 SQL의 상세 정보를 Drawer 형태로 표시
const SqlDetailPanel: React.FC<Props> = ({ data, date }) => {
  return (
    <div
      style={{
        boxSizing: "border-box",
        overflow: "hidden",
        whiteSpace: "normal",
        color: "var(--color-text)",
      }}
    >
      <h2 style={{ fontSize: "20px", color: "var(--color-text)" }}>
        SQL 상세 정보 ({date})
      </h2>

      <pre
        style={{
          background: "var(--color-bg)",
          margin: "20px 0px",
          padding: "20px",
          borderRadius: "5px",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          boxSizing: "border-box",
          width: "100%",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        }}
      >
        {data.sqlText}
      </pre>

      <div style={{ fontSize: "14px", color: "var(--color-text)" }}>
        <strong>Elapsed:</strong> {data.totalElapsed} &nbsp;
        <strong>CPU:</strong> {data.totalCpu} &nbsp;
        <strong>Buffer:</strong> {data.totalBuffer} &nbsp;
        <strong>Disk:</strong> {data.totalDisk} &nbsp;
        <strong>Exec:</strong> {data.totalExec}
      </div>

      <ChartSection title="Elapsed Trend">
        <LineChart
          legends={["Elapsed"]}
          seriesData={[data.elapsedTrend.map((v) => v.value)]}
          categories={data.elapsedTrend.map((v) => v.time)}
        />
      </ChartSection>

      <ChartSection title="CPU Trend">
        <LineChart
          legends={["CPU"]}
          seriesData={[data.cpuTrend.map((v) => v.value)]}
          categories={data.cpuTrend.map((v) => v.time)}
        />
      </ChartSection>

      <ChartSection title="Wait Trend">
        <LineChart
          legends={["Wait"]}
          seriesData={[data.waitTrend.map((v) => v.value)]}
          categories={data.waitTrend.map((v) => v.time)}
        />
      </ChartSection>
    </div>
  );
};

const ChartSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div style={{ marginTop: "20px" }}>
    <h3
      style={{
        fontSize: "16px",
        color: "var(--color-text)",
        marginBottom: "10px",
      }}
    >
      {title}
    </h3>
    <div>{children}</div>
  </div>
);

export default SqlDetailPanel;
