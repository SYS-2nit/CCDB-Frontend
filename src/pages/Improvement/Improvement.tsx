import React, { useMemo, useState } from "react";
import "./Improvement.scss";
import DateInput from "@/components/Input/DateInput";
import Button from "@/components/Button/Button";

type ReportTemplate = "daily" | "weekly" | "monthly" | "performance";

type MetricKey = "CPU" | "MEMORY" | "SESSION" | "IO" | "STORAGE" | "PERF_IMPROVE";

type SectionKey = "summary" | "charts" | "table";

const TEMPLATES: {
  id: ReportTemplate;
  title: string;
  description: string;
}[] = [
  {
    id: "daily",
    title: "일일 보고서",
    description: "하루 동안의 DB 성능 지표를 요약한 보고서",
  },
  {
    id: "weekly",
    title: "주간 보고서",
    description: "일간 성능 추이와 분석을 포함한 주간 리포트",
  },
  {
    id: "monthly",
    title: "월간 보고서",
    description: "월간 종합 분석 및 개선 제안을 포함한 보고서",
  },
  {
    id: "performance",
    title: "성능 분석",
    description: "상세한 성능 메트릭 및 병목 지점 분석",
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

  const handleToggleMetric = (metric: MetricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric],
    );
  };

  const handleToggleSection = (section: SectionKey) => {
    setSelectedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section],
    );
  };

  const isSingleDateTemplate = template === "daily";

  const periodError = useMemo(() => {
    if (!startDate) return "";
    if (!isSingleDateTemplate && !endDate) return "";

    const start = new Date(startDate);
    const end = isSingleDateTemplate ? start : new Date(endDate);
    if (end < start) return "종료일은 시작일 이후여야 합니다.";

    if (template === "weekly") {
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 28) {
        return "주간 보고서는 최대 4주까지만 선택할 수 있습니다.";
      }
    }
    return "";
  }, [startDate, endDate, template, isSingleDateTemplate]);

  const canGenerate = useMemo(() => {
    if (!startDate) return false;
    if (!isSingleDateTemplate && !endDate) return false;
    if (periodError) return false;
    if (selectedMetrics.length === 0) return false;
    if (selectedSections.length === 0) return false;
    return true;
  }, [
    startDate,
    endDate,
    isSingleDateTemplate,
    periodError,
    selectedMetrics,
    selectedSections,
  ]);

  const handleGenerate = () => {
    if (!canGenerate) return;
    // 실제 다운로드/생성 로직은 백엔드 API 설계 후 연동 예정
    // 지금은 사용자에게 구성 내용을 알려주는 정도로만 처리
    // eslint-disable-next-line no-alert
    alert("보고서 생성 요청이 준비되었습니다. (추후 다운로드 기능 연동 예정)");
  };

  const selectedTemplateInfo = TEMPLATES.find((t) => t.id === template);

  return (
    <div className="report-page">
      {/* 상단 타이틀 */}
      <div className="report-page__header">
        <div>
          <h1 className="report-page__title">보고서 생성</h1>
          <p className="report-page__subtitle">
            DB 모니터링 데이터를 종합하여 보고서를 생성합니다.
          </p>
        </div>
      </div>

      <div className="report-page__layout">
        {/* 왼쪽: 설정 영역 */}
        <div className="report-page__left">
          {/* 보고서 템플릿 선택 */}
          <section className="report-section">
            <h2 className="report-section__title">보고서 템플릿 선택</h2>
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
                    {t.id === "performance" && "⚡"}
                  </div>
                  <div className="report-template-card__body">
                    <div className="report-template-card__title">
                      {t.title}
                    </div>
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
            <h2 className="report-section__title">보고서 설정</h2>

            {/* 기간 선택 */}
            <div className="report-section__block">
              <div className="report-section__block-title">보고서 기간</div>
              <div className="report-period">
                <div className="report-period__field">
                  <span className="report-period__label">
                    {isSingleDateTemplate ? "일자" : "시작일"}
                  </span>
                  <DateInput
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                {!isSingleDateTemplate && (
                  <div className="report-period__field">
                    <span className="report-period__label">종료일</span>
                    <DateInput
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
              {template === "weekly" && (
                <p className="report-period__hint">
                  주간 보고서는 최대 4주까지 선택할 수 있습니다.
                </p>
              )}
              {periodError && (
                <p className="report-period__error">{periodError}</p>
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
                    className={`report-metric-chip report-metric-chip--${metric.id} ${
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
              <div className="report-section__block-title">보고서 구성</div>
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
                <h2 className="report-preview__title">보고서 미리보기</h2>
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
                          <span
                            key={m.id}
                            className="report-preview__tag"
                          >
                            {m.label}
                          </span>
                        ),
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
                  <span className="report-preview__label">
                    보고서 구성요소
                  </span>
                  <ul className="report-preview__checklist">
                    {SECTIONS.filter((s) =>
                      selectedSections.includes(s.id),
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
              <Button
                text="생성하기"
                size="md"
                variant="primary"
                onClick={handleGenerate}
                disabled={!canGenerate}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Improvement;
