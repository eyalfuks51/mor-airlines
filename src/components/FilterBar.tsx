import { VibeTag, DestinationState } from '../data/destinations';

const VIBE_LABELS: Record<VibeTag, string> = {
  beach: 'חוף',
  city: 'עיר',
  adventure: 'הרפתקה',
  food: 'אוכל',
  far: 'רחוק',
  near: 'קרוב',
};

const STATE_OPTIONS: Array<{ value: DestinationState | 'all'; label: string }> = [
  { value: 'all', label: 'הכל' },
  { value: 'dream', label: 'חלומות' },
  { value: 'booked', label: 'הזמנות' },
  { value: 'visited', label: 'ביקרנו' },
];

interface Props {
  activeVibes: VibeTag[];
  activeState: DestinationState | 'all';
  onVibeToggle: (vibe: VibeTag) => void;
  onStateChange: (state: DestinationState | 'all') => void;
  onReset: () => void;
}

const ALL_VIBES: VibeTag[] = ['beach', 'city', 'adventure', 'food', 'far', 'near'];

export default function FilterBar({ activeVibes, activeState, onVibeToggle, onStateChange, onReset }: Props) {
  const hasFilters = activeVibes.length > 0 || activeState !== 'all';

  return (
    <div
      className="fixed z-40 left-0 right-0 flex flex-col items-center gap-2 px-3 pointer-events-none"
      style={{ bottom: '7rem', direction: 'rtl' }}
    >
      {/* Vibe chips */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
        {ALL_VIBES.map(vibe => {
          const active = activeVibes.includes(vibe);
          return (
            <button
              key={vibe}
              type="button"
              onClick={(e) => { e.stopPropagation(); onVibeToggle(vibe); }}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 pointer-events-auto',
                active
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                  : 'bg-black/40 text-white/60 border border-white/15 backdrop-blur-sm',
              ].join(' ')}
            >
              {VIBE_LABELS[vibe]}
            </button>
          );
        })}
      </div>

      {/* State filter + reset */}
      <div className="flex items-center gap-1.5 justify-center flex-wrap">
        {STATE_OPTIONS.map(opt => {
          const active = activeState === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={(e) => { e.stopPropagation(); onStateChange(opt.value); }}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 pointer-events-auto',
                active
                  ? 'bg-white/20 text-white border border-white/40'
                  : 'bg-black/30 text-white/50 border border-white/10 backdrop-blur-sm',
              ].join(' ')}
            >
              {opt.label}
            </button>
          );
        })}
        {hasFilters && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReset(); }}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-rose-400 border border-rose-400/30 bg-rose-500/10 backdrop-blur-sm active:scale-95 pointer-events-auto transition-all"
          >
            × איפוס
          </button>
        )}
      </div>
    </div>
  );
}
