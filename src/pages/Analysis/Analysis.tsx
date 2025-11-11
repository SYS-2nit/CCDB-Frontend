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
  }, [toast]);

  // 상태 폴링
  React.useEffect(() => {
    let t: number | undefined;
    const poll = async () => {
      try {
        const st = await scenarioApi.status();
        setRunning(st.running);
        setStatus({
          current: st.currentScenarioId,
          remain: st.remainingSec,
          loop: st.loopCount,
        });
      } catch (e) {
        toast.show(`진단 시작 실패: ${e}`, "error");
      } finally {
        t = window.setTimeout(poll, 2000);
      }
    };
    poll();
    return () => {
      if (t !== undefined) {
        clearTimeout(t);
      }
    };
  }, []);

  const toggle = (id: ScenarioId) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const start = async () => {
    const chosen = scenarios.filter((s) => selected[s.id]).map((s) => s.id);
    if (chosen.length === 0) {
      toast.show("진단을 1개 이상 선택하세요.", "error");
      return;
    }
    if (!selectedInstanceId) {
      toast.show("인스턴스를 선택해주세요.", "error");
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
      toast.show(`진단 시작 실패: ${e}`, "error");
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

  return (
    <div className="scenario-page">
      <div className="scenario-page__header">
        <h2>진단</h2>
      </div>

      <div className="scenario-page__list">
        {scenarios.map((s) => (
          <ScenarioListItem
            key={s.id}
            meta={s}
            checked={!!selected[s.id]}
            onToggle={() => toggle(s.id)}
            onOpenDetail={() => setDetail(s)}
            running={running && status.current === s.id}
          />
        ))}
      </div>

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

      <ScenarioDetailDrawer meta={detail} onClose={() => setDetail(null)} />
    </div>
  );
};

export default Analysis;
