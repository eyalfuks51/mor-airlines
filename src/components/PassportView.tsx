import { ReactNode } from 'react';
import { Destination } from '../data/destinations';
import { usePassportStore } from '../store/passportStore';

interface Props {
  destinations: Destination[];
  onBack: () => void;
}

export default function PassportView({ destinations, onBack }: Props) {
  const { setDestState, toggleStarred, setTravelDate, setVisitedDate, setPersonalNote } =
    usePassportStore();

  const visited = destinations.filter(d => d.state === 'visited');
  const booked = destinations.filter(d => d.state === 'booked');
  const dream = destinations.filter(d => d.state === 'dream');
  const starred = destinations.filter(d => d.starred);

  return (
    <div
      className="min-h-screen bg-slate-950 text-white overflow-y-auto"
      style={{ direction: 'rtl' }}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center px-4 py-3 gap-2">
          <button
            type="button"
            onClick={onBack}
            className="text-indigo-400 font-medium text-sm whitespace-nowrap"
          >
            🌍 חזרה לגלובוס
          </button>
          <h1 className="flex-1 text-center font-bold text-base">✈ הדרכון שלנו</h1>
          <div className="w-28 flex-shrink-0" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto pb-12">
        {/* היינו — visited */}
        <Section
          title="היינו"
          icon="🌍"
          count={visited.length}
          empty="עדיין לא ביקרתם בשום מקום — בקרוב!"
        >
          {visited.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              stampLabel="✓ ביקרנו"
              stampColor="text-green-400 bg-green-400/15 border-green-400/30"
              onToggleStar={() => toggleStarred(d.id)}
            >
              <FieldRow label="תאריך ביקור">
                <input
                  type="date"
                  dir="ltr"
                  value={d.visitedDate ?? ''}
                  onChange={e => setVisitedDate(d.id, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-indigo-500"
                />
              </FieldRow>
              <FieldRow label="זיכרון אישי">
                <textarea
                  value={d.personalNote ?? ''}
                  onChange={e => setPersonalNote(d.id, e.target.value)}
                  placeholder="כתוב/י זיכרון קטן מהטיול..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-indigo-500 placeholder:text-white/25"
                />
              </FieldRow>
            </DestCard>
          ))}
        </Section>

        {/* מסלול — booked */}
        <Section
          title="מסלול הטיסות"
          icon="✈"
          count={booked.length}
          empty="אין טיסות מתוכננות עדיין"
        >
          {booked.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              stampLabel="✈ הזמנה"
              stampColor="text-blue-400 bg-blue-400/15 border-blue-400/30"
              onToggleStar={() => toggleStarred(d.id)}
            >
              <FieldRow label="תאריך יציאה">
                <input
                  type="date"
                  dir="ltr"
                  value={d.travelDate ?? ''}
                  onChange={e => setTravelDate(d.id, e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm w-full focus:outline-none focus:border-indigo-500"
                />
              </FieldRow>
              <button
                type="button"
                onClick={() => setDestState(d.id, 'visited')}
                className="w-full mt-3 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 text-sm font-bold py-2.5 rounded-xl transition-all active:scale-95"
              >
                ✅ ביקרנו! — העבר לזיכרונות
              </button>
            </DestCard>
          ))}
        </Section>

        {/* חלומות — dream */}
        <Section
          title="חלומות"
          icon="💫"
          count={dream.length}
          empty={
            visited.length + booked.length === destinations.length
              ? 'כל החלומות הושגו! 🎉'
              : 'אין יעדי חלום עדיין'
          }
        >
          {dream.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              onToggleStar={() => toggleStarred(d.id)}
            >
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setDestState(d.id, 'booked')}
                  className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-400/30 text-blue-400 text-sm font-bold py-2.5 rounded-xl transition-all active:scale-95"
                >
                  ✈ הזמנתי!
                </button>
                <button
                  type="button"
                  onClick={() => setDestState(d.id, 'visited')}
                  className="flex-1 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 text-green-400 text-sm font-bold py-2.5 rounded-xl transition-all active:scale-95"
                >
                  ✅ ביקרנו!
                </button>
              </div>
            </DestCard>
          ))}
        </Section>

        {/* דקור — starred */}
        <Section
          title="מועדפים"
          icon="★"
          count={starred.length}
          empty="לא הוספתם מועדפים עדיין — לחצו על ★ בכל יעד"
        >
          {starred.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              stampLabel={
                d.state === 'visited' ? '✓ ביקרנו' : d.state === 'booked' ? '✈ הזמנה' : '💫 חלום'
              }
              stampColor={
                d.state === 'visited'
                  ? 'text-green-400 bg-green-400/15 border-green-400/30'
                  : d.state === 'booked'
                  ? 'text-blue-400 bg-blue-400/15 border-blue-400/30'
                  : 'text-yellow-400 bg-yellow-400/15 border-yellow-400/30'
              }
              onToggleStar={() => toggleStarred(d.id)}
            />
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title, icon, count, empty, children,
}: {
  title: string;
  icon: string;
  count: number;
  empty: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h2 className="text-white font-bold text-lg">{title}</h2>
        {count > 0 && (
          <span className="bg-white/10 text-white/50 text-xs px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <p className="text-white/30 text-sm text-center py-6 bg-white/[0.03] rounded-2xl border border-white/5">
          {empty}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function DestCard({
  dest, stampLabel, stampColor, onToggleStar, children,
}: {
  dest: Destination;
  stampLabel?: string;
  stampColor?: string;
  onToggleStar: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="bg-white/[0.05] rounded-2xl p-4 border border-white/[0.08]">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base leading-tight text-white">{dest.nameHe}</p>
          <p className="text-white/45 text-xs mt-0.5">{dest.nameEn}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          {stampLabel && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${stampColor}`}>
              {stampLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onToggleStar}
            className="text-xl leading-none transition-all active:scale-90 select-none"
            style={{ color: dest.starred ? '#FF69B4' : 'rgba(255,255,255,0.2)' }}
            aria-label={dest.starred ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            ★
          </button>
        </div>
      </div>
      {dest.tagline && (
        <p className="text-white/35 text-xs italic mt-0.5">{dest.tagline}</p>
      )}
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-2">
      <p className="text-white/35 text-xs mb-1">{label}</p>
      {children}
    </div>
  );
}
