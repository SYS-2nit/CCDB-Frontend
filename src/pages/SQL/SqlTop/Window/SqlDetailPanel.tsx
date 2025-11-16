/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { SqlDetailData } from "@/api/Sql/SqlDetailData";
import LineChart from "@/components/Chart/LineChart";

interface Props {
  data: SqlDetailData;
  date: string;
}

const SqlDetailPanel: React.FC<Props> = ({ data, date }) => {
  return (
    <div
      style={{
        boxSizing: "border-box",
        overflow: "hidden",
        whiteSpace: "normal",
      }}
    >
      <h2 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
        SQL 상세 정보 ({date})
      </h2>

      <pre
        style={{
          background: "#f6f6f6",
          padding: "20px",
          borderRadius: "5px",
          fontSize: "12px",
        }}
      >
        {data.sqlText}
      </pre>

      <div style={{ fontSize: "14px" }}>
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

const ChartSection: React.FC<{ title: string; children: any }> = ({
  title,
  children,
}) => (
  <div>
    <h3 style={{ fontSize: "18px" }}>{title}</h3>
    <div>{children}</div>
  </div>
);

export default SqlDetailPanel;
