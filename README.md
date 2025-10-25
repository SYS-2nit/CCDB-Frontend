## 📁 디렉토리 구조

src/
├── assets/ # 로고, 아이콘 등 정적 리소스
│ ├── general/
│ ├── header/
│ └── sidebar/
│
├── components/ # 공통 UI 컴포넌트
│ ├── Header/
│ └── Sidebar/
│
├── layouts/ # 페이지 공통 레이아웃
│ ├── Layout.tsx
│ └── Layout.scss
│
├── pages/ # 주요 페이지 단위 컴포넌트
│ ├── Alert/
│ ├── Analysis/
│ ├── Dashboard/
│ ├── Database/
│ ├── Improvement/
│ ├── Setting/
│ └── SQL/
│
├── styles/ # 전역 스타일 및 디자인 토큰
│ ├── _variables.scss
│ ├── _mixins.scss
│ ├── _themes.scss
│ ├── _typography.scss
│ └── _global.scss
│
├── App.tsx # 루트 컴포넌트
├── main.tsx # 엔트리 포인트
└── index.html # HTML 템플릿