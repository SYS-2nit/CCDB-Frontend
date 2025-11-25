import BedgeSuccessIcon from "@/assets/header/bedge-success.svg";
import TimeSection from "./TimeSection";
import Select from "@/components/Select/Select";
import { useInstances } from "../hooks/useInstances";
import { useDbInfo } from "../hooks/useDbInfo";
import { useLocation } from "react-router-dom";
import { scenarioApi } from "@/components/Scenario/scenarioApi";
import { useDashboardContext } from "@/state/DashboardContext";

// DB + Instance + Time
const HeaderLeft = () => {
  const location = useLocation();

  // "/dashboard" 라는 경로일 때만 노출
  const showTimeSection = location.pathname.startsWith("/dashboard");

  const { dbName } = useDbInfo();
  const { instances, selectedInstanceId, handleInstanceChange } =
    useInstances();
  const { selectedInstanceId: contextInstanceId } = useDashboardContext();
  const instanceId = selectedInstanceId ?? contextInstanceId;

  // 체크 아이콘 클릭 시 DB CPU 비율/포화도 증가 시나리오 실행
  const handleCheckIconClick = async () => {
    if (!instanceId) {
      console.warn("인스턴스가 선택되지 않았습니다.");
      return;
    }

    try {
      // 시나리오 목록 가져오기
      const scenarios = await scenarioApi.list();
      
      // "DB CPU 비율/포화도 증가" 시나리오 찾기
      const targetScenario = scenarios.find(
        (s) => s.title.includes("DB CPU") || s.summary.includes("DB CPU")
      );

      if (!targetScenario) {
        console.warn("DB CPU 비율/포화도 증가 시나리오를 찾을 수 없습니다.");
        return;
      }

      // 시나리오 실행 (기본 duration: 90초)
      await scenarioApi.run({
        scenarioIds: [targetScenario.id],
        durationSec: 30,
        instanceId: instanceId,
      });

      console.log("DB CPU 비율/포화도 증가 시나리오가 시작되었습니다.");
    } catch (error) {
      console.error("시나리오 실행 실패:", error);
    }
  };

  return (
    <div className="header__left">
      <div className="header__dbinfo">
        <img 
          src={BedgeSuccessIcon} 
          alt="DB" 
          onClick={handleCheckIconClick}
          style={{ cursor: "pointer" }}
        />
        <div className="header__dbname">{dbName ?? "DB Name"}</div>
      </div>

      <Select
        placeholder="인스턴스 선택"
        size="sm"
        options={instances.map((i) => ({
          label: i.label,
          value: String(i.id),
        }))}
        value={selectedInstanceId !== null ? String(selectedInstanceId) : ""}
        onChange={handleInstanceChange}
      />

      {showTimeSection && <TimeSection />}
    </div>
  );
};

export default HeaderLeft;
