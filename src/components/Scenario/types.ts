// src/components/Scenario/types.ts
// ... 기존 코드 ...

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export type ScenarioId = number;

export interface ScenarioMeta {
  id: ScenarioId;
  title: string;
  summary: string;
  affectedDashboards: string[];
  reproduction: string;
}

export interface RunRequest {
  scenarioIds: ScenarioId[];
  durationSec: number;
}

export interface RunStatus {
  running: boolean;
  currentScenarioId?: ScenarioId;
  scenarioQueue: ScenarioId[];
  remainingSec?: number;
  loopCount?: number;
}

export interface DiagnosisConfig {
  id: string;
  name: string;
  scenarios: ScenarioConfig[];
}

export interface ScenarioConfig {
  id: string;
  name: string;
  inputFields: InputField[];
  resultCategories: ResultCategory[];
}

export type ResultCategory = 'demand' | 'symptoms' | 'resources' | 'causes';

export interface InputField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  defaultValue?: string | number;
  options?: { label: string; value: string }[];
}

// 진단별 설정 데이터
export const DIAGNOSIS_CONFIGS: DiagnosisConfig[] = [
  {
    id: 'diagnosis1',
    name: '선착순 쿠폰 발행',
    scenarios: [
      {
        id: 'coupon-issue',
        name: '선착순 쿠폰 발행',
        inputFields: [
          {
            name: 'apiVersion',
            label: 'API 버전',
            type: 'select',
            options: [
              { label: 'V1 - DB Lock (프로시저)', value: 'v1' },
              { label: 'V2 - Redis Lock', value: 'v2' },
              { label: 'V3 - Kafka 비동기', value: 'v3' },
            ],
          },
          {
            name: 'threadCount',
            label: '동시 스레드 수',
            type: 'number',
            defaultValue: 100,
          },
          {
            name: 'totalRequests',
            label: '총 요청 수',
            type: 'number',
            defaultValue: 1000,
          },
        ],
        resultCategories: ['demand', 'symptoms', 'resources'],
      },
    ],
  },
  {
    id: 'diagnosis2',
    name: '데이터베이스 동시성',
    scenarios: [
      {
        id: 'db-contention',
        name: '잠금 경합 테스트',
        inputFields: [
          {
            name: 'contentionLevel',
            label: '경합 수준 (1-10)',
            type: 'number',
            defaultValue: 7,
          },
          {
            name: 'commitDelay',
            label: '커밋 지연 (ms)',
            type: 'number',
            defaultValue: 3000,
          },
          {
            name: 'duration',
            label: '테스트 지속 시간 (초)',
            type: 'number',
            defaultValue: 60,
          },
        ],
        resultCategories: ['symptoms', 'resources', 'causes'],
      },
    ],
  },
  // ... 진단 3, 4, 5 추가
];