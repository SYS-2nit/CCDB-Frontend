# 이벤트 기록 PDF 다운로드 - 백엔드 작업 필요 사항

## API 엔드포인트

```
POST /api/alerts/events/export-pdf
```

## 요청 본문 (Request Body)

```json
{
  "memberId": 3,
  "filters": {
    "category": "CPU",              // 선택사항: CPU, MEMORY, SESSION, IO, STORAGE
    "startDate": "2025-01-19",      // 선택사항: YYYY-MM-DD 형식
    "endDate": "2025-01-20",        // 선택사항: YYYY-MM-DD 형식
    "severity": 1,                  // 선택사항: 1(주의), 2(위험), 3(치명)
    "status": "PENDING",            // 선택사항: PENDING, CLOSED
    "readStatus": "unread"          // 선택사항: "all", "read", "unread"
  },
  "includeGraphs": true,            // 그래프 포함 여부
  "graphTimeRange": 5               // 발생 시간 전후 분 단위 (기본 5분)
}
```

## 응답

- Content-Type: `application/pdf`
- Response Body: PDF 파일 바이너리 (Blob)

## PDF 구성 요구사항

### 1. 표지 페이지

#### 포함 내용:
- **보고서 제목**: "이벤트 기록 보고서" (큰 글씨, 중앙 정렬)
- **생성 일시**: PDF 생성 시점 (예: "2025-01-19 22:59:35")
- **필터 조건 요약**:
  - 조회 기간: `{시작일} ~ {종료일}` (선택 안했을 경우 조회된 데이터의 최소/최대 날짜 자동 표시)
  - 카테고리: 선택된 카테고리 또는 "전체"
  - 위험도: 선택된 위험도 또는 "전체"
  - 상태: 선택된 상태 또는 "전체"
  - 읽음/안읽음: 선택된 상태 또는 "전체"
- **총 건수**: `{totalElements}건`

### 2. 요약 통계 페이지

#### 포함 내용:
- **심각도별 건수**:
  - 주의: X건
  - 위험: Y건
  - 치명: Z건
  - 차트: 파이 차트 또는 바 차트 (선택)
- **카테고리별 건수**:
  - CPU: X건
  - Memory: Y건
  - Session: Z건
  - I/O: W건
  - Storage: V건
  - 차트: 파이 차트 또는 바 차트 (선택)
- **상태별 건수**:
  - 미처리: X건
  - 처리 완료: Y건
  - 차트: 파이 차트 또는 바 차트 (선택)
- **시간대별 발생 분포** (선택):
  - 시간대별 알림 발생 건수 그래프 (선형 차트)

### 3. 이벤트 상세 페이지 (각 이벤트마다)

#### 3.1 기본 정보 테이블

| 항목 | 값 |
|------|-----|
| 번호 | {순번} |
| 발생 시간 | {YYYY-MM-DD HH:mm:ss} |
| 심각도 | {주의/위험/치명} (색상 표시) |
| 카테고리 | {CPU/Memory/Session/I/O/Storage} |
| 상태 | {미처리/처리 완료} |
| 읽음 여부 | {읽음/안읽음} |
| 인스턴스 ID | {instanceId} |

#### 3.2 메시지

- 알림 메시지 전체 텍스트 표시
- 예: "PGA 사용률: PGA 사용률이/가 80.89%로 치명 임계값(51.00%)을 초과했습니다."

#### 3.3 알림 발생 그래프 (includeGraphs가 true일 경우)

- **그래프 정보**:
  - `alertEventId`를 통해 `AlertEvent` 조회
  - `AlertEvent.graphId`를 통해 그래프 정보 조회
  - 발생 시간(`createdAt`) 전후 `graphTimeRange` 분 범위의 데이터 조회
  - 예: 발생 시간이 2025-01-19 22:30:00이고 graphTimeRange가 5분이면
    - 시작: 2025-01-19 22:25:00
    - 종료: 2025-01-19 22:35:00
- **그래프 표시**:
  - 그래프 제목: `graphName`
  - Y축 단위 표시
  - 발생 시간 지점에 마커 표시 (수직선 또는 특별한 마커)
  - 그래프 이미지로 변환하여 PDF에 삽입

#### 3.4 임계값 정보

| 항목 | 값 |
|------|-----|
| 주의 임계값 | {warning} {단위} |
| 위험 임계값 | {danger} {단위} |
| 치명 임계값 | {critical} {단위} |
| 발생 시점 실제 값 | {currentValue} {단위} |

#### 3.5 처리 내역 (있는 경우)

- 처리 내역이 있으면 표시
- `fetchEventHistories(eventId)`로 조회한 데이터 표시
- 표 형식:
  | 처리 시간 | 처리자 | 처리 내용 |
  |----------|--------|----------|
  | {createdAt} | {memberId} | {content} |

#### 3.6 메트릭 상세 정보

| 항목 | 값 |
|------|-----|
| 메트릭 이름 | {metricName} |
| 메트릭 키 | {metricKey} |
| 임계값 포맷 | {PERCENT/MS/MBPS/COUNT} |

#### 3.7 인스턴스 정보

- `instanceId`를 통해 인스턴스 정보 조회
- 표 형식:
  | 항목 | 값 |
  |------|-----|
  | 인스턴스 ID | {instanceId} |
  | 인스턴스 이름 (SID) | {instance.sid} |
  | 서버 이름 | {instance.serverName} |
  | IP 주소 | {instance.ip} |
  | 포트 | {instance.port} |

#### 3.8 알림 정책 정보

- `alertEventId`를 통해 `AlertEvent` 조회
- `AlertEvent.policyId`를 통해 `AlertPolicy` 조회
- 표 형식:
  | 항목 | 값 |
  |------|-----|
  | 정책 이름 | {policy.name} |
  | 정책 설명 | {policy.description} |
  | 알림 규칙 이름 | {alertEvent.name} |

### 4. 부록 (선택)

- 전체 인스턴스 목록 (참고용)
- 전체 알림 정책 목록 (참고용)

## 데이터 조회 필요 API

### 1. 필터링된 이벤트 목록 조회
- 기존 `GET /api/alerts/events` API 활용
- 필터 조건에 맞는 전체 데이터 조회 (페이지네이션 무시)
- `size` 파라미터를 매우 큰 값으로 설정하거나, 별도의 전체 조회 API 제공

### 2. AlertEvent 조회
- `GET /api/alerts/events/{alertEventId}` 또는
- `GET /api/alerts/rules/{alertEventId}`

### 3. 그래프 데이터 조회
- `GET /api/history?instanceId={instanceId}&graphId={graphId}&start={start}&end={end}`
- 또는 대시보드 그래프 데이터 조회 API 활용

### 4. 인스턴스 정보 조회
- `GET /api/databases/{dbId}/instances/{instanceId}`

### 5. 처리 내역 조회
- 기존 `GET /api/alerts/events/{eventId}/histories` API 활용

### 6. AlertPolicy 조회
- `GET /api/alerts/policies/{policyId}`

## PDF 생성 라이브러리 추천

### Java
- **iText** (상용 라이선스 주의)
- **Apache PDFBox** (오픈소스, 추천)
- **OpenPDF** (오픈소스)

### Spring Boot 통합
- PDFBox를 사용한 PDF 생성 서비스 구현
- 차트는 **JFreeChart** 또는 **Apache ECharts** (Java 버전) 사용

## 구현 순서

1. **필터링된 이벤트 목록 조회**
   - 필터 조건에 맞는 전체 이벤트 조회

2. **각 이벤트별 상세 정보 수집**
   - AlertEvent 정보
   - 인스턴스 정보
   - AlertPolicy 정보
   - 처리 내역
   - 그래프 데이터 (includeGraphs가 true일 경우)

3. **통계 계산**
   - 심각도별/카테고리별/상태별 건수
   - 시간대별 분포 (선택)

4. **PDF 생성**
   - 표지 페이지 생성
   - 요약 통계 페이지 생성
   - 각 이벤트별 상세 페이지 생성
   - 그래프 이미지 생성 및 삽입

5. **PDF 반환**
   - Blob으로 반환

## 주의사항

1. **대량 데이터 처리**
   - 이벤트가 수천 건일 경우 메모리 사용량 주의
   - 스트리밍 방식으로 PDF 생성 고려

2. **그래프 이미지 생성**
   - 차트를 이미지로 변환하는 과정에서 시간이 소요될 수 있음
   - 비동기 처리 또는 캐싱 고려

3. **에러 처리**
   - 일부 이벤트의 데이터 조회 실패 시에도 나머지 이벤트는 처리
   - 에러 로그 기록

4. **파일명**
   - 프론트엔드에서 파일명을 생성하지만, 백엔드에서도 Content-Disposition 헤더로 파일명 제공 가능

