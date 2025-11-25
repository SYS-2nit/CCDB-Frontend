import React from "react";
import "./Analysis.scss";
import type { ScenarioId, ScenarioMeta } from "@/components/Scenario/types";
import { useToast } from "@/components/Scenario/useToast";
import ScenarioControls from "@/components/Scenario/ScenarioControls";
import ScenarioDetailDrawer from "@/components/Scenario/ScenarioDetailDrawer";
import ScenarioListItem from "@/components/Scenario/ScenarioListItem";
import { scenarioApi } from "@/components/Scenario/scenarioApi";
import { useDashboardContext } from "@/state/DashboardContext";

const DURATIONS = [30, 60, 90, 120, 150, 180];

const Analysis: React.FC = () => {
  const [scenarios, setScenarios] = React.useState<ScenarioMeta[]>([]);
  const [selected, setSelected] = React.useState<
    Partial<Record<ScenarioId, boolean>>
  >({});
  const [duration, setDuration] = React.useState<number>(90);
  const [running, setRunning] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<{
    current?: ScenarioId;
    remain?: number;
    loop?: number;
  }>({});
  const [detail, setDetail] = React.useState<ScenarioMeta | null>(null);
  const toast = useToast();
  const { selectedInstanceId } = useDashboardContext();

  React.useEffect(() => {
    if (!selectedInstanceId) return;
    
    scenarioApi
      .list()
      .then((list) => {
        setScenarios(list);
        const init: Partial<Record<ScenarioId, boolean>> = {};
        list.forEach((s) => (init[s.id] = false));
        setSelected(init);
      })
      .catch(() => {
        toast.show("시나리오 목록 조회 실패", "error");
      });
  }, [toast, selectedInstanceId]);

  // 상태 조회 (페이지 접속 시 한 번만)
  const hasFetchedStatusRef = React.useRef(false);
  React.useEffect(() => {
    if (!selectedInstanceId || hasFetchedStatusRef.current) return;
    
    const fetchStatus = async () => {
      try {
        const st = await scenarioApi.status();
        setRunning(st.running);
        setStatus({
          current: st.currentScenarioId,
          remain: st.remainingSec,
          loop: st.loopCount,
        });
        hasFetchedStatusRef.current = true;
      } catch (e) {
        toast.show(`진단 상태 조회 실패: ${e}`, "error");
      }
    };
    fetchStatus();
  }, [selectedInstanceId]);
  
  // selectedInstanceId가 변경되면 ref 초기화
  React.useEffect(() => {
    hasFetchedStatusRef.current = false;
  }, [selectedInstanceId]);

  const toggle = (id: ScenarioId) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const start = async () => {
    if (!selectedInstanceId) {
      alert("인스턴스를 선택해주세요.");
      return;
    }
    
    const chosen = scenarios.filter((s) => selected[s.id]).map((s) => s.id);
    if (chosen.length === 0) {
      alert("진단을 1개 이상 선택하세요.");
      return;
    }

    if (chosen.length > 1) {
      alert("진단은 한 번에 1개만 선택할 수 있습니다.");
      return;
    }
    setBusy(true);
    try {
      await scenarioApi.run({ 
        scenarioIds: chosen, 
        durationSec: duration,
        instanceId: selectedInstanceId 
      });
      toast.show("진단을 시작했습니다.", "success");
    } catch (e) {
      alert(`진단을 시작하는 데 실패하였습니다.: ${e}`);
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    setBusy(true);
    try {
      await scenarioApi.stop();
      toast.show("진단을 중지했습니다.", "success");
    } catch (e) {
      toast.show(`진단 중지 실패: ${e}`, "error");
    } finally {
      setBusy(false);
    }
  };

  if (!selectedInstanceId) {
    return (
      <div className="scenario-page">
        <div className="scenario-page__status">인스턴스를 선택해주세요.</div>
      </div>
    );
  }

  return (
    <div className="scenario-page">
      {/* 필터 (추가 설정 select + 진행 button) */}
      <ScenarioControls
        durations={DURATIONS}
        value={duration}
        onChange={(v) => !busy && !running && setDuration(v)}
        running={running}
        onStart={!busy ? start : () => {}}
        onStop={!busy ? stop : () => {}}
        status={status}
        busy={busy}
      />

      {/* 결과 */}
      <ScenarioDetailDrawer meta={detail} onClose={() => setDetail(null)} />

      {/* 진단 목록 */}
      <div className="scenario-page__list">
        {scenarios.map((s) => (
          <ScenarioListItem
            key={s.id}
            meta={s}
            checked={!!selected[s.id]}
            onToggle={() => toggle(s.id)}
            onOpenDetail={() => setDetail(s)}
            running={running && status.current === s.id}
            status={status.current === s.id ? status : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default Analysis;
