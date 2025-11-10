import React, { useState } from "react";
import "./History.scss";
import DateInput from "@/components/Input/DateInput";
import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";
import LineChart from "@/components/Chart/LineChart";
import { AlertTriangle, CheckCircle, Settings, X } from "lucide-react";
import Select from "@/components/Select/Select";

interface FilterItem {
  key: string;
  label: string;
  value: string;
}

const History: React.FC = () => {
  const [filters, setFilters] = useState<FilterItem[]>([]);

  /** 공통 업데이트 함수 */
  const updateFilter = (key: string, label: string, value: string) => {
    setFilters((prev) => {
      if (!value) return prev.filter((f) => f.key !== key);
      const exists = prev.find((f) => f.key === key);
      if (exists) {
        return prev.map((f) => (f.key === key ? { ...f, value } : f));
      } else {
        return [...prev, { key, label, value }];
      }
    });
  };

  /** 필터 제거 */
  const removeFilter = (key: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  };

  /** 날짜 및 시간 유효성 검사 */
  const handleDateChange = (type: "start" | "end", value: string) => {
    const duration = filters.find((f) => f.key === "duration")?.value;

    // 기간 미선택 시
    if (!duration || duration === "0") {
      alert("먼저 기간을 선택해주세요.");
      return;
    }

    const start =
      type === "start" ? value : filters.find((f) => f.key === "start")?.value;
    const end =
      type === "end" ? value : filters.find((f) => f.key === "end")?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      // 종료일이 시작일보다 빠를 경우
      if (endDate.getTime() < startDate.getTime()) {
        alert("종료일은 시작일보다 이후여야 합니다.");
        return;
      }

      // 같은 날 검증
      const sameDay =
        startDate.getFullYear() === endDate.getFullYear() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getDate() === endDate.getDate();

      if (["1분", "10분", "1시간"].includes(duration) && !sameDay) {
        alert("1분, 10분, 1시간 단위는 같은 날 내에서만 선택 가능합니다.");
        return;
      }

      // 10분 단위 정렬 검증
      if (duration === "10분") {
        const startMin = startDate.getMinutes();
        const endMin = endDate.getMinutes();

        // 예: 시작이 01:02면 종료는 01:12, 01:22 등 '분의 일의 자리'가 같아야 함
        if (startMin % 10 !== endMin % 10) {
          alert(
            "10분 단위는 시작 시간의 분 단위 끝자리가 동일해야 합니다. (예: 01:02 → 02, 12, 22...)"
          );
          return;
        }
      }

      // 1시간 단위 정렬 검증
      if (duration === "1시간") {
        const startMin = startDate.getMinutes();
        const endMin = endDate.getMinutes();

        if (startMin !== endMin) {
          alert(
            "1시간 단위는 시작 시각의 분이 동일해야 합니다. (예: 01:15 → 02:15, 03:15)"
          );
          return;
        }
      }
    }

    updateFilter(type, type === "start" ? "시작일" : "종료일", value);
  };

  /** 기간 선택 시 */
  const handleDurationChange = (value: string) => {
    updateFilter("duration", "기간", value);
  };

  const duration = filters.find((f) => f.key === "duration")?.value || "";

  return (
    <div className="history">
      {/* 1행: 필터 영역 */}
      <div className="history__filters">
        <div className="history__filter-row">
          <Select
            label="기간"
            value={duration}
            onChange={(e) => handleDurationChange(e.target.value)}
            options={[
              { label: "선택해주세요", value: "0" },
              { label: "1분", value: "1분" },
              { label: "10분", value: "10분" },
              { label: "1시간", value: "1시간" },
              { label: "하루", value: "하루" },
            ]}
          />

          {/* 시간 단위일 경우 datetime-local */}
          {["1분", "10분", "1시간"].includes(duration) ? (
            <>
              <div className="date-input">
                <label className="date-input__label">시작일</label>
                <input
                  type="datetime-local"
                  value={filters.find((f) => f.key === "start")?.value || ""}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="date-input__field date-input__field--sm date-input__field--default"
                />
              </div>
              <div className="date-input">
                <label className="date-input__label">종료일</label>
                <input
                  type="datetime-local"
                  value={filters.find((f) => f.key === "end")?.value || ""}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="date-input__field date-input__field--sm date-input__field--default"
                />
              </div>
            </>
          ) : (
            <>
              <DateInput
                label="시작일"
                value={filters.find((f) => f.key === "start")?.value || ""}
                onChange={(e) => handleDateChange("start", e.target.value)}
              />
              <DateInput
                label="종료일"
                value={filters.find((f) => f.key === "end")?.value || ""}
                onChange={(e) => handleDateChange("end", e.target.value)}
              />
            </>
          )}

          <Select
            label="카테고리"
            placeholder="선택해주세요."
            value={filters.find((f) => f.key === "category")?.value || ""}
            onChange={(e) =>
              updateFilter("category", "카테고리", e.target.value)
            }
            options={[
              { label: "CPU", value: "CPU" },
              { label: "Memory", value: "Memory" },
              { label: "Session", value: "Session" },
              { label: "I/O", value: "I/O" },
            ]}
          />

          <Select
            label="그래프"
            placeholder="선택해주세요."
            value={filters.find((f) => f.key === "graph")?.value || ""}
            onChange={(e) => updateFilter("graph", "그래프", e.target.value)}
            options={[
              { label: "Elapsed", value: "Elapsed" },
              { label: "Wait", value: "Wait" },
              { label: "Usage", value: "Usage" },
              { label: "Trend", value: "Trend" },
            ]}
          />

          <Input
            label="키워드"
            size="lg"
            placeholder="검색어를 입력해주세요."
            value={filters.find((f) => f.key === "keyword")?.value || ""}
            onChange={(e) => updateFilter("keyword", "키워드", e.target.value)}
          />

          <Button text="검색" size="sm" variant="primary" />
        </div>

        {/* 2행: 조건 표시 */}
        {filters.length > 0 && (
          <div className="history__conditions">
            <div className="history__conditions-title">검색 조건:</div>
            {filters.map((f) => (
              <div key={f.key} className="history__chip">
                <span>
                  {f.label}: {f.value}
                </span>
                <button
                  className="history__chip-remove"
                  onClick={() => removeFilter(f.key)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 차트 카드 */}
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
