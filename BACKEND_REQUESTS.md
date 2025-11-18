# 백엔드 요청사항

## 알림 이벤트 설정 페이지 API 연동을 위한 백엔드 요청사항

### 1. 그래프별 메트릭 목록 조회 API

**현재 상황:**
- 프론트엔드에서 그래프를 선택하면 해당 그래프의 메트릭 목록을 조회해야 합니다.
- 현재는 더미 데이터를 사용하고 있습니다.

**요청 API:**
```
GET /api/graphs/{graphId}/metrics
```

**응답 형식:**
```json
{
  "code": 200,
  "message": "성공",
  "data": [
    {
      "key": "cpu_usage",
      "name": "CPU 사용률",
      "thresholdFormat": "PERCENT",  // PERCENT | MS | MBPS | COUNT
      "description": "CPU 사용률 메트릭"
    },
    {
      "key": "memory_usage",
      "name": "메모리 사용률",
      "thresholdFormat": "PERCENT",
      "description": "메모리 사용률 메트릭"
    }
  ]
}
```

**필요한 정보:**
- `metricKey`: 메트릭 식별자 (백엔드에서 사용)
- `metricName`: 메트릭 표시 이름
- `thresholdFormat`: 해당 메트릭의 임계값 포맷 (PERCENT, MS, MBPS, COUNT)
- `description`: 메트릭 설명 (선택사항)

---

### 2. 정책 생성 시 여러 이벤트 함께 생성

**현재 상황:**
- 프론트엔드에서 정책 하나에 여러 이벤트를 추가하고 저장합니다.
- `AlertPolicyCreateRequest`에 `events?: AlertEventCreateRequest[]`가 있으므로, 정책 생성 시 이벤트를 함께 생성할 수 있는지 확인이 필요합니다.

**확인 사항:**
- `POST /api/alerts/policies` 호출 시 `events` 배열을 함께 전송하면 정책과 이벤트가 모두 생성되는지?
- 또는 정책 생성 후 각 이벤트를 개별적으로 `POST /api/alerts/rules`로 생성해야 하는지?

**요청 형식:**
```json
{
  "memberId": 3,
  "instanceId": 1,
  "name": "정책 이름",
  "description": "정책 설명",
  "isActive": true,
  "events": [
    {
      "policyId": 0,  // 정책 생성 전이므로 0 또는 null?
      "category": "CPU",
      "name": "이벤트 이름",
      "graphId": 1,
      "metricKey": "cpu_usage",
      "metricName": "CPU 사용률",
      "thresholdFormat": "PERCENT",
      "warning": 70,
      "danger": 85,
      "critical": 95,
      "delayTime": "ONE_MINUTE",
      "days": 127,  // 비트마스크 (월~일: 1,2,4,8,16,32,64)
      "startTime": "09:00",
      "endTime": "18:00",
      "state": true,
      "isReverse": false
    }
  ]
}
```

---

### 3. 요일 비트마스크 변환

**현재 상황:**
- 프론트엔드에서 요일을 문자열 배열로 관리합니다: `["월", "화", "수", ...]`
- 백엔드에서는 비트마스크로 전송해야 합니다: `127` (모든 요일)

**변환 규칙:**
- 월: 1 (2^0)
- 화: 2 (2^1)
- 수: 4 (2^2)
- 목: 8 (2^3)
- 금: 16 (2^4)
- 토: 32 (2^5)
- 일: 64 (2^6)

**예시:**
- `["월", "화", "수"]` → `1 + 2 + 4 = 7`
- `["월", "화", "수", "목", "금", "토", "일"]` → `127`

**확인 사항:**
- 백엔드에서 요일 비트마스크 형식이 맞는지 확인 필요

---

### 4. 시간 형식

**현재 상황:**
- 프론트엔드에서 시간을 `"09:00"` 형식으로 입력받습니다.
- 백엔드에서 어떤 형식을 기대하는지 확인 필요 (예: `"09:00:00"`, `"HH:mm:ss"`)

**확인 사항:**
- `startTime`, `endTime` 필드의 형식 확인

---

### 5. 정책 생성 시 이벤트의 policyId 처리

**현재 상황:**
- 정책 생성 시 이벤트 배열을 함께 전송하는 경우, 이벤트의 `policyId`를 어떻게 설정해야 하는지 불명확합니다.

**확인 사항:**
- 정책 생성 전: `policyId: 0` 또는 `policyId: null`?
- 정책 생성 후: 백엔드에서 자동으로 설정되는지?

---

## 요약

1. **그래프별 메트릭 목록 조회 API** 필요
2. **정책 생성 시 여러 이벤트 함께 생성** 가능 여부 확인
3. **요일 비트마스크 변환 규칙** 확인
4. **시간 형식** 확인
5. **정책 생성 시 이벤트의 policyId 처리** 확인

