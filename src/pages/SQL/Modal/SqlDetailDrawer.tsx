import React from "react";
import "./SqlDetailDrawer.scss";
import LineChart from "@/components/Chart/LineChart";
import BarChart from "@/components/Chart/BarChart";
import TableChart from "@/components/Chart/TableChart";

interface SqlDetailDrawerProps {
  data: {
    query: string;
    rank: number;
    ratio: number;
    exec: number;
  };
  onClose: () => void;
}

const SqlDetailDrawer: React.FC<SqlDetailDrawerProps> = ({ data, onClose }) => {
  // Table 데이터
  const columns1 = [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
  ];
  const columns2 = [
    { key: "metric", label: "Metric" },
    { key: "value", label: "Value" },
  ];
  const columns3 = [
    { key: "event", label: "Event Name" },
    { key: "time", label: "Wait Time" },
  ];

  const rows1 = [
    ["CPU Time", "2.8s"],
    ["Elapsed Time", "4.2s"],
    ["Execute Count", "146"],
    ["Logical Reads", "58,240"],
    ["Physical Reads", "4,312"],
  ];

  const rows2 = [
    ["User I/O", "32.8%"],
    ["Concurrency", "17.8%"],
    ["Commit", "10.9%"],
    ["System I/O", "9.7%"],
    ["Idle", "8.3%"],
  ];

  const rows3 = [
    ["db file sequential read", "32.8%"],
    ["log file sync", "19.2%"],
    ["direct path read", "12.8%"],
    ["control file parallel write", "9.7%"],
    ["db file scattered read", "8.3%"],
  ];

  return (
    <>
      <div className="sql-drawer__overlay" onClick={onClose} />
      <div className="sql-drawer">
        <div className="sql-drawer__header">
          <h3>SQL 상세 탭</h3>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sql-drawer__body">
          {/* 왼쪽 Query 영역 */}
          <div className="sql-drawer__query-section">
            <h4 className="sql-drawer__query-title">Query (id:...)</h4>
            <div className="sql-drawer__query-box">
              {data.query ||
                `SELECT count(*) 
                    FROM ...
                    (
                      SELECT * 
                      FROM ...
                      WHERE ...
                    ) cc`}
            </div>
          </div>

          {/* 오른쪽 Trend + Chart + Table */}
          <div className="sql-drawer__trend">
            <h4 className="sql-drawer__trend-title">Trend</h4>

            <div className="chart-block">
              <h5>Elapsed Time</h5>
              <div className="sql-drawer__gauge">
                <div className="sql-drawer__gauge-cpu">cpu_time (N Sec)</div>
                <div className="sql-drawer__gauge-scheduler">Scheduler</div>
                <div className="sql-drawer__gauge-idle">Idle (N Sec)</div>
              </div>
            </div>

            <div className="chart-block">
              <h5>Elapsed Time Trend</h5>
              <LineChart
                legends={["CPU 시간", "Elapsed Time Avg", "Execute Count"]}
                seriesData={[
                  [5, 6, 4, 7, 8, 6, 9],
                  [3, 4, 3, 5, 6, 4, 5],
                  [8, 10, 12, 11, 9, 10, 8],
                ]}
                categories={[
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                ]}
              />
            </div>

            <div className="chart-block">
              <h5>I/O Trend</h5>
              <LineChart
                legends={["Logical Reads Sum", "Physical Reads Sum"]}
                seriesData={[
                  [10, 14, 8, 11, 15, 9, 13],
                  [5, 7, 4, 6, 8, 5, 7],
                ]}
                categories={[
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                  "Text",
                ]}
              />
            </div>

            <div className="chart-block">
              <h5>Wait Time Trend</h5>
              <BarChart
                legends={["Wait Time"]}
                seriesData={[[3, 5, 4, 6, 5, 4]]}
                categories={["Text", "Text", "Text", "Text", "Text", "Text"]}
                horizontal={false}
              />
            </div>

            <div className="chart-block">
              <div className="sql-drawer__tables">
                <div className="sql-drawer__table">
                  <h5>Total Statistics</h5>
                  <TableChart columns={columns1} rows={rows1} size="sm" />
                </div>

                <div className="sql-drawer__table">
                  <h5>Total Wait Classes</h5>
                  <TableChart columns={columns2} rows={rows2} size="sm" />
                </div>

                <div className="sql-drawer__table">
                  <h5>Top Wait Events</h5>
                  <TableChart columns={columns3} rows={rows3} size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SqlDetailDrawer;
