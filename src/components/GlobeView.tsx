import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { seedDestinations, Destination } from '../data/destinations';

const ISRAEL_LAT = 31.7683;
const ISRAEL_LNG = 35.2137;

const STATE_COLORS: Record<string, string> = {
  dream: '#FFD700',
  starred: '#FF69B4',
  booked: '#38BDF8',
  visited: '#4ADE80',
  israel: '#FF6B35',
};

type ArcRow = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
};

type HtmlPoint = Destination | { id: '__israel__'; lat: number; lng: number };

export default function GlobeView({ onLottery }: { onLottery: () => void }) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [selected, setSelected] = useState<Destination | null>(null);
  const setSelectedRef = useRef(setSelected);
  setSelectedRef.current = setSelected;

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const arcsData = useMemo<ArcRow[]>(
    () =>
      seedDestinations
        .filter((d) => d.state === 'booked' || d.state === 'visited')
        .map((d) => ({
          startLat: ISRAEL_LAT,
          startLng: ISRAEL_LNG,
          endLat: d.lat,
          endLng: d.lng,
          color: d.state === 'booked' ? STATE_COLORS.booked : STATE_COLORS.visited,
        })),
    [],
  );

  const htmlData = useMemo<HtmlPoint[]>(
    () => [
      ...seedDestinations,
      { id: '__israel__', lat: ISRAEL_LAT, lng: ISRAEL_LNG },
    ],
    [],
  );

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

    const dest = point as Destination;
    if (dest.starred) {
      el.className = 'globe-starred-dot';
      el.textContent = '★';
    } else {
      el.className = `globe-${dest.state}-dot`;
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      setSelectedRef.current((prev) => (prev?.id === dest.id ? null : dest));
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
      style={{ width: '100vw', height: '100vh', background: '#060614' }}
      onClick={() => setSelected(null)}
    >
      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
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

      {/* Destination tooltip */}
      {selected && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm text-white rounded-2xl px-5 py-4 shadow-2xl max-w-xs w-full"
          style={{ direction: 'rtl' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-lg leading-tight">{selected.nameHe}</p>
              <p className="text-white/50 text-sm">{selected.nameEn}</p>
              {selected.tagline && (
                <p className="text-white/60 text-xs mt-1">{selected.tagline}</p>
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

      {/* לאן טסים? */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 pointer-events-none">
        <button
          type="button"
          className="pointer-events-auto bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white font-bold text-xl px-12 py-4 rounded-2xl shadow-lg shadow-indigo-500/30 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onLottery();
          }}
        >
          לאן טסים?
        </button>
      </div>

      {/* Legend */}
      <div
        className="fixed top-4 right-4 z-40 flex flex-col gap-1.5 text-xs text-white/70 bg-black/30 backdrop-blur-sm rounded-xl p-3"
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
    </div>
  );
}
