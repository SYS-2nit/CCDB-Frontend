import LineChart from "@/components/Chart/LineChart";
import GaugeChart from "@/components/Chart/GaugeChart";

// I/O 탭 전용 차트 렌더러
export const renderIOChart = (title: string) => {
  if (title.includes("???")) return <GaugeChart />;

  // 기본값
  return <LineChart />;
};
