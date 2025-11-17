/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

export interface TrendPoint {
  time: any;
  label: string;
  value: number;
}

export interface SqlDetailData {
  date: ReactNode;
  id: number;
  instanceId: number;
  sqlId: string;
  sqlText: string;

  totalElapsed: number;
  totalCpu: number;
  totalExec: number;
  totalBuffer: number;
  totalDisk: number;
  totalWait: number;

  avgElapsed: number;

  waitTimeUsDelta: number;
  waitUserIoUsDelta: number;
  waitConcurrencyUsDelta: number;
  waitApplicationUsDelta: number;
  waitClusterUsDelta: number;
  waitOtherUsDelta: number;

  elapsedTrend: TrendPoint[];
  cpuTrend: TrendPoint[];
  execTrend: TrendPoint[];
  bufferTrend: TrendPoint[];
  diskTrend: TrendPoint[];
  waitTrend: TrendPoint[];

  rank: number;
  ratio: number;
}
