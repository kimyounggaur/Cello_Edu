import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Crosshair,
  Gauge,
  ListMusic,
  Moon,
  Music2,
  Play,
  RotateCcw,
  Search,
  Settings,
  Smartphone,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  type AnyPlacement,
  type FingerboardMarker,
  type LabelSystem,
  type NoteInfo,
  type Position,
  type PositionId,
  POSITIONS,
  SCALES,
  STRINGS,
  allPlacementsForPc,
  displayName,
  fingerboardMarkers,
  noteFor,
  placementToNoteInfo,
  scaleStepMidi,
  scientificPitch,
  selfTest,
  stringById,
} from './lib/celloData';
import { playMidi, playSequence, setAudioPreferences } from './lib/audio';
import { buildQuizQuestion, evaluatePlacementAnswer } from './lib/practice';
import { vibrate } from './lib/haptics';
import { useProgress } from './store/useProgress';
import { useSettings } from './store/useSettings';

type TabId = 'fingerboard' | 'finder' | 'practice' | 'scales' | 'more';

const tabs: Array<{ id: TabId; label: string; icon: typeof Music2 }> = [
  { id: 'fingerboard', label: '지판', icon: Music2 },
  { id: 'finder', label: '찾기', icon: Search },
  { id: 'practice', label: '연습', icon: Crosshair },
  { id: 'scales', label: '음계', icon: ListMusic },
  { id: 'more', label: '더보기', icon: Settings },
];

const chromaticPcs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('fingerboard');
  const [selectedInfo, setSelectedInfo] = useState<NoteInfo | null>(null);
  const [highlightPc, setHighlightPc] = useState<number | null>(null);
  const [highlightMidi, setHighlightMidi] = useState<number | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<string>('먼저 A현 개방현을 눌러 소리를 들어보세요.');
  const settings = useSettings();
  const addAttempt = useProgress((state) => state.addAttempt);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    setAudioPreferences({ muted: settings.muted, volume: settings.volume });
  }, [settings.muted, settings.volume]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const result = selfTest();
      result.logs.forEach((line) => console.info(`[celloData] ${line}`));
      console.info(`[celloData] ${result.ok ? 'PASS' : 'FAIL'}`);
    }
  }, []);

  const markerOptions = {
    labelSystem: settings.labelSystem,
    prefer: settings.accidental,
    tonicPc: settings.tonicPc,
  };

  const handleMarker = async (marker: FingerboardMarker) => {
    setSelectedInfo(marker.info);
    setHighlightMidi(marker.info.midi);
    vibrate('tap', settings.haptics);
    await playMidi(marker.info.midi);

    if (activeTab === 'practice') {
      const question = buildQuizQuestion('note-to-place', 11, 0);
      const placement = marker.placements[0];
      if (placement) {
        const result = evaluatePlacementAnswer(question, placement);
        addAttempt({ mode: question.mode, pc: question.pc, correct: result.status === 'correct' });
        setPracticeFeedback(result.message);
        vibrate(result.status === 'correct' ? 'correct' : 'wrong', settings.haptics);
      } else {
        setPracticeFeedback('개방현은 좋아요. 이번 문제는 손가락 자리에서 찾아보세요.');
      }
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Cello Fingering Master</p>
          <h1>지판온</h1>
        </div>
        <div className="header-actions">
          <label className="select-wrap" aria-label="라벨 표시 방식">
            <span className="sr-only">라벨 표시 방식</span>
            <select value={settings.labelSystem} onChange={(event) => settings.setLabelSystem(event.target.value as LabelSystem)}>
              <option value="solfegeFixed">도레미</option>
              <option value="en">CDE</option>
              <option value="koLetter">다라마</option>
              <option value="solfegeMovable">이동도</option>
            </select>
            <ChevronDown size={16} aria-hidden />
          </label>
          <button className="icon-button" type="button" aria-label="테마 전환" onClick={() => settings.setTheme(settings.theme === 'dark' ? 'light' : 'dark')}>
            <Moon size={18} aria-hidden />
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'fingerboard' && (
          <FingerboardPage
            markerOptions={markerOptions}
            selectedMidi={highlightMidi}
            highlightedPc={highlightPc}
            onMarker={handleMarker}
          />
        )}
        {activeTab === 'finder' && (
          <FinderPage
            markerOptions={markerOptions}
            selectedPc={highlightPc}
            onPc={(pc) => {
              setHighlightPc(pc);
              setHighlightMidi(null);
            }}
            onMarker={handleMarker}
          />
        )}
        {activeTab === 'practice' && (
          <PracticePage
            markerOptions={markerOptions}
            feedback={practiceFeedback}
            selectedMidi={highlightMidi}
            onMarker={handleMarker}
          />
        )}
        {activeTab === 'scales' && (
          <ScalesPage
            markerOptions={markerOptions}
            selectedMidi={highlightMidi}
            setSelectedMidi={setHighlightMidi}
            onMarker={handleMarker}
          />
        )}
        {activeTab === 'more' && <MorePage markerOptions={markerOptions} />}
      </main>

      <MiniControls selectedInfo={selectedInfo} />
      <NoteSheet info={selectedInfo} onClose={() => setSelectedInfo(null)} />

      <nav className="bottom-tabs" aria-label="주요 화면">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab ? 'tab active' : 'tab'}
              aria-current={tab.id === activeTab ? 'page' : undefined}
              onClick={() => {
                setActiveTab(tab.id);
                setHighlightPc(tab.id === 'finder' ? highlightPc : null);
              }}
            >
              <Icon size={21} aria-hidden />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function FingerboardPage({
  markerOptions,
  selectedMidi,
  highlightedPc,
  onMarker,
}: {
  markerOptions: MarkerOptions;
  selectedMidi: number | null;
  highlightedPc: number | null;
  onMarker: (marker: FingerboardMarker) => void;
}) {
  return (
    <section className="page-stack" aria-labelledby="fingerboard-title">
      <div className="hero-strip">
        <div>
          <h2 id="fingerboard-title">먼저 A현 개방현을 눌러 소리를 들어보세요.</h2>
          <p>현, 손가락, 음이름, 계이름, 소리가 한 번에 연결됩니다.</p>
        </div>
        <button className="pill-button" type="button" onClick={() => playMidi(stringById('A').midi)}>
          <Play size={17} aria-hidden />
          A현
        </button>
      </div>
      <Fingerboard
        markerOptions={markerOptions}
        selectedMidi={selectedMidi}
        highlightedPc={highlightedPc}
        onMarker={onMarker}
      />
    </section>
  );
}

function FinderPage({
  markerOptions,
  selectedPc,
  onPc,
  onMarker,
}: {
  markerOptions: MarkerOptions;
  selectedPc: number | null;
  onPc: (pc: number) => void;
  onMarker: (marker: FingerboardMarker) => void;
}) {
  const placements = selectedPc === null ? [] : allPlacementsForPc(selectedPc);
  const recommended = placements[0];

  return (
    <section className="page-stack" aria-labelledby="finder-title">
      <div className="section-head">
        <h2 id="finder-title">음에서 손가락 자리 찾기</h2>
        <p>계이름을 누르면 가능한 위치와 초급 추천 위치가 지판에 표시됩니다.</p>
      </div>
      <div className="note-grid" role="list" aria-label="찾을 음 선택">
        {chromaticPcs.map((pc) => (
          <button key={pc} type="button" className={selectedPc === pc ? 'note-choice active' : 'note-choice'} onClick={() => onPc(pc)}>
            <strong>{displayName(pc, markerOptions.labelSystem, markerOptions)}</strong>
            <span>{displayName(pc, 'en', markerOptions)}</span>
          </button>
        ))}
      </div>
      {recommended ? (
        <div className="callout">
          <CheckCircle2 size={20} aria-hidden />
          <p>
            초급 추천: <strong>{placementToNoteInfo(recommended, markerOptions).label}</strong>
          </p>
        </div>
      ) : (
        <div className="callout muted">
          <CircleHelp size={20} aria-hidden />
          <p>먼저 찾을 음을 선택하세요.</p>
        </div>
      )}
      <Fingerboard markerOptions={markerOptions} highlightedPc={selectedPc} selectedMidi={recommended?.midi ?? null} onMarker={onMarker} compact />
    </section>
  );
}

function PracticePage({
  markerOptions,
  feedback,
  selectedMidi,
  onMarker,
}: {
  markerOptions: MarkerOptions;
  feedback: string;
  selectedMidi: number | null;
  onMarker: (marker: FingerboardMarker) => void;
}) {
  const question = useMemo(() => buildQuizQuestion('note-to-place', 11, 0), []);
  const progress = useProgress();
  const accuracy =
    progress.attempts.length === 0
      ? 0
      : Math.round((progress.attempts.filter((attempt) => attempt.correct).length / progress.attempts.length) * 100);

  return (
    <section className="page-stack" aria-labelledby="practice-title">
      <div className="quiz-card">
        <p className="eyebrow">오늘의 퀴즈</p>
        <h2 id="practice-title">{question.prompt}</h2>
        <p>{feedback}</p>
        <div className="metrics">
          <span>연속 {progress.streak}</span>
          <span>정확도 {accuracy}%</span>
        </div>
      </div>
      <Fingerboard markerOptions={markerOptions} selectedMidi={selectedMidi} highlightedPc={question.pc} onMarker={onMarker} />
    </section>
  );
}

function ScalesPage({
  markerOptions,
  selectedMidi,
  setSelectedMidi,
  onMarker,
}: {
  markerOptions: MarkerOptions;
  selectedMidi: number | null;
  setSelectedMidi: (midi: number | null) => void;
  onMarker: (marker: FingerboardMarker) => void;
}) {
  const settings = useSettings();
  const [scaleId, setScaleId] = useState(SCALES[0].id);
  const scale = SCALES.find((candidate) => candidate.id === scaleId) ?? SCALES[0];
  const midis = scale.steps.map(scaleStepMidi);

  return (
    <section className="page-stack" aria-labelledby="scales-title">
      <div className="section-head">
        <h2 id="scales-title">음계 따라 연주</h2>
        <p>1포지션 친화 운지 0·1·3·4 패턴으로 다·사·라장조를 익힙니다.</p>
      </div>
      <div className="control-card">
        <label>
          음계
          <select value={scaleId} onChange={(event) => setScaleId(event.target.value)}>
            {SCALES.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          템포 {settings.bpm}
          <input type="range" min="48" max="132" value={settings.bpm} onChange={(event) => settings.setBpm(Number(event.target.value))} />
        </label>
        <button className="primary-button" type="button" onClick={() => playSequence(midis, settings.bpm)}>
          <Play size={18} aria-hidden />
          전체 듣기
        </button>
      </div>
      <div className="scale-steps" aria-label="음계 단계">
        {midis.map((midi, index) => (
          <button key={`${midi}-${index}`} type="button" className={selectedMidi === midi ? 'scale-step active' : 'scale-step'} onClick={() => setSelectedMidi(midi)}>
            <span>{index + 1}</span>
            <strong>{scientificPitch(midi, markerOptions.prefer)}</strong>
            <em>{displayName(midi, markerOptions.labelSystem, markerOptions)}</em>
          </button>
        ))}
      </div>
      <Fingerboard markerOptions={markerOptions} selectedMidi={selectedMidi} onMarker={onMarker} compact />
    </section>
  );
}

function MorePage({ markerOptions }: { markerOptions: MarkerOptions }) {
  const settings = useSettings();
  const progress = useProgress();
  const [positionId, setPositionId] = useState<PositionId>('p1');
  const position = POSITIONS.find((item) => item.id === positionId) ?? POSITIONS[1];

  return (
    <section className="page-stack" aria-labelledby="more-title">
      <div className="section-head">
        <h2 id="more-title">포지션 · 레퍼런스 · 설정</h2>
        <p>자료 폴더의 표준 운지표 기준: ½~IV 포지션, 닫힌 자세, 완전5도 조율.</p>
      </div>
      <article className="reference-card">
        <div className="card-title">
          <Gauge size={20} aria-hidden />
          <h3>포지션 트레이너</h3>
        </div>
        <div className="segmented">
          {POSITIONS.map((item) => (
            <button key={item.id} type="button" className={item.id === positionId ? 'active' : ''} onClick={() => setPositionId(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <PositionFrame position={position} markerOptions={markerOptions} />
      </article>
      <article className="reference-card">
        <div className="card-title">
          <BookOpen size={20} aria-hidden />
          <h3>검증 메모</h3>
        </div>
        <ul className="plain-list">
          <li>C2·G2·D3·A3 표준 조율, 각 현 완전5도.</li>
          <li>닫힌 자세는 1·2·3·4가 모두 반음 간격입니다.</li>
          <li>앞벌림은 1번 고정, 2·3·4를 반음 앞으로 이동합니다.</li>
          <li>뒤벌림은 1번만 반음 뒤로 이동합니다.</li>
        </ul>
      </article>
      <article className="reference-card">
        <div className="card-title">
          <Settings size={20} aria-hidden />
          <h3>모바일 설정</h3>
        </div>
        <div className="settings-grid">
          <label>
            표기
            <select value={settings.accidental} onChange={(event) => settings.setAccidental(event.target.value as 'sharp' | 'flat')}>
              <option value="sharp">올림표 ♯</option>
              <option value="flat">내림표 ♭</option>
            </select>
          </label>
          <label>
            볼륨
            <input type="range" min="-36" max="0" value={settings.volume} onChange={(event) => settings.setVolume(Number(event.target.value))} />
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={settings.muted} onChange={(event) => settings.setMuted(event.target.checked)} />
            음소거
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={settings.haptics} onChange={(event) => settings.setHaptics(event.target.checked)} />
            햅틱
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={settings.reduceMotion} onChange={(event) => settings.setReduceMotion(event.target.checked)} />
            모션 줄이기
          </label>
        </div>
        <button className="secondary-button" type="button" onClick={progress.reset}>
          <RotateCcw size={16} aria-hidden />
          진도 초기화
        </button>
      </article>
    </section>
  );
}

type MarkerOptions = {
  labelSystem: LabelSystem;
  prefer: 'sharp' | 'flat';
  tonicPc: number;
};

function Fingerboard({
  markerOptions,
  selectedMidi,
  highlightedPc,
  onMarker,
  compact = false,
}: {
  markerOptions: MarkerOptions;
  selectedMidi?: number | null;
  highlightedPc?: number | null;
  onMarker: (marker: FingerboardMarker) => void;
  compact?: boolean;
}) {
  const markers = useMemo(() => fingerboardMarkers({ ...markerOptions, maxSemitone: compact ? 7 : 10 }), [markerOptions, compact]);
  const width = 360;
  const height = compact ? 500 : 640;
  const bottom = height - 54;
  const maxSemitone = compact ? 7 : 10;
  const yFor = (semitone: number) => 72 + (bottom - 72) * (semitone / maxSemitone);
  const stringGap = width / (STRINGS.length + 1);

  return (
    <div className="fingerboard-wrap">
      <svg className="fingerboard-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="첼로 지판. 왼쪽부터 C현, G현, D현, A현">
        <defs>
          <linearGradient id="board" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#2c231b" />
            <stop offset="1" stopColor="#110d0a" />
          </linearGradient>
        </defs>
        <rect x="12" y="36" width="336" height={height - 66} rx="26" fill="url(#board)" stroke="#6d5632" strokeWidth="1.5" />
        <rect x="34" y="58" width="292" height="10" rx="4" fill="#e8dcc0" />
        {POSITIONS.map((position) => (
          <g key={position.id}>
            <line x1="34" x2="326" y1={yFor(position.firstFingerSemitone)} y2={yFor(position.firstFingerSemitone)} stroke="#9a7b2e" strokeDasharray="5 8" opacity="0.45" />
            <text x="24" y={yFor(position.firstFingerSemitone) + 5} fill="#e6cb7e" fontSize="13" fontWeight="700" textAnchor="middle">
              {position.label}
            </text>
          </g>
        ))}
        {STRINGS.map((string, index) => {
          const x = stringGap * (index + 1);
          return (
            <g key={string.id}>
              <line x1={x} x2={x} y1="68" y2={bottom + 14} stroke={string.color} strokeWidth={string.gauge} strokeLinecap="round" />
              <text x={x} y="28" fill="#f4ecd8" fontSize="16" fontWeight="800" textAnchor="middle">
                {string.id}
              </text>
              <text x={x} y="46" fill="#b7ac92" fontSize="11" textAnchor="middle">
                {string.sci}
              </text>
            </g>
          );
        })}
        {markers.map((marker) => {
          const isSelected = selectedMidi === marker.info.midi;
          const isHighlighted = highlightedPc !== null && highlightedPc !== undefined && marker.info.pc === highlightedPc;
          const radius = isSelected ? 18 : isHighlighted ? 16 : marker.isNatural ? 13 : 11;
          return (
            <g key={marker.id} role="button" tabIndex={0} aria-label={marker.info.label} onClick={() => onMarker(marker)} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') onMarker(marker);
            }}>
              <circle cx={marker.x} cy={marker.y} r="24" fill="transparent" className="hit-area" />
              <circle
                cx={marker.x}
                cy={marker.y}
                r={radius}
                fill={marker.isNatural ? '#f4ecd8' : 'transparent'}
                stroke={isSelected || isHighlighted ? '#e6cb7e' : '#b7ac92'}
                strokeWidth={isSelected || isHighlighted ? 3 : 1.4}
                className="note-dot"
              />
              <text x={marker.x} y={marker.y - 2} textAnchor="middle" fontSize={marker.info.finger === 0 ? 10 : 11} fontWeight="800" fill={marker.isNatural ? '#211a12' : '#f4ecd8'}>
                {marker.info.finger === 0 ? '0' : marker.info.finger}
              </text>
              <text x={marker.x} y={marker.y + 11} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={marker.isNatural ? '#211a12' : '#f4ecd8'}>
                {displayName(marker.info.pc, markerOptions.labelSystem, markerOptions)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function NoteSheet({ info, onClose }: { info: NoteInfo | null; onClose: () => void }) {
  if (!info) return null;
  return (
    <aside className="note-sheet" aria-label="선택한 음 상세 정보">
      <button type="button" className="sheet-handle" aria-label="음 상세 닫기" onClick={onClose} />
      <div className="sheet-grid">
        <div>
          <p className="eyebrow">{info.string.ko} · {info.position.ko}</p>
          <h2>{info.finger === 0 ? '개방현' : `${info.finger}번 손가락`}</h2>
          <p className="big-note">{info.scientific} / {info.solfege}</p>
        </div>
        <button className="round-play" type="button" onClick={() => playMidi(info.midi)} aria-label={`${info.label} 소리 듣기`}>
          <Play size={24} aria-hidden />
        </button>
      </div>
      <dl className="fact-row">
        <div>
          <dt>주파수</dt>
          <dd>{info.frequencyHz.toFixed(2)} Hz</dd>
        </div>
        <div>
          <dt>반음 위치</dt>
          <dd>+{info.semitone}</dd>
        </div>
        <div>
          <dt>계이름</dt>
          <dd>{info.solfege}</dd>
        </div>
      </dl>
    </aside>
  );
}

function MiniControls({ selectedInfo }: { selectedInfo: NoteInfo | null }) {
  const settings = useSettings();
  return (
    <div className="mini-controls" aria-label="미니 컨트롤">
      <button type="button" className="mini-button" onClick={() => selectedInfo && playMidi(selectedInfo.midi)} disabled={!selectedInfo}>
        <Volume2 size={17} aria-hidden />
        재생
      </button>
      <button type="button" className="mini-button" onClick={() => settings.setMuted(!settings.muted)}>
        {settings.muted ? <VolumeX size={17} aria-hidden /> : <Volume2 size={17} aria-hidden />}
        {settings.muted ? '무음' : '소리'}
      </button>
      <span className="mini-status">{selectedInfo ? selectedInfo.label : '선택한 음 없음'}</span>
    </div>
  );
}

function PositionFrame({ position, markerOptions }: { position: Position; markerOptions: MarkerOptions }) {
  return (
    <div className="position-frame">
      {STRINGS.map((string) => (
        <div key={string.id} className="frame-row">
          <strong>{string.ko}</strong>
          <div className="finger-row">
            {([1, 2, 3, 4] as const).map((finger) => {
              const note = noteFor(string, position, finger);
              return (
                <span key={finger}>
                  <b>{finger}</b>
                  {displayName(note.pc, markerOptions.labelSystem, markerOptions)}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
