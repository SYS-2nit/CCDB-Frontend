# 🗄️ CCDB

React와 TypeScript를 활용한 데이터베이스 모니터링 및 관리 웹 서비스입니다.

## 📌 프로젝트 개요

> 사용자는 데이터베이스 인스턴스의 실시간 상태를 대시보드에서 시각적으로 확인하고, SQL 성능 분석 및 알림 이벤트를 관리할 수 있습니다.<br />
다양한 차트와 메트릭을 통해 데이터베이스의 CPU, 메모리, 세션, I/O, 스토리지 등의 상태를 모니터링할 수 있습니다.<br />
SQL 통계 및 TOP 쿼리 분석 기능을 제공하여 성능 최적화를 지원합니다.<br />

## 🗂️ 프로젝트 구성

### 주요 페이지

- **Dashboard**: 데이터베이스 인스턴스 모니터링 및 시각화
- **SQL 분석**: SQL 통계 및 TOP 쿼리 분석
- **Alert**: 알림 이벤트 설정 및 로그 관리
- **Analysis**: 데이터베이스 진단 및 분석
- **History**: 히스토리 조회
- **Improvement**: 성능 개선 제안
- **Setting**: 시스템 설정

## ⚒️ Tech Stack

### Frontend

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)

### 주요 라이브러리

- **ApexCharts**: 차트 시각화
- **React Three Fiber**: 3D 시각화
- **React Router**: 라우팅
- **Axios**: HTTP 클라이언트
- **React Grid Layout**: 드래그 앤 드롭 레이아웃

## 📁 디렉토리 구조

```
src/
├── api/                          # API 요청 관련 모듈
│   ├── Alert/                    # 알림 API
│   ├── Dashboard/                # 대시보드 API
│   ├── Databases/                 # 데이터베이스 API
│   ├── History/                  # 히스토리 API
│   ├── Member/                   # 회원 API
│   ├── Report/                   # 리포트 API
│   └── Sql/                      # SQL API
│
├── assets/                       # 이미지, 아이콘 등 정적 리소스
│   ├── general/                  # 공용 아이콘 및 이미지
│   ├── header/                   # 헤더 관련 아이콘
│   └── sidebar/                  # 사이드바 관련 아이콘
│
├── components/                   # 재사용 가능한 공통 UI 컴포넌트
│   ├── Button/                   # 버튼 컴포넌트
│   ├── Card/                     # 카드 컴포넌트 (차트 카드, 메트릭 카드 등)
│   ├── Chart/                    # 차트 컴포넌트 (Bar, Line, Donut, Gauge 등)
│   ├── Header/                   # 헤더 컴포넌트
│   ├── Input/                    # 입력 컴포넌트
│   ├── Modal/                    # 모달 컴포넌트
│   ├── Sidebar/                  # 사이드바 컴포넌트
│   └── ...
│
├── layouts/                      # 공통 레이아웃 구성
│   ├── Layout.tsx
│   └── Layout.scss
│
├── pages/                        # 주요 페이지
│   ├── Alert/                    # 알림 페이지
│   ├── Analysis/                 # 진단 페이지
│   ├── Dashboard/                # 대시보드 페이지
│   ├── History/                  # 히스토리 페이지
│   ├── Improvement/              # 개선 페이지
│   ├── Setting/                  # 설정 페이지
│   └── SQL/                      # SQL 분석 페이지
│
├── state/                        # 전역 상태 관리
│   ├── DashboardContext.tsx
│   └── useInstanceStore.ts
│
├── styles/                       # 전역 스타일
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _themes.scss
│   ├── _typography.scss
│   └── _global.scss
│
├── utils/                        # 유틸리티 함수
│   ├── numberFormatter.ts
│   └── timeFormatter.ts
│
├── App.tsx                       # 루트 컴포넌트
├── main.tsx                      # 엔트리 포인트
└── index.html                    # HTML 템플릿
```

## 🚀 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

## 🗣️ Communication

![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white)
![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)
![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

## 👩🏻‍💻 Developer

| 배지원 | 오수경 | 최영준 | 최온유 |
|:---:|:---:|:---:|:---:|
| <img src="https://github.com/github.png" width="150"> | <img src="https://github.com/SuKyeong2002.png" width="150"> | <img src="https://github.com/github.png" width="150"> | <img src="https://github.com/github.png" width="150"> |
