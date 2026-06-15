# 🎻 첼로 운지·계이름 학습 웹앱 — 바이브코딩 프롬프트 설계서

> **목적** : AI 코딩 도구(Claude Code · Cursor · v0 · Bolt · Lovable 등)에 그대로 붙여넣어, 첼로 운지법과 계이름 연주를 **가장 직관적이고 사용자 친화적으로** 배우는 웹앱을 단계적으로 완성하기 위한 설계서.
> **핵심 원칙** : 이 문서의 **부록 A 데이터(`celloData.ts`)를 "정확성의 단일 출처(Single Source of Truth)"로 사용**하게 한다. AI가 첼로 이론을 추측하지 못하게 막는 것이 이 문서의 가장 중요한 역할이다.
> **앱 임시 이름** : **지판온(Jipan-On)** — "지판(fingerboard) + 음(sound)". 자유롭게 바꿔도 된다.

---

## 0. 빠른 시작 (TL;DR)

1. **부록 A의 `celloData.ts`를 먼저 프로젝트에 넣는다.** (모든 음 정보의 기준)
2. **§2 마스터 프롬프트**를 AI에게 한 번 붙여넣어 프로젝트 골격을 만든다.
3. **§6 단계별 프롬프트(Phase 0 → 9)를 한 번에 하나씩** 붙여넣고, 각 단계의 **수용 기준 ✅** 을 통과시킨 뒤 다음으로 넘어간다.
4. 막히면 §8 **정확성 가드레일**을 다시 붙여넣어 교정한다.

> ⚠️ **한 번에 전부 시키지 말 것.** "전부 만들어줘"는 부정확하고 거대한 코드를 낳는다. **단계별로, 검증하며** 진행하는 것이 이 설계의 핵심이다.

---

## 1. 제품 개요

- **한 줄 정의** : 첼로 지판 위에서 *"이 계이름을 어느 줄·포지션·손가락으로 짚고, 어떤 소리가 나는가"* 를 **보고 · 듣고 · 눌러보고 · 퀴즈로 확인**하며 익히는 인터랙티브 학습 웹앱.
- **타깃 사용자** : 첼로 입문~초중급 독학자 및 학생, 그리고 보조 교구가 필요한 교사. (한국어 UI 기본)
- **사용자가 끝내 할 수 있어야 하는 일(Job)**
  1. 임의의 음(계이름/음이름)을 보면 → 지판에서 짚을 자리를 **즉시 떠올린다**.
  2. ½~4 포지션의 **손가락 모양(프레임)** 을 손에 익힌다.
  3. 계이름(도레미)·음이름(다라마/CDEFGAB)·실제 음높이를 **하나로 연결**한다.
- **성공 기준(북극성 지표)** : "음 → 자리" 퀴즈 정확도와 반응 속도가 학습 세션마다 향상된다.

### 설계 5대 원칙 (AI는 모든 화면에서 이 원칙을 지켜야 함)
1. **직관성** — 글보다 **지판 그림**이 먼저. 색·위치·애니메이션으로 의미를 전달한다.
2. **즉각 피드백** — 누르면 **0.1초 안에 소리 + 음이름**이 반응한다.
3. **정확성** — 모든 음/운지는 부록 A 데이터에서만 나온다. 하드코딩·추측 금지.
4. **모바일 우선** — 한 손 엄지로 조작 가능한 큰 터치 타깃. 가로 스크롤 허용.
5. **접근성** — 키보드 조작, ARIA, 색맹 안전(색+모양+텍스트 병행), `prefers-reduced-motion` 존중.

---

## 2. 마스터 프롬프트 (1회 붙여넣기)

> 아래 코드블록 전체를 복사해 AI 코딩 도구에 **맨 처음 한 번** 붙여넣으세요. (부록 A의 `celloData.ts` 내용도 함께 첨부하면 가장 좋습니다.)

```text
너는 시니어 프론트엔드 엔지니어이자 음악 교육 UX 디자이너다.
"지판온(Jipan-On)"이라는 첼로 운지·계이름 학습 웹앱을 함께 만든다.

[제품]
- 첼로 지판 위에서 "이 계이름을 어느 줄·포지션·손가락으로 짚고 어떤 소리가 나는지"를
  보고·듣고·눌러보고·퀴즈로 확인하며 익히는 인터랙티브 학습 웹앱.
- 타깃: 첼로 입문~초중급 한국어 사용자. UI 기본 언어는 한국어.

[기술 스택 — 정확히 이대로]
- Vite + React 18 + TypeScript
- Tailwind CSS (디자인 토큰은 CSS 변수 + tailwind theme 확장)
- 오디오: Tone.js (합성음 신디사이저. 저작권 있는 샘플 사용 금지)
- 전역 상태: zustand
- 애니메이션: framer-motion (가볍게, 과하지 않게)
- 지판/마커는 인라인 SVG로 그린다 (확대해도 깨지지 않게)
- 영속화: localStorage (설정·진도)
- 백엔드 없음. 정적 배포(Netlify/Vercel/GitHub Pages) 기준.

[가장 중요한 규칙 — 정확성]
- 첨부된 src/lib/celloData.ts 가 "정확성의 단일 출처"다.
- 음이름·주파수·포지션·운지 프레임은 절대 추측하거나 새로 하드코딩하지 말고,
  반드시 celloData.ts의 함수/데이터에서 계산해서 사용한다.
- 첼로 이론을 임의로 바꾸지 마라. 의심되면 멈추고 나에게 물어라.

[작업 방식]
- 한 번에 전부 만들지 말고, 내가 "Phase N 시작"이라고 하면 그 단계만 구현한다.
- 큰 구조 변경(라우팅/상태/폴더 구조)이 필요하면 먼저 제안하고 내 확인을 받는다.
- 컴포넌트는 작게 쪼개고, 타입을 엄격히 쓴다(any 금지).
- 각 단계 끝에는 "수용 기준"을 스스로 점검하고, 통과 여부를 보고한다.
- 데이터 로직(celloData.ts)에는 간단한 런타임 점검/테스트를 포함한다.

[디자인 방향 — "흑단과 황동(ebony & brass)"]
- 첼로의 세계에서 길어올린 톤: 따뜻한 흑단 지판, 황동(brass) 포인트, 상아(ivory) 음표.
- 배경: 따뜻한 짙은 갈색~검정 그라데이션. 글자: 상아색. 강조: 황동색.
- 4개 현은 고유 색으로 구분(낮은음=따뜻하게, 높은음=밝게)하되, 색만으로 구분하지 말고
  항상 음이름/손가락 텍스트를 함께 표기.
- 디스플레이 글꼴: Noto Serif KR / 본문: Noto Sans KR. 음악 기호 ♯ ♭ ♮ ½ 정상 표기.
- 큰 터치 타깃, 부드러운 호버/탭 피드백, 모바일 우선 반응형.

[정보 구조 — 탭(라우트)]
1) 지판(Fingerboard)  2) 포지션(Positions)  3) 찾기(Finder: 음↔자리)
4) 연습(Practice/퀴즈)  5) 음계(Scales)  6) 레퍼런스(Reference 차트)  7) 설정(Settings)

지금은 코드를 쓰지 말고, 위 내용을 요약 확인한 뒤
제안하는 폴더 구조와 Phase 0 계획만 먼저 보여줘.
```

---

## 3. 기능 명세 (상세)

### 3.1 인터랙티브 지판 (Fingerboard) — 앱의 심장
- 세로 지판 SVG: **연주자 시점, 왼→오른쪽 = C·G·D·A**. 위=너트, 아래=브리지(아래로 갈수록 고음).
- 각 줄 위에 반음 간격으로 음 자리(점)를 표시(오프셋 0=개방현 ~ 약 10까지).
- **탭/호버 시** : 해당 음 **재생** + 말풍선에 `음이름 · 계이름 · 손가락(해당 포지션) · 포지션` 표시.
- **표시 토글** : 음이름 / 계이름 / 손가락 번호 / 포지션 로마숫자 / 모두 끄기.
- **자연음 vs 반음** 시각 구분(상아 원 안에 음이름 = 자연음, 작은 링 = 반음 ♯/♭).
- 포지션 가이드 라인(½·I·II·III·IV)과 1포지션 영역 살짝 강조.

### 3.2 찾기 (Finder: 음 ↔ 운지)
- 미니 건반 또는 음 버튼에서 **목표 음 선택** → 지판에서 **연주 가능한 모든 자리 하이라이트**(포지션별 손가락 옵션 포함).
- **추천 운지**(가장 낮은 포지션/개방현 우선)를 별도 강조 + 한 번에 재생.
- 반대로 지판 자리를 누르면 그 음의 모든 이름(음이름/계이름)을 보여줌.

### 3.3 포지션 트레이너 (Positions)
- ½·I·II·III·IV 중 선택 → **네 현의 닫힌 프레임**(손가락 1·2·3·4)을 한눈에.
- **손가락 1→4 순차 애니메이션** + 오름/내림 재생.
- 프레임 개념 설명: *닫힌 자세는 이웃 손가락이 모두 반음(1~4가 단3도 폭)*.
- **익스텐션 토글**: 앞 벌림(1 고정, 2·3·4 반음 위 → 1–2가 온음, 장3도 폭) / 뒤 벌림(1만 반음 아래).

### 3.4 계이름·음이름 시스템 (전역 설정 + 모든 라벨에 반영)
- 라벨 시스템 4종(설정에서 선택):
  1. **영문 음이름** : C D E F G A B (반음은 ♯/♭ 선택)
  2. **한글 음이름(고정)** : 다 라 마 바 사 가 나
  3. **계이름 · 고정도(도=C)** : 도 레 미 파 솔 라 시
  4. **계이름 · 이동도(조 선택)** : 으뜸음 기준 도레미 (조성 드롭다운)
- **올림(♯)/내림(♭) 표기 선택** 토글. (예: C♯ = 다♯ = 도♯)
- 매핑은 **부록 B 표**와 부록 A의 `displayName()`을 따른다.

### 3.5 오디오 엔진
- Tone.js 합성음(예: 삼각파+필터+엔벨로프, 첼로 느낌). **정확한 주파수**는 `freqAt()` 사용.
- 사용자 제스처(첫 탭) 후 `Tone.start()`로 오디오 컨텍스트 활성화.
- 음 길이/세기 일정, 음 잇기(scale)에서 부드럽게. 음소거/볼륨.

### 3.6 연습·퀴즈 (Practice)
- **모드 A (음 → 자리)** : 음(계이름/음이름/오선)을 제시 → 지판에서 정답 자리 탭 → 채점.
- **모드 B (자리 → 음)** : 지판 한 자리 하이라이트 → 음이름 4지선다.
- **모드 C (포지션 드릴)** : "이 포지션에서 이 음은 몇 번 손가락?" 맞히기.
- 난이도: 현 부분집합 / 포지션 부분집합 / 자연음만 vs 반음 포함.
- **연속 정답(streak)·정확도(%)·세션 요약**, 오답은 정답 자리/이름을 보여줌.

### 3.7 음계 & 간단한 곡 (Scales)
- **1옥타브 음계**(다장조/사장조/라장조 = 1포지션 친화) 운지 하이라이트 + 단계별 재생 + 메트로놈/템포.
- "따라 연주" 모드(다음에 짚을 자리 안내).
- 곡은 **퍼블릭 도메인/전통 멜로디만**(예: 작은별/반짝반짝). 저작권 있는 악보·멜로디 사용 금지.

### 3.8 레퍼런스 차트 (Reference)
- ½~IV 포지션 **운지표 전체**(현×포지션×손가락→음) + 조율표를 한 화면 참고용으로.

### 3.9 진도·설정·저장
- 설정: 라벨 시스템, ♯/♭, 음소거/볼륨, 템포, 모션 줄이기, 다크/라이트(기본 다크).
- 진도: 퀴즈 정확도·streak·최근 학습 포지션을 localStorage에 저장. 초기화 버튼 제공.

---

## 4. 기술 스택 & 아키텍처

**스택** : Vite · React 18 · TypeScript · Tailwind · Tone.js · zustand · framer-motion · 인라인 SVG · localStorage.

**권장 폴더 구조**
```text
src/
  lib/
    celloData.ts        # ★ 정확성의 단일 출처 (부록 A)
    audio.ts            # Tone.js 래퍼: init(), playMidi(), playFreq(), playSequence()
    labels.ts           # displayName() 등 라벨 시스템 헬퍼 (celloData 재노출 가능)
  store/
    useSettings.ts      # 라벨 시스템, ♯/♭, 볼륨, 템포, 모션 (persist)
    useProgress.ts      # 퀴즈 점수/streak (persist)
  components/
    Fingerboard.tsx     # SVG 지판 (탭/호버/토글)
    NoteMarker.tsx
    NoteTooltip.tsx
    PianoPicker.tsx     # Finder용 음 선택
    PositionFrame.tsx   # 포지션 프레임 + 애니메이션
    Metronome.tsx
    LabelToggle.tsx
    Tabs.tsx / Layout.tsx
  pages/
    FingerboardPage.tsx
    PositionsPage.tsx
    FinderPage.tsx
    PracticePage.tsx
    ScalesPage.tsx
    ReferencePage.tsx
    SettingsPage.tsx
  styles/ tokens.css     # CSS 변수(색/타이포)
  App.tsx  main.tsx
```

**상태 원칙** : 전역은 설정/진도만 zustand로, 화면 로컬 상태는 useState. 음악 데이터는 상태가 아니라 `celloData.ts`에서 계산.

---

## 5. UI/UX 디자인 디렉션 ("흑단과 황동")

**컬러 토큰(CSS 변수)**
```css
:root{
  --bg:#1b1712; --bg2:#13100c; --panel:#221c16;
  --ivory:#f4ecd8; --dim:#b7ac92; --ink:#26201a;
  --brass:#c9a24b; --brass-l:#e6cb7e; --brass-d:#9a7b2e;
  --parch:#f2e8d2;
  --str-c:#c9a36a; --str-g:#cbb07a; --str-d:#d6cdba; --str-a:#e0d8c6; /* C G D A */
  --ok:#5a8f5a; --bad:#b4524a;
}
```
- **타이포** : 디스플레이 `Noto Serif KR`(600/700), 본문 `Noto Sans KR`(400/500/700). 음 기호 ♯♭♮½ 정상.
- **레이아웃** : 상단 슬림 탭바(스티키) → 화면별 본문 → 하단 미니 컨트롤(재생/음소거/라벨 토글).
- **모션** : 탭 피드백(눌림), 포지션 프레임 손가락 순차 등장, 정답/오답 마이크로 인터랙션. `prefers-reduced-motion`이면 모두 비활성.
- **반응형** : 모바일은 지판을 세로로 크게, 가로 스크롤 허용(최소폭 보장). 큰 터치 타깃(≥44px).
- **접근성** : 모든 인터랙티브 요소 키보드 포커스 + ARIA 라벨(예: "A현 3번 손가락, 도, C"), 색맹 안전(색+모양+텍스트), 대비 AA 이상.

**ASCII 와이어프레임 (지판 페이지)**
```text
┌───────────────────────────────────────────────┐
│ 지판  포지션  찾기  연습  음계  레퍼런스  설정     │  ← 탭바
├───────────────────────────────────────────────┤
│        C2     G2     D3     A3       [라벨▾]      │
│  ½  ───●──────●──────●──────●───   토글: 음이름 │
│  I  ───●──────●──────●──────●───        계이름 │
│  II ───●──────●──────●──────●───        손가락 │
│ ...                                              │
│           [▶ 개방현]  [🔊]  [도레미/CDE]          │
└───────────────────────────────────────────────┘
탭 시 ▶ 말풍선: "A현 · 3번 · 미(E)" + 소리
```

---

## 6. 단계별 구현 플랜 (Phase 0 → 9)

> 각 Phase는 **목표 / 작업 / 수용 기준 ✅ / 붙여넣을 프롬프트** 로 구성. **한 번에 한 Phase**만 진행하고, ✅를 모두 통과한 뒤 다음으로.

### Phase 0 — 프로젝트 셋업 & 셸
- **목표** : 빈 화면이지만 테마와 탭이 살아있는 골격.
- **작업** : Vite+React+TS 생성, Tailwind/Tone.js/zustand/framer-motion 설치, `tokens.css` 적용, 7개 탭 라우팅(빈 페이지), 다크 테마 배경.
- **✅ 수용 기준**
  - `npm run dev` 정상, 콘솔 에러 0.
  - 7개 탭 이동 가능, 흑단/황동 테마 배경·상단 탭바 표시.
  - Noto Serif/Sans KR 로드 확인.
```text
Phase 0 시작. 위 마스터 프롬프트의 스택/폴더 구조대로 프로젝트 셸을 만들어줘.
- Vite+React+TS, Tailwind, Tone.js, zustand, framer-motion 설치 스크립트 포함.
- src/styles/tokens.css에 §5 컬러 토큰을 넣고 전역 적용.
- 7개 탭(지판/포지션/찾기/연습/음계/레퍼런스/설정) 라우팅 + 스티키 탭바 + 빈 페이지.
- index.html에 Noto Serif KR / Noto Sans KR 링크.
수용 기준을 점검하고 통과 여부를 보고해줘. 다음 단계는 내가 지시한다.
```

### Phase 1 — 데이터 레이어 (정확성의 핵심)
- **목표** : `celloData.ts`를 넣고, 값이 정확함을 자동 점검.
- **작업** : 부록 A를 `src/lib/celloData.ts`로 추가, `audio.ts`/`labels.ts` 골격, **개발용 점검**(콘솔 assert 또는 작은 테스트 페이지).
- **✅ 수용 기준** (아래 값과 일치해야 함)
  - 개방현 주파수: C2=65.41, G2=98.00, D3=146.83, A3=220.00 Hz.
  - 하프포지션 A현 = B♭·B·C·C♯ / 1포지션 G현 = A·B♭·B·C / 정상 4포지션 G현 = D·E♭·E·F.
  - C·G·D 장조 1옥타브가 다이어토닉 오름차순.
```text
Phase 1 시작. 첨부한 celloData.ts를 src/lib/에 추가하고,
src/lib/audio.ts(빈 래퍼)와 src/lib/labels.ts를 만들어줘.
그리고 dev 전용 점검을 추가해서 다음을 자동 검증하고 콘솔에 PASS/FAIL을 찍어줘:
- 개방현 주파수 C2/G2/D3/A3 = 65.41/98.00/146.83/220.00 (±0.05)
- ½ A현 = Bb,B,C,C# / I G현 = A,Bb,B,C / IV G현 = D,Eb,E,F
- C/G/D 장조 1옥타브가 오름차순
수용 기준 보고 후 대기.
```

### Phase 2 — 인터랙티브 지판 (SVG)
- **목표** : 탭하면 정보가 뜨는 지판.
- **작업** : `Fingerboard.tsx`(현·너트·포지션 가이드·음 마커), 자연음/반음 시각 구분, 라벨 토글, 말풍선(음이름/계이름/손가락/포지션), 키보드 포커스.
- **✅ 수용 기준** : 임의 자리 탭 시 정보가 **celloData와 일치**, 모바일 가로 스크롤, 토글 동작, 포커스 이동 가능.
```text
Phase 2 시작. src/components/Fingerboard.tsx를 인라인 SVG로 만들어줘.
- 연주자 시점 왼→오른쪽 C·G·D·A, 위=너트/아래=브리지.
- 오프셋 0~10에 음 마커. 자연음=상아 원에 음이름, 반음=작은 링.
- 포지션 가이드 라인(½·I·II·III·IV), 1포지션 영역 살짝 강조.
- 라벨 토글(음이름/계이름/손가락/포지션/끄기).
- 마커 탭/호버 시 NoteTooltip에 "현·손가락·계이름·음이름·포지션" 표시.
- 모든 값은 celloData 함수로 계산. 키보드 포커스+ARIA 라벨.
FingerboardPage에 연결하고 수용 기준 보고.
```

### Phase 3 — 오디오 엔진
- **목표** : 누르면 정확한 음이 난다.
- **작업** : `audio.ts`에 Tone.js 합성음 + `init()/playMidi()/playFreq()/playSequence()`, 첫 제스처에 `Tone.start()`, 음소거/볼륨.
- **✅ 수용 기준** : 마커 탭 시 **해당 주파수** 재생(A3 탭=220Hz), 사용자 제스처 전 무음, 음소거 동작.
```text
Phase 3 시작. src/lib/audio.ts에 Tone.js 합성 첼로음을 구현:
- ensureStarted()(첫 사용자 제스처에 Tone.start())
- playFreq(hz), playMidi(midi), playSequence(midis[], bpm)
- 볼륨/음소거(설정 store와 연동 준비)
지판 마커 탭 시 freqAt()로 계산한 음을 재생하도록 연결.
수용 기준(A3=220Hz 등, 제스처 전 무음) 점검 보고.
```

### Phase 4 — 라벨 시스템 + 설정 영속화
- **목표** : 계이름/음이름 전환이 앱 전체에 즉시 반영·저장.
- **작업** : `useSettings`(zustand+persist), `labels.ts`의 `displayName()`로 모든 라벨 통일, 라벨 토글/조성 선택/♯·♭ 토글.
- **✅ 수용 기준** : 4종 라벨 + 고정/이동도 전환이 **모든 화면 라벨**에 실시간 반영, 새로고침 후 유지.
```text
Phase 4 시작. src/store/useSettings.ts(zustand persist)와 labels.ts를 구현:
- labelSystem: 'en' | 'koLetter' | 'solfegeFixed' | 'solfegeMovable'
- accidental: 'sharp' | 'flat', tonicPc(이동도용), volume, muted, bpm, reduceMotion
- displayName(pc, system, {tonicPc, prefer})는 celloData 매핑/부록 B를 따른다.
지판·말풍선 등 모든 라벨이 useSettings를 구독해 즉시 바뀌게 하고,
설정 페이지에 토글 UI를 추가. 새로고침 후 유지되는지 점검 보고.
```

### Phase 5 — 찾기 (음 ↔ 운지)
- **목표** : 음을 고르면 짚을 자리를 다 보여준다.
- **작업** : `PianoPicker`, `placementsForPc()`로 모든 자리 하이라이트, **추천 운지**(낮은 포지션/개방현 우선) 강조, 재생.
- **✅ 수용 기준** : 선택 음의 하이라이트가 정확, 추천 운지 합리적, 탭으로 역방향(자리→음)도 동작.
```text
Phase 5 시작. FinderPage + PianoPicker를 만들어줘.
- 음 선택 시 celloData.placementsForPc()로 가능한 모든 (현·포지션·손가락) 지판 하이라이트.
- 추천 운지(가장 낮은 포지션, 개방현 가능하면 우선) 1개를 강조하고 재생 버튼 제공.
- 지판 자리를 누르면 그 음의 음이름/계이름을 보여주는 역방향도 지원.
수용 기준 점검 보고.
```

### Phase 6 — 포지션 트레이너
- **목표** : 포지션별 손 모양을 손에 익힌다.
- **작업** : `PositionFrame`(네 현 프레임 + 1→4 애니메이션), 오름/내림 재생, 익스텐션 토글, 프레임 개념 설명 문구.
- **✅ 수용 기준** : 프레임/익스텐션 음이 데이터와 일치, 애니메이션·소리 동기, 모션 줄이기 존중.
```text
Phase 6 시작. PositionsPage + PositionFrame을 만들어줘.
- ½·I·II·III·IV 선택 → 네 현의 닫힌 프레임(손가락 1~4) 표시(noteFor 사용).
- 손가락 1→4 순차 등장 애니메이션 + 오름/내림 재생.
- 익스텐션 토글: 앞 벌림(semitoneForExtended)/뒤 벌림(semitoneForBackExt).
- "닫힌 자세=이웃 반음, 1~4=단3도" 설명 문구.
reduceMotion 설정 존중. 수용 기준 보고.
```

### Phase 7 — 연습·퀴즈
- **목표** : 학습을 측정·강화.
- **작업** : 모드 A(음→자리)/B(자리→음)/C(포지션 드릴), 난이도 옵션, streak·정확도·세션 요약, 오답 정답 표시, `useProgress` 저장.
- **✅ 수용 기준** : 채점 정확, 오답 시 정답 안내, 결과 저장/표시, 난이도 필터 동작.
```text
Phase 7 시작. PracticePage에 3개 모드 구현:
A) 음→자리: 제시된 음을 지판에서 탭. B) 자리→음: 하이라이트된 자리의 음 4지선다.
C) 포지션 드릴: 특정 포지션에서 음의 손가락 번호 맞히기.
- 난이도: 현/포지션 부분집합, 자연음만/반음 포함.
- streak, 정확도(%), 세션 요약, 오답은 정답 자리·이름 표시.
- useProgress(zustand persist)에 점수 저장.
정답 판정은 celloData 기준. 수용 기준 점검 보고.
```

### Phase 8 — 음계 & 간단한 곡
- **목표** : 실제 연주 흐름을 연습.
- **작업** : `SCALES`로 1옥타브 음계 운지 하이라이트 + 단계별 재생 + `Metronome`/템포, "따라 연주", 퍼블릭 도메인 멜로디(예: 작은별) 운지.
- **✅ 수용 기준** : 음계 운지가 데이터와 일치, 메트로놈 동작, 재생 음정 정확, 곡은 퍼블릭 도메인만.
```text
Phase 8 시작. ScalesPage + Metronome을 만들어줘.
- celloData.SCALES(다/사/라장조 1옥타브)를 단계별로 지판에 하이라이트하며 재생(scaleStepMidi 사용).
- 템포 슬라이더 + 메트로놈, "따라 연주"(다음 짚을 자리 안내).
- 추가 곡은 퍼블릭 도메인/전통 멜로디만(예: 작은별). 저작권 곡 금지.
수용 기준 보고.
```

### Phase 9 — 마무리(접근성·반응형·배포)
- **목표** : 출시 품질.
- **작업** : a11y 패스(ARIA/포커스/대비/색맹/reduced-motion), 모바일 패스, 빈/오류 상태, 첫 사용 온보딩 툴팁, 성능, (선택)PWA, 배포, README.
- **✅ 수용 기준** : Lighthouse 접근성 ≥ 90, 모바일 정상, 배포 URL 생성, README 작성.
```text
Phase 9 시작. 출시 마무리:
- 접근성 점검(모든 인터랙션 키보드 가능, ARIA, 대비 AA, 색맹 안전, prefers-reduced-motion).
- 모바일/가로 스크롤 최종 점검, 빈 상태·오류 상태·첫 사용 온보딩 툴팁.
- 성능 정리, (선택) PWA, Netlify/Vercel/GitHub Pages 배포 설정, README 작성.
Lighthouse 접근성 점수와 함께 최종 보고.
```

---

## 7. 전체 수용 기준 (릴리스 체크리스트)
- [ ] 모든 음/운지/주파수가 `celloData.ts`에서 계산된다(하드코딩·추측 없음).
- [ ] 지판 탭 → 0.1초 내 정확한 소리 + 라벨.
- [ ] 라벨 4종(영문/한글 음이름/고정도/이동도)·♯↔♭ 전환이 전 화면 즉시 반영·저장.
- [ ] ½~IV 포지션 프레임·익스텐션 정확.
- [ ] 찾기: 음→모든 자리 하이라이트 + 합리적 추천 운지.
- [ ] 퀴즈 3모드 채점/오답 안내/진도 저장.
- [ ] C·G·D 장조 음계 운지 정확 + 메트로놈.
- [ ] 모바일·키보드·색맹·reduced-motion·대비 AA.
- [ ] 저작권 있는 샘플/악보/멜로디 미사용.
- [ ] 배포 URL + README.

---

## 8. 정확성 가드레일 & 흔한 실수 (막히면 이 블록을 다시 붙여넣기)

```text
[정확성 점검]
- 첼로는 C·G·D·A 완전5도 조율. 연주자 시점 왼→오른쪽 C·G·D·A. (관객 시점은 거울상)
- 닫힌 자세(closed)에서 손가락 1·2·3·4는 연속 "반음" 간격(1~4가 단3도 폭).
  온음은 손가락을 건너뛰거나(예: 1·3) 익스텐션으로 낸다. ← 바이올린식 "온음 기본"과 다름!
- 포지션의 1번 손가락 위치(개방현 위 반음): ½=+1, I=+2, II=+3, III=+5, IV=+7.
- 앞 벌림: 1번 고정, 2·3·4를 반음 위로(1–2가 온음, 장3도 폭). 뒤 벌림: 1번만 반음 아래.
- ♯와 ♭는 같은 음높이(이명동음). UI에선 둘 다 보여주거나 설정으로 선택.
- 주파수는 freq = 440 * 2^((midi-69)/12). 개방현 MIDI: C2=36, G2=43, D3=50, A3=57.
- 위 사실과 어긋나는 코드가 있으면 멈추고 celloData.ts 기준으로 고쳐라.

[흔한 실수]
- 음 자리를 데이터가 아니라 화면에 직접 하드코딩 → 금지. 항상 celloData로 계산.
- 오디오를 사용자 제스처 전에 시작 → 브라우저가 막음. 첫 탭에서 Tone.start().
- 1포지션 D현을 D·E·F·G(온음 위주)로 표기 → 틀림. 닫힌 프레임은 E·F·F#·G(반음).
- 저작권 있는 첼로 샘플/유행가 멜로디 사용 → 금지(합성음 + 퍼블릭 도메인만).
- 색만으로 현/정오답 구분 → 색맹 사용자 배제. 색+모양+텍스트 병행.
```

---

## 부록 A. `src/lib/celloData.ts` — 정확성의 단일 출처 (검증 완료)

> 아래 파일을 그대로 프로젝트에 넣고, **값을 임의로 바꾸지 말 것.** (주파수·음계·익스텐션은 사전 검증됨)

```ts
// src/lib/celloData.ts
// 첼로 운지/음이름 데이터 — 정확성의 단일 출처(Single Source of Truth)
// 이 파일의 값/공식은 검증되었다. 임의로 바꾸지 말 것.

export type StringId = 'C' | 'G' | 'D' | 'A';
export type PositionId = 'half' | 'p1' | 'p2' | 'p3' | 'p4';
export type Finger = 1 | 2 | 3 | 4;

export interface CelloString {
  id: StringId;
  pc: number;     // 개방현 음의 피치 클래스(0=C..11=B)
  midi: number;   // 개방현 MIDI 번호
  sci: string;    // 과학적 표기 예:'C2'
  hz: number;     // 개방현 주파수
  color: string;  // UI 색
  gauge: number;  // 줄 두께(시각)
  order: number;  // 연주자 시점 왼→오른쪽 0=C..3=A
}

// 연주자 시점 왼→오른쪽: C, G, D, A (낮은음→높은음)
export const STRINGS: CelloString[] = [
  { id: 'C', pc: 0, midi: 36, sci: 'C2', hz: 65.41,  color: '#C9A36A', gauge: 6.0, order: 0 },
  { id: 'G', pc: 7, midi: 43, sci: 'G2', hz: 98.00,  color: '#CBB07A', gauge: 4.6, order: 1 },
  { id: 'D', pc: 2, midi: 50, sci: 'D3', hz: 146.83, color: '#D6CDBA', gauge: 3.3, order: 2 },
  { id: 'A', pc: 9, midi: 57, sci: 'A3', hz: 220.00, color: '#E0D8C6', gauge: 2.3, order: 3 },
];
export const stringById = (id: StringId) => STRINGS.find(s => s.id === id)!;

// 포지션: 1번 손가락이 개방현보다 몇 반음 위인지.
// 닫힌 자세에서 손가락 1·2·3·4는 연속 반음 → 1~4가 단3도(3반음) 폭.
export interface Position { id: PositionId; label: string; romanKo: string; firstFingerSemitone: number; }
export const POSITIONS: Position[] = [
  { id: 'half', label: '½',   romanKo: '하프', firstFingerSemitone: 1 },
  { id: 'p1',   label: 'I',   romanKo: '1st',  firstFingerSemitone: 2 },
  { id: 'p2',   label: 'II',  romanKo: '2nd',  firstFingerSemitone: 3 },
  { id: 'p3',   label: 'III', romanKo: '3rd',  firstFingerSemitone: 5 },
  { id: 'p4',   label: 'IV',  romanKo: '4th',  firstFingerSemitone: 7 },
];
export const positionById = (id: PositionId) => POSITIONS.find(p => p.id === id)!;

// 반음(크로매틱) 음이름
export const SHARP = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'] as const;
export const FLAT  = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] as const;

export interface NoteName { pc: number; isNatural: boolean; sharp: string; flat: string; }
export function noteNameOf(pc: number): NoteName {
  const i = ((pc % 12) + 12) % 12;
  const sharp = SHARP[i], flat = FLAT[i];
  return { pc: i, isNatural: sharp === flat, sharp, flat };
}

// MIDI / 주파수
export const midiAt = (s: CelloString, semitone: number) => s.midi + semitone;
export const freqOfMidi = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
export const freqAt = (s: CelloString, semitone: number) => freqOfMidi(midiAt(s, semitone));

// (포지션, 손가락) → 개방현 위 반음 오프셋 (닫힌 자세: 연속 반음)
export const semitoneFor = (pos: Position, finger: Finger) => pos.firstFingerSemitone + (finger - 1);
// 앞 벌림(forward ext): 1번 고정, 2·3·4 반음 위 (1–2가 온음, 장3도 폭)
export const semitoneForExtended = (pos: Position, finger: Finger) =>
  finger === 1 ? pos.firstFingerSemitone : pos.firstFingerSemitone + (finger - 1) + 1;
// 뒤 벌림(backward ext): 1번만 반음 아래, 나머지는 닫힌 자세
export const semitoneForBackExt = (pos: Position, finger: Finger) =>
  finger === 1 ? pos.firstFingerSemitone - 1 : pos.firstFingerSemitone + (finger - 1);

// (현, 포지션, 손가락) → 음이름 / MIDI
export const noteFor = (s: CelloString, pos: Position, finger: Finger) =>
  noteNameOf(s.pc + semitoneFor(pos, finger));
export const midiFor = (s: CelloString, pos: Position, finger: Finger) =>
  midiAt(s, semitoneFor(pos, finger));

// 음높이(MIDI)로 모든 연주 자리 찾기 (정확 음높이 기준)
export interface Placement { string: StringId; position: PositionId; finger: Finger; semitone: number; midi: number; }
export function placementsForMidi(targetMidi: number): Placement[] {
  const out: Placement[] = [];
  for (const s of STRINGS) for (const p of POSITIONS) for (const f of [1,2,3,4] as Finger[]) {
    const m = midiFor(s, p, f);
    if (m === targetMidi) out.push({ string: s.id, position: p.id, finger: f, semitone: semitoneFor(p,f), midi: m });
  }
  return out;
}
// 피치 클래스(옥타브 무시)로 찾기 — Finder 기본
export function placementsForPc(pc: number): Placement[] {
  const target = ((pc % 12) + 12) % 12;
  const out: Placement[] = [];
  for (const s of STRINGS) for (const p of POSITIONS) for (const f of [1,2,3,4] as Finger[]) {
    const m = midiFor(s, p, f);
    if (((m % 12) + 12) % 12 === target) out.push({ string: s.id, position: p.id, finger: f, semitone: semitoneFor(p,f), midi: m });
  }
  return out;
}
// 추천 운지: 가장 낮은 포지션(개방현 가능하면 우선 고려는 호출부에서)
export function recommendedPlacement(ps: Placement[]): Placement | undefined {
  const rank: Record<PositionId, number> = { half:0, p1:1, p2:2, p3:3, p4:4 };
  return [...ps].sort((a,b)=> rank[a.position]-rank[b.position] || a.finger-b.finger)[0];
}

// ---- 한글 음이름 / 계이름 매핑 ----
export const KO_LETTER: Record<string,string> = { C:'다', D:'라', E:'마', F:'바', G:'사', A:'가', B:'나' };
export const SOLFEGE_FIXED: Record<string,string> = { C:'도', D:'레', E:'미', F:'파', G:'솔', A:'라', B:'시' };
const DEGREE_SYL = ['도','도#','레','레#','미','파','파#','솔','솔#','라','라#','시']; // 이동도(올림 표기)
export const solfegeMovable = (pc: number, tonicPc: number) =>
  DEGREE_SYL[((((pc - tonicPc) % 12) + 12) % 12)];

export type LabelSystem = 'en' | 'koLetter' | 'solfegeFixed' | 'solfegeMovable';
export function displayName(
  pc: number, system: LabelSystem,
  opts: { tonicPc?: number; prefer?: 'sharp' | 'flat' } = {}
): string {
  const n = noteNameOf(pc);
  const prefer = opts.prefer ?? 'sharp';
  const pick = prefer === 'sharp' ? n.sharp : n.flat;
  if (system === 'en') return n.isNatural ? n.sharp : pick;
  if (system === 'koLetter') return n.isNatural ? KO_LETTER[n.sharp] : `${KO_LETTER[pick[0]]}${prefer==='sharp'?'♯':'♭'}`;
  if (system === 'solfegeFixed') return n.isNatural ? SOLFEGE_FIXED[n.sharp] : `${SOLFEGE_FIXED[pick[0]]}${prefer==='sharp'?'♯':'♭'}`;
  return solfegeMovable(pc, opts.tonicPc ?? 0); // 'solfegeMovable'
}

// ---- 음계(1포지션 친화 1옥타브). finger 0 = 개방현 ----
export interface ScaleStep { string: StringId; finger: 0 | 1 | 2 | 3 | 4; }
export interface Scale { id: string; name: string; tonicPc: number; steps: ScaleStep[]; }
export const SCALES: Scale[] = [
  { id:'Cmaj1', name:'다장조 (C Major) · 1옥타브', tonicPc:0, steps:[
    {string:'C',finger:0},{string:'C',finger:1},{string:'C',finger:3},{string:'C',finger:4},
    {string:'G',finger:0},{string:'G',finger:1},{string:'G',finger:3},{string:'G',finger:4}] },
  { id:'Gmaj1', name:'사장조 (G Major) · 1옥타브', tonicPc:7, steps:[
    {string:'G',finger:0},{string:'G',finger:1},{string:'G',finger:3},{string:'G',finger:4},
    {string:'D',finger:0},{string:'D',finger:1},{string:'D',finger:3},{string:'D',finger:4}] },
  { id:'Dmaj1', name:'라장조 (D Major) · 1옥타브', tonicPc:2, steps:[
    {string:'D',finger:0},{string:'D',finger:1},{string:'D',finger:3},{string:'D',finger:4},
    {string:'A',finger:0},{string:'A',finger:1},{string:'A',finger:3},{string:'A',finger:4}] },
];
// 음계 스텝의 MIDI (개방현=0, 그 외는 1포지션 닫힌 프레임 오프셋 2+(finger-1))
export function scaleStepMidi(step: ScaleStep): number {
  const s = stringById(step.string);
  return step.finger === 0 ? s.midi : s.midi + 2 + (step.finger - 1);
}

// ---- dev 전용 자가 점검 (개발 중 콘솔에 PASS/FAIL) ----
export function selfTest(): { ok: boolean; logs: string[] } {
  const logs: string[] = []; let ok = true;
  const approx = (a:number,b:number)=>Math.abs(a-b)<0.05;
  const fr: Record<StringId,number> = { C:65.41, G:98.00, D:146.83, A:220.00 };
  for (const s of STRINGS){ const f=freqOfMidi(s.midi); const p=approx(f,fr[s.id]); ok&&=p; logs.push(`${s.sci} ${f.toFixed(2)}Hz ${p?'PASS':'FAIL'}`);}  
  const frame = (sid:StringId,pid:PositionId)=>([1,2,3,4] as Finger[]).map(f=>{const n=noteFor(stringById(sid),positionById(pid),f);return n.isNatural?n.sharp:`${n.sharp}/${n.flat}`;});
  const eq=(a:string[],b:string[])=>a.length===b.length&&a.every((x,i)=>x===b[i]);
  const t1=eq(frame('A','half'),['A#/Bb','B','C','C#/Db']); ok&&=t1; logs.push(`½ A = ${frame('A','half').join(',')} ${t1?'PASS':'FAIL'}`);
  const t2=eq(frame('G','p1'),['A','A#/Bb','B','C']); ok&&=t2; logs.push(`I G = ${frame('G','p1').join(',')} ${t2?'PASS':'FAIL'}`);
  const t3=eq(frame('G','p4'),['D','D#/Eb','E','F']); ok&&=t3; logs.push(`IV G = ${frame('G','p4').join(',')} ${t3?'PASS':'FAIL'}`);
  for (const sc of SCALES){ const ms=sc.steps.map(scaleStepMidi); const asc=ms.every((m,i)=>i===0||m>ms[i-1]); ok&&=asc; logs.push(`${sc.name} asc ${asc?'PASS':'FAIL'}`);}  
  return { ok, logs };
}
```

> **참고** : `selfTest()`를 Phase 1에서 dev 모드에 호출해 콘솔에 PASS가 뜨는지 확인하세요. (TS에서 `ok &&= ...`가 빌드 타깃에 따라 경고면 `ok = ok && ...`로 바꾸세요.)

---

## 부록 B. 음이름 · 계이름 매핑 표

| 영문 음이름 | 한글 음이름(고정) | 계이름(고정도, 도=C) | 피치클래스(pc) |
|:---:|:---:|:---:|:---:|
| C | 다 | 도 | 0 |
| D | 라 | 레 | 2 |
| E | 마 | 미 | 4 |
| F | 바 | 파 | 5 |
| G | 사 | 솔 | 7 |
| A | 가 | 라 | 9 |
| B | 나 | 시 | 11 |

- **올림(♯)/내림(♭)** : 같은 음높이의 다른 표기(이명동음). 예) `C♯ = D♭ = 다♯ = 도♯`.
- **고정도(Fixed-do)** : 도 = C 고정(입문 친화). **이동도(Movable-do)** : 도 = 그 조의 으뜸음(예: 사장조면 도 = G).
- 첼로 개방현을 계이름으로(고정도): C=도, G=솔, D=레, A=라.

---

## 부록 C. 검증된 1포지션 음계 운지 (요약)

> finger 0 = 개방현. 모두 1포지션(닫힌 자세)에서 연주.

| 음계 | 진행(현·손가락) | 음이름 |
|---|---|---|
| **다장조 C** | C0·C1·C3·C4 → G0·G1·G3·G4 | C D E F G A B C |
| **사장조 G** | G0·G1·G3·G4 → D0·D1·D3·D4 | G A B C D E F♯ G |
| **라장조 D** | D0·D1·D3·D4 → A0·A1·A3·A4 | D E F♯ G A B C♯ D |

- 공통 패턴(각 현): **0·1·3·4** (2번 손가락은 건너뜀 — 온음 때문). 이것이 첼로 닫힌 자세의 핵심 감각이다.

---

## 부록 D. (선택) 확장 아이디어
- 오선보 ↔ 지판 연동(음표 클릭 시 자리 표시), 튜너/녹음 비교, 5~7 포지션·엄지 포지션 확장,
  교사용 과제 만들기/공유, 다국어(영/일), 진도 그래프, 다크/세피아 테마.

---

### 마지막 한마디 (AI에게)
> *"화려함보다 정확함과 명료함. 모든 음은 `celloData.ts`에서, 모든 화면은 초보 첼리스트가 30초 안에 이해하도록."*
