import React, { useState } from "react";
import "./History.scss";
import DateInput from "@/components/Input/DateInput";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import LineChart from "@/components/Chart/LineChart";
import { AlertTriangle, CheckCircle, Settings } from "lucide-react";
import Select from "@/components/Select/Select";

const History: React.FC = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");

  return (
    <div className="history">
      {/* 상단 검색 필터 영역 */}
      <div className="history__filters">
        <DateInput
          label="시작일"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <DateInput
          label="종료일"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Select
          options={[
            { label: "CPU", value: "CPU" },
            { label: "Memory", value: "Memory" },
            { label: "Session", value: "Session" },
            { label: "I/O", value: "I/O" },
          ]}
        />

        <Select
          options={[
            { label: "Elapsed", value: "Elapsed" },
            { label: "Wait", value: "Wait" },
            { label: "Usage", value: "Usage" },
            { label: "Trend", value: "Trend" },
          ]}
        />
        <Input
          label="키워드"
          placeholder="검색어를 입력해주세요."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button text="검색" size="md" variant="primary" />
      </div>

      {/* 검색 조건 버튼 */}
      <div className="history__conditions">
        <Button text="CPU" size="sm" />
        <Button text="CPU" size="sm" />
        <Button text="CPU" size="sm" />
        <Button text="CPU" size="sm" />
        <Button text="CPU" size="sm" />
      </div>

      {/* 차트 카드 영역 */}
      <div className="history__grid">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="history__card">
            <div className="history__card-header">
              <h4 className="history__card-title">
                Title{" "}
                {idx % 2 === 0 ? (
                  <AlertTriangle size={16} color="#ef4444" />
                ) : (
                  <CheckCircle size={16} color="#16a34a" />
                )}
              </h4>
              <Settings size={16} color="#6b7280" />
            </div>

            <LineChart
              legends={["Text (단위)", "Text (단위)", "Text (단위)"]}
              seriesData={[
                [5, 7, 4, 8, 6, 9, 7],
                [4, 6, 3, 5, 4, 7, 6],
                [3, 5, 2, 4, 3, 5, 4],
              ]}
              categories={[
                "Text",
                "Text",
                "Text",
                "Text",
                "Text",
                "Text",
                "Time",
              ]}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
