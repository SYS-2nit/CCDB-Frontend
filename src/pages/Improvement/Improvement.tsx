import React, { useMemo, useState } from "react";
import "./Improvement.scss";
import DateInput from "@/components/Input/DateInput";
import Button from "@/components/Button/Button";
import { useDashboardContext } from "@/state/DashboardContext";
import {
  generateReport,
  type ReportType,
  type GraphCategory,
  type ReportContent,
} from "@/api/Report/report";

type ReportTemplate = "daily" | "weekly" | "monthly";

type MetricKey =
  | "CPU"
  | "MEMORY"
  | "SESSION"
  | "IO"
  | "STORAGE"
  | "PERF_IMPROVE";

type SectionKey = "summary" | "charts" | "table";

const TEMPLATES: {
  id: ReportTemplate;
  title: string;
  description: string;
}[] = [
  {
    id: "daily",
    title: "일일 보고서",
    description: "하루 동안의 DB 성능 지표 요약",
  },
  {
    id: "monthly",
    title: "월간 보고서",
    description: "월간 종합 분석 및 개선 제안",
  },
  {
    id: "weekly",
    title: "커스텀 보고서",
    description: "원하는 날짜 기간의 성능 추이와 분석",
  },
];

const METRICS: { id: MetricKey; label: string }[] = [
  { id: "CPU", label: "CPU" },
  { id: "MEMORY", label: "MEMORY" },
  { id: "SESSION", label: "SESSION" },
  { id: "IO", label: "I/O" },
  { id: "STORAGE", label: "STORAGE" },
  { id: "PERF_IMPROVE", label: "성능/개선" },
];

const SECTIONS: { id: SectionKey; label: string; tooltip: string }[] = [
  {
    id: "summary",
    label: "요약",
    tooltip:
      "AI를 활용하여 선택한 기간 동안의 주요 성능 지표와 이상 징후를 자동으로 분석·요약합니다.",
  },
  {
    id: "charts",
    label: "차트",
    tooltip:
      "선택한 메트릭에 대한 시간대별 추이를 차트로 시각화하여 패턴과 피크 구간을 쉽게 파악할 수 있습니다.",
  },
  {
    id: "table",
    label: "데이터 테이블",
    tooltip:
      "일자, 메트릭 값, 비율 등 상세 수치를 표 형식으로 제공하여 보고서 근거 자료로 활용할 수 있습니다.",
  },
];

const Improvement: React.FC = () => {
  const { selectedInstanceId } = useDashboardContext();
  const [template, setTemplate] = useState<ReportTemplate>("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    "CPU",
    "MEMORY",
    "SESSION",
  ]);
  const [selectedSections, setSelectedSections] = useState<SectionKey[]>([
    "summary",
    "charts",
    "table",
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleMetric = (metric: MetricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleToggleSection = (section: SectionKey) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const isSingleDateTemplate = template === "daily";
  const isWeeklyTemplate = template === "weekly";
  const isMonthlyTemplate = template === "monthly";

  const periodError = useMemo(() => {
    if (!startDate) return "";

    // 월간 보고서는 endDate 검증 불필요
    if (isMonthlyTemplate) {
      return "";
    }

    // 주간 보고서: endDate 필수, 최대 7일 검증
    if (isWeeklyTemplate) {
      if (!endDate) return "종료일을 선택해주세요.";
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) return "종료일은 시작일 이후여야 합니다.";
      
      // 최대 7일 검증 (시작일 포함하여 7일)
      // const diffTime = end.getTime() - start.getTime();
      // const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 시작일 포함
      // if (diffDays > 7) return "주간 보고서는 최대 7일까지 지정할 수 있습니다.";
      
      return "";
    }

    // 일일 보고서가 아닌 경우에만 endDate 검증
    if (!isSingleDateTemplate && !endDate) return "";

    const start = new Date(startDate);
    const end = isSingleDateTemplate ? start : new Date(endDate);
    if (end < start) return "종료일은 시작일 이후여야 합니다.";

    return "";
  }, [
    startDate,
    endDate,
    template,
    isSingleDateTemplate,
    isWeeklyTemplate,
    isMonthlyTemplate,
  ]);

  const canGenerate = useMemo(() => {
    if (!selectedInstanceId) return false;
    if (!startDate) return false;
    // 주간 보고서는 endDate 필수
    if (isWeeklyTemplate && !endDate) return false;
    // 월간 보고서는 endDate 검증 불필요
    if (
      !isSingleDateTemplate &&
      !isWeeklyTemplate &&
      !isMonthlyTemplate &&
      !endDate
    )
      return false;
    if (periodError) return false;
    if (selectedMetrics.length === 0) return false;
    if (selectedSections.length === 0) return false;
    return true;
  }, [
    selectedInstanceId,
    startDate,
    endDate,
    isSingleDateTemplate,
    isWeeklyTemplate,
    isMonthlyTemplate,
    periodError,
    selectedMetrics,
    selectedSections,
  ]);

  // 프론트엔드 타입을 백엔드 타입으로 변환
  const mapTemplateToReportType = (template: ReportTemplate): ReportType => {
    switch (template) {
      case "daily":
        return "DAILY";
      case "weekly":
        return "WEEKLY";
      case "monthly":
        return "MONTHLY";
      default:
        return "DAILY";
    }
  };

  const mapMetricToCategory = (metric: MetricKey): GraphCategory => {
    switch (metric) {
      case "CPU":
        return "CPU";
      case "MEMORY":
        return "MEMORY";
      case "SESSION":
        return "SESSION";
      case "IO":
        return "IO";
      case "STORAGE":
        return "STORAGE";
      case "PERF_IMPROVE":
        return "IMPROVEMENTS";
      default:
        return "CUSTOM";
    }
  };

  const mapSectionToContent = (section: SectionKey): ReportContent => {
    switch (section) {
      case "summary":
        return "AI";
      case "charts":
        return "GRAPH";
      case "table":
        return "TABLE";
      default:
        return "AI";
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!selectedInstanceId) {
      setError("인스턴스를 선택해주세요.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 주간 보고서: 사용자가 입력한 startDate와 endDate 사용
      let calculatedStartDate = startDate;
      let calculatedEndDate: string | null = null;

      if (isWeeklyTemplate) {
        // 사용자가 입력한 endDate 사용
        calculatedEndDate = endDate || null;
      } else if (isMonthlyTemplate) {
        // 월간 보고서: YYYY-MM 형식의 값을 YYYY-MM-01로 변환
        if (startDate && startDate.length === 7) {
          // YYYY-MM 형식인 경우 첫날로 변환
          calculatedStartDate = `${startDate}-01`;
        }
        // 해당 월의 마지막 날짜 계산
        const start = new Date(calculatedStartDate);
        const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        calculatedEndDate = lastDay.toISOString().split("T")[0];
      } else if (!isSingleDateTemplate) {
        calculatedEndDate = endDate || null;
      }

      const request = {
        reportType: mapTemplateToReportType(template),
        instanceId: selectedInstanceId,
        startDate: calculatedStartDate,
        endDate: isSingleDateTemplate ? null : calculatedEndDate,
        categories: selectedMetrics.map(mapMetricToCategory),
        contents: selectedSections.map(mapSectionToContent),
      };

      // 보고서 생성 및 다운로드
      const blob = await generateReport(request);

      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // 파일명 생성 (백엔드에서 Content-Disposition 헤더로 파일명을 제공하지만,
      // 브라우저 호환성을 위해 여기서도 설정)
      const reportTypeName =
        TEMPLATES.find((t) => t.id === template)?.title || "보고서";
      const dateStr = startDate.replace(/-/g, "");
      const endDateStr = endDate ? `_${endDate.replace(/-/g, "")}` : "";
      link.download = `${reportTypeName}_${dateStr}${endDateStr}_${selectedInstanceId}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("보고서 생성 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "보고서 생성 중 오류가 발생했습니다."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedTemplateInfo = TEMPLATES.find((t) => t.id === template);

  return (
    <div className="report-page">
      <div className="report-page__layout">
        {/* 왼쪽: 설정 영역 */}
        <div className="report-page__left">
          {/* 보고서 템플릿 선택 */}
          <section className="report-section">
            <h2 className="report-section__title">템플릿</h2>
            <div className="report-section__templates">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`report-template-card ${
                    template === t.id ? "report-template-card--active" : ""
                  }`}
                  onClick={() => setTemplate(t.id)}
                >
                  <div className="report-template-card__icon">
                    {/* 간단한 이모지 아이콘 대체 */}
                    {t.id === "daily" && "📅"}
                    {t.id === "weekly" && "📊"}
                    {t.id === "monthly" && "📈"}
                  </div>
                  <div className="report-template-card__body">
                    <div className="report-template-card__title">{t.title}</div>
                    <div className="report-template-card__desc">
                      {t.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 보고서 설정 */}
          <section className="report-section">
            <h2 className="report-section__title">설정</h2>

            {/* 기간 선택 */}
            <div className="report-section__block">
              <div className="report-period">
                <div className="report-period__field">
                  <span className="report-period__label">
                    {isSingleDateTemplate
                      ? "일자"
                      : isWeeklyTemplate
                      ? "시작일 "
                      : isMonthlyTemplate
                      ? "월 선택"
                      : "시작일"}
                  </span>
                  <DateInput
                    type={isMonthlyTemplate ? "month" : "date"}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {!isSingleDateTemplate && !isMonthlyTemplate && (
                  <div className="report-period__field">
                    <span className="report-period__label">종료일</span>
                    <DateInput
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {isWeeklyTemplate && (
                <p className="report-period__hint">
                  {/* 주간 보고서는 시작일부터 종료일까지 최대 7일까지 지정할 수 있습니다. */}
                </p>
              )}
              {isMonthlyTemplate && (
                <p className="report-period__hint">
                  월간 보고서는 선택한 월의 전체 데이터를 조회합니다.
                </p>
              )}
              {periodError && (
                <p className="report-period__error">{periodError}</p>
              )}
              {!selectedInstanceId && (
                <p className="report-period__error">인스턴스를 선택해주세요.</p>
              )}
            </div>

            {/* 포함할 메트릭 */}
            <div className="report-section__block">
              <div className="report-section__block-title">포함할 메트릭</div>
              <div className="report-metrics">
                {METRICS.map((metric) => (
                  <button
                    key={metric.id}
                    type="button"
                    className={`report-metric-chip report-metric-chip--${
                      metric.id
                    } ${
                      selectedMetrics.includes(metric.id)
                        ? "report-metric-chip--active"
                        : ""
                    }`}
                    onClick={() => handleToggleMetric(metric.id)}
                  >
                    <span className="report-metric-chip__dot" />
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 보고서 구성 */}
            <div className="report-section__block">
              <div className="report-section__block-title">구성</div>
              <div className="report-sections">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`report-section-card ${
                      selectedSections.includes(section.id)
                        ? "report-section-card--active"
                        : ""
                    }`}
                    onClick={() => handleToggleSection(section.id)}
                    title={section.tooltip}
                  >
                    <div className="report-section-card__icon">
                      {section.id === "summary" && "📊"}
                      {section.id === "charts" && "📈"}
                      {section.id === "table" && "📋"}
                    </div>
                    <div className="report-section-card__title">
                      {section.label}
                    </div>
                    <div className="report-section-card__desc">
                      {section.tooltip}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 오른쪽: 미리보기 영역 */}
        <div className="report-page__right">
          <section className="report-preview">
            <div className="report-preview__header">
              <div className="report-preview__header-icon">📄</div>
              <div>
                <h2 className="report-preview__title">미리보기</h2>
                <p className="report-preview__subtitle">
                  생성될 보고서의 구성을 확인하세요.
                </p>
              </div>
            </div>

            <div className="report-preview__card">
              {/* 템플릿 */}
              <div className="report-preview__row">
                <div className="report-preview__row-icon">📄</div>
                <div className="report-preview__row-body">
                  <span className="report-preview__label">템플릿</span>
                  <span className="report-preview__value">
                    {selectedTemplateInfo?.title ?? "선택해주세요"}
                  </span>
                </div>
              </div>

              {/* 포함 메트릭 */}
              <div className="report-preview__row">
                <div className="report-preview__row-icon">🎯</div>
                <div className="report-preview__row-body">
                  <span className="report-preview__label">포함 메트릭</span>
                  <div className="report-preview__tags">
                    {selectedMetrics.length > 0 ? (
                      METRICS.filter((m) => selectedMetrics.includes(m.id)).map(
                        (m) => (
                          <span key={m.id} className="report-preview__tag">
                            {m.label}
                          </span>
                        )
                      )
                    ) : (
                      <span className="report-preview__value">
                        선택된 메트릭이 없습니다.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 보고서 구성요소 */}
              <div className="report-preview__row">
                <div className="report-preview__row-body">
                  <span className="report-preview__label">보고서 구성요소</span>
                  <ul className="report-preview__checklist">
                    {SECTIONS.filter((s) =>
                      selectedSections.includes(s.id)
                    ).map((section) => (
                      <li
                        key={section.id}
                        className="report-preview__checkitem"
                      >
                        <span className="report-preview__checkbox">✓</span>
                        <span>{section.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 기간 */}
              <div className="report-preview__row report-preview__row--period">
                <div className="report-preview__row-body">
                  <span className="report-preview__label">기간</span>
                  <span className="report-preview__value">
                    {!startDate
                      ? "보고서 생성을 위해 기간을 선택해주세요."
                      : isSingleDateTemplate
                      ? startDate
                      : isWeeklyTemplate
                      ? endDate
                        ? `${startDate} ~ ${endDate}`
                        : "종료일을 선택해주세요."
                      : isMonthlyTemplate
                      ? (() => {
                          // YYYY-MM 형식인 경우 첫날로 변환
                          const monthDate =
                            startDate.length === 7
                              ? `${startDate}-01`
                              : startDate;
                          const start = new Date(monthDate);
                          const lastDay = new Date(
                            start.getFullYear(),
                            start.getMonth() + 1,
                            0
                          );
                          return `${monthDate} ~ ${
                            lastDay.toISOString().split("T")[0]
                          }`;
                        })()
                      : endDate
                      ? `${startDate} ~ ${endDate}`
                      : `${startDate} ~ (종료일 미선택)`}
                  </span>
                </div>
              </div>

              <div className="report-preview__row report-preview__row--hint">
                선택한 기간과 메트릭 기준으로, 요약·차트·데이터 테이블이 구성된
                보고서가 생성됩니다. 생성 버튼 클릭 후 다운로드 기능과 연동할 수
                있습니다.
              </div>
            </div>

            <div className="report-preview__footer">
              {error && (
                <div
                  className="report-preview__error"
                  style={{
                    marginBottom: "12px",
                    color: "red",
                    fontSize: "14px",
                  }}
                >
                  {error}
                </div>
              )}
              <Button
                text={isGenerating ? "생성 중..." : "생성하기"}
                size="md"
                variant="primary"
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating || !selectedInstanceId}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Improvement;
