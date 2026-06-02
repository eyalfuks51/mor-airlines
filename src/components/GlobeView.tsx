import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { Destination, VibeTag, DestinationState } from '../data/destinations';
import { CeremonyPhase } from '../utils/ceremony';
import FilterBar from './FilterBar';
import { AnimatedText } from './ui/animated-text';

const ISRAEL_LAT = 31.7683;
const ISRAEL_LNG = 35.2137;

const STATE_COLORS: Record<string, string> = {
  dream: '#FFD700',
  starred: '#FF69B4',
  booked: '#38BDF8',
  visited: '#4ADE80',
  israel: '#FF6B35',
  pin: '#FF3B3B',
};

type ArcRow = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
};

type HtmlPoint =
  | Destination
  | { id: '__israel__'; lat: number; lng: number }
  | { id: '__pin__'; lat: number; lng: number };

interface Props {
  destinations: Destination[];
  onLottery: () => void;
  onOpenPassport: () => void;
  onAddDestination: () => void;
  ceremonyPhase: CeremonyPhase;
  selectedDest: Destination | null;
  activeVibes: VibeTag[];
  activeState: DestinationState | 'all';
  onVibeToggle: (vibe: VibeTag) => void;
  onStateChange: (state: DestinationState | 'all') => void;
  onResetFilters: () => void;
  lotteryPoolEmpty: boolean;
}

const showPin = (phase: CeremonyPhase) =>
  phase === 'pin-drop' || phase === 'reveal' || phase === 'boarding-pass';

const showArc = (phase: CeremonyPhase) =>
  phase === 'reveal' || phase === 'boarding-pass';

export default function GlobeView({
  destinations,
  onLottery,
  onOpenPassport,
  onAddDestination,
  ceremonyPhase,
  selectedDest,
  activeVibes,
  activeState,
  onVibeToggle,
  onStateChange,
  onResetFilters,
  lotteryPoolEmpty,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const setSelectedIdRef = useRef(setSelectedId);
  setSelectedIdRef.current = setSelectedId;

  const selected = useMemo(
    () => destinations.find(d => d.id === selectedId) ?? null,
    [destinations, selectedId],
  );

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!globeRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = globeRef.current.controls() as any;
    if (ceremonyPhase === 'idle') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      globeRef.current.pointOfView({ lat: 25, lng: 20, altitude: 2.5 }, 1800);
    } else if (ceremonyPhase === 'spin') {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 4.5;
    } else if (ceremonyPhase === 'lock') {
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0;
      if (selectedDest) {
        globeRef.current.pointOfView(
          { lat: selectedDest.lat, lng: selectedDest.lng, altitude: 1.4 },
          2200,
        );
      }
    }
  }, [ceremonyPhase, selectedDest]);

  const arcsData = useMemo<ArcRow[]>(() => {
    const base = destinations
      .filter(d => d.state === 'booked' || d.state === 'visited')
      .map(d => ({
        startLat: ISRAEL_LAT,
        startLng: ISRAEL_LNG,
        endLat: d.lat,
        endLng: d.lng,
        color: d.state === 'booked' ? STATE_COLORS.booked : STATE_COLORS.visited,
      }));

    if (showArc(ceremonyPhase) && selectedDest) {
      base.push({
        startLat: ISRAEL_LAT,
        startLng: ISRAEL_LNG,
        endLat: selectedDest.lat,
        endLng: selectedDest.lng,
        color: STATE_COLORS.pin,
      });
    }

    return base;
  }, [destinations, ceremonyPhase, selectedDest]);

  const htmlData = useMemo<HtmlPoint[]>(() => {
    const pinVisible = showPin(ceremonyPhase) && selectedDest;
    const points: HtmlPoint[] = [
      ...destinations.filter(d => !(pinVisible && d.id === selectedDest?.id)),
      { id: '__israel__', lat: ISRAEL_LAT, lng: ISRAEL_LNG },
    ];
    if (pinVisible && selectedDest) {
      points.push({ id: '__pin__', lat: selectedDest.lat, lng: selectedDest.lng });
    }
    return points;
  }, [destinations, ceremonyPhase, selectedDest]);

  const getHtmlElement = useCallback((d: object) => {
    const point = d as HtmlPoint;
    const el = document.createElement('div');

    if (point.id === '__israel__') {
      el.style.cssText = [
        'width:28px', 'height:28px', 'border-radius:50%',
        `background:${STATE_COLORS.israel}`,
        'border:2.5px solid white',
        `box-shadow:0 0 12px ${STATE_COLORS.israel},0 0 24px ${STATE_COLORS.israel}88`,
        'display:flex', 'align-items:center', 'justify-content:center',
        'font-size:13px', 'cursor:default', 'user-select:none',
      ].join(';');
      el.textContent = '✈';
      el.title = 'ישראל — בית';
      return el;
    }

    if (point.id === '__pin__') {
      el.className = 'globe-pin';
      el.textContent = '📍';
      return el;
    }

    const dest = point as Destination;
    if (dest.starred) {
      el.className = 'globe-starred-dot';
      el.textContent = '★';
    } else {
      el.className = `globe-${dest.state}-dot`;
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedIdRef.current(prev => (prev === dest.id ? null : dest.id));
    });

    return el;
  }, []);

  const handleGlobeReady = useCallback(() => {
    if (!globeRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controls = globeRef.current.controls() as any;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = true;
    controls.minDistance = 150;
    controls.maxDistance = 700;
    globeRef.current.pointOfView({ lat: 25, lng: 20, altitude: 2.5 }, 0);
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      style={{ width: '100vw', height: '100vh', background: 'var(--night)' }}
      onClick={() => setSelectedId(null)}
    >
      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        globeImageUrl="/globe/earth-blue-marble.jpg"
        backgroundImageUrl="/globe/night-sky.png"
        onGlobeReady={handleGlobeReady}
        htmlElementsData={htmlData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={0.02}
        htmlElement={getHtmlElement}
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcAltitude={0.25}
        arcStroke={1.5}
        arcDashLength={0.5}
        arcDashGap={0.5}
        arcDashAnimateTime={2500}
      />

      {/* Title — only in idle */}
      {ceremonyPhase === 'idle' && (
        <div className="fixed top-3 sm:top-6 left-0 right-0 flex justify-center z-40 pointer-events-none px-4">
          <AnimatedText
            text="מותק לאן טסים היום?"
            duration={0.05}
            delay={0.08}
            className="max-w-[calc(100vw-2rem)]"
            textClassName="font-airline text-[clamp(1.25rem,6vw,1.65rem)] sm:text-2xl text-white drop-shadow-lg"
            underlineGradient="from-amber-400 via-yellow-300 to-amber-400"
            underlineHeight="h-0.5"
            underlineOffset="-bottom-1"
          />
        </div>
      )}

      {/* Destination tooltip — only in idle */}
      {selected && ceremonyPhase === 'idle' && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 passport-card px-5 py-4 max-w-xs w-full"
          style={{ direction: 'rtl' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-airline text-lg leading-tight text-[color:var(--ink)]">{selected.nameHe}</p>
              <p className="font-stamp text-[color:var(--stamp-blue)] text-sm">{selected.nameEn}</p>
              {selected.tagline && (
                <p className="text-[color:var(--ink-muted)] text-xs mt-1">{selected.tagline}</p>
              )}
              {selected.state !== 'dream' && (
                <p className="font-stamp text-xs mt-1.5"
                  style={{ color: STATE_COLORS[selected.state] }}
                >
                  {selected.state === 'booked' ? '✈ הזמנה' : '✓ ביקרנו'}
                </p>
              )}
            </div>
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
              style={{
                background: selected.starred
                  ? STATE_COLORS.starred
                  : STATE_COLORS[selected.state],
              }}
            />
          </div>
        </div>
      )}

      {/* Filter bar — only in idle */}
      {ceremonyPhase === 'idle' && (
        <FilterBar
          activeVibes={activeVibes}
          activeState={activeState}
          onVibeToggle={onVibeToggle}
          onStateChange={onStateChange}
          onReset={onResetFilters}
        />
      )}

      {/* Bottom bar — hidden during ceremony */}
      {ceremonyPhase === 'idle' && (
        <div className="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-40 pointer-events-none px-4">
          {lotteryPoolEmpty && (
            <p
              className="pointer-events-none text-[color:var(--paper)] text-sm font-bold bg-black/45 rounded-xl px-4 py-2"
              style={{ direction: 'rtl' }}
            >
              אין יעדים שמתאימים לסינון
            </p>
          )}
          <div className="flex justify-center items-center gap-2 w-full">
            <button
              type="button"
              className="pointer-events-auto ticket-action-secondary text-sm font-bold px-3 whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                onAddDestination();
              }}
            >
              + הוסף
            </button>
            <button
              type="button"
              disabled={lotteryPoolEmpty}
              className={[
                'pointer-events-auto font-airline text-lg px-8 py-3.5 rounded-xl transition-all',
                lotteryPoolEmpty
                  ? 'bg-slate-900/70 text-white/30 cursor-not-allowed'
                  : 'bg-[color:var(--gold)] hover:bg-amber-300 active:scale-95 text-[color:var(--ink)] shadow-lg cursor-pointer',
              ].join(' ')}
              onClick={(e) => {
                e.stopPropagation();
                if (!lotteryPoolEmpty) onLottery();
              }}
            >
              לאן טסים?
            </button>
            <button
              type="button"
              className="pointer-events-auto ticket-action-secondary text-sm font-bold px-3 whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPassport();
              }}
            >
              📔 דרכון
            </button>
          </div>
        </div>
      )}

      {/* Legend — only in idle */}
      {ceremonyPhase === 'idle' && (
        <div
          className="fixed top-16 sm:top-4 right-3 sm:right-4 z-40 flex flex-col gap-1.5 font-stamp text-[0.68rem] sm:text-xs text-white/75 bg-black/35 rounded-xl p-2.5 sm:p-3"
          style={{ direction: 'rtl' }}
        >
          {(
            [
              ['dream', 'חלום'],
              ['starred', 'מועדף'],
              ['booked', 'הזמנה'],
              ['visited', 'ביקרנו'],
            ] as [string, string][]
          ).map(([state, label]) => (
            <div key={state} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: STATE_COLORS[state] }}
              />
              {label}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATE_COLORS.israel }} />
            בית ✈
          </div>
        </div>
      )}
    </div>
  );
}
