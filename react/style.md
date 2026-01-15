[Role] 너는 숙련된 리액트(React) 프론트엔드 개발자이자 UI/UX 디자이너야. 헬스장 코치 전용 출석 관리 앱을 제작해줘.

[Tech Stack & Layout]

Framework: React.js (Tailwind CSS 활용)

Responsive: 모바일 퍼스트(Mobile-first) 디자인을 적용하되, 데스크탑에서도 깨지지 않는 반응형 레이아웃으로 제작해줘.

UI Library: Lucide-react(아이콘), Recharts(통계 그래프)를 사용해줘.

[Core Features]

출석 체크 페이지: 코치가 '고객명'을 검색/선택하고, '방문 시간'을 설정하여 출석 버튼을 누르는 직관적인 UI.

대시보드: 오늘 방문자 수, 이번 주 방문 추이 그래프, 현재 실시간 센터 인원을 요약해서 보여줘.

방문 일정 달력: 날짜별로 고객 방문 리스트를 확인할 수 있는 캘린더 뷰.

데이터 내보내기: 현재 필터링된 출석 데이터를 엑셀로 다운로드할 수 있는 버튼(UI만 구현).

[Design Concept]

Theme: 'Clean & Professional'. 화이트 배경에 신뢰감을 주는 딥블루(Deep Blue)를 포인트 컬러로 사용해줘.

Components: 각 섹션은 둥근 모서리(rounded-lg)와 은은한 그림자(soft shadow)가 들어간 카드 형태로 구성해줘.

Usability: 버튼은 모바일에서 터치하기 쉽도록 충분한 크기(최소 44px)를 확보해줘.

[Mock Data]

앱을 바로 확인할 수 있도록 가상의 고객 명단 10명과 최근 7일간의 출석 통계 데이터를 포함해서 화면을 렌더링해줘.

2. 세부 디자인 기준 (Style Guide)
AI가 더 정교한 UI를 만들도록 추가할 수 있는 세부 지침입니다.

Color Palette:

Primary: #1E40AF (Deep Blue) - 주요 버튼 및 활성 상태

Success: #10B981 (Emerald) - 출석 완료 표시

Background: #F9FAFB (Light Gray) - 전체 배경

Typography:

Pretendard 또는 시스템 폰트 산세리프(Sans-serif)를 사용하여 가독성 극대화.

중요 지표(방문 인원 수 등)는 Bold 처리하여 시각적 위계 부여.

Interactions:

버튼 클릭 시 Hover 및 Active 효과 포함.

출석 체크 성공 시 하단에 간단한 토스트 메시지(Toast Notification) UI 구현.

3. 작업 시 팁 (안티그라비티 활용법)
단계별 요청: 한 번에 모든 기능을 요청하기보다 "먼저 출석 체크 기능과 목업 데이터가 포함된 메인 대시보드 화면을 만들어줘"라고 요청한 뒤, "여기에 엑셀 다운로드 버튼과 날짜별 필터를 추가해줘"라고 수정해 나가는 것이 정확도가 높습니다.

모바일 미리보기: 결과물이 나오면 안티그라비티 내 미리보기 창의 크기를 모바일 사이즈로 줄여서 햄버거 메뉴나 버튼 배치가 적절한지 확인하세요.