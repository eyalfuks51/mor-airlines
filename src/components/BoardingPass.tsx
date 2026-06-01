import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Destination, DestinationState } from '../data/destinations';

interface Props {
  destination: Destination;
  onReroll: () => void;
  onSave: (state: DestinationState) => void;
  onShare: () => void;
}

interface WikiData {
  summary: string;
  imageUrl: string | null;
}

type SaveState = 'idle' | 'picking' | 'saved';

export default function BoardingPass({ destination, onReroll, onSave, onShare }: Props) {
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [wikiLoading, setWikiLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  useEffect(() => {
    setSummaryOpen(false);
    setSaveState('idle');

    // Use cached wiki data for user destinations
    if (destination.source === 'user' && (destination.imageUrl || destination.wikiSummary)) {
      setWiki({
        summary: destination.wikiSummary ?? '',
        imageUrl: destination.imageUrl ?? null,
      });
      setWikiLoading(false);
      return;
    }

    setWikiLoading(true);
    setWiki(null);
    const slug = encodeURIComponent(destination.nameEn.replace(/ /g, '_'));
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((data) => {
        setWiki({
          summary: data.extract || '',
          imageUrl: data.thumbnail?.source ?? null,
        });
      })
      .catch(() => {
        setWiki({ summary: '', imageUrl: null });
      })
      .finally(() => setWikiLoading(false));
  }, [destination.id, destination.imageUrl, destination.wikiSummary]);

  const handleSaveChoice = (state: DestinationState) => {
    onSave(state);
    setSaveState('saved');
  };

  const alreadyBooked = destination.state === 'booked';

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ direction: 'rtl', maxHeight: '80vh', overflowY: 'auto' }}
    >
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-t-3xl shadow-2xl mx-1 pb-8 border-t border-white/10">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Airline header */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b border-white/10"
          style={{ direction: 'rtl' }}
        >
          <div>
            <p className="text-white/40 text-xs">נוסעים</p>
            <p className="text-white font-bold text-base">מור & אייל</p>
          </div>
          <p className="text-indigo-400 text-xs font-mono tracking-wider">✈ MOR AIRLINES</p>
          <div className="text-left">
            <p className="text-white/40 text-xs">מושב</p>
            <p className="text-white font-bold text-base">2A — חלון</p>
          </div>
        </div>

        {/* Destination heading */}
        <div className="px-6 pt-5 pb-3 text-center">
          <p className="text-white/50 text-xs mb-1 tracking-widest uppercase">יעד</p>
          <p className="text-white font-black leading-none" style={{ fontSize: 'clamp(2rem, 9vw, 3.5rem)' }}>
            {destination.nameHe}
          </p>
          <p className="text-indigo-400 font-mono mt-1 text-sm">{destination.nameEn}</p>
          {destination.tagline && (
            <p className="text-white/50 text-xs mt-2 italic">{destination.tagline}</p>
          )}
        </div>

        {/* Wiki image */}
        <div className="px-6 mb-4">
          {wikiLoading ? (
            <div className="h-40 bg-white/5 rounded-2xl flex items-center justify-center animate-pulse">
              <p className="text-white/30 text-sm">טוען תמונה...</p>
            </div>
          ) : wiki?.imageUrl ? (
            <img
              src={wiki.imageUrl}
              alt={destination.nameEn}
              className="w-full h-44 object-cover rounded-2xl"
            />
          ) : (
            <div className="h-32 bg-white/5 rounded-2xl flex items-center justify-center">
              <p className="text-white/25 text-sm">אין תמונה זמינה</p>
            </div>
          )}
        </div>

        {/* Details grid */}
        <div className="px-6 grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'מנה מקומית', value: destination.localDish },
            { label: 'עונה מומלצת', value: destination.bestSeason },
            { label: 'למה כאן', value: destination.whyHere },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
              <p className="text-white/35 text-xs mb-1">{label}</p>
              <p className="text-white/85 text-xs font-medium leading-snug">{value || '—'}</p>
            </div>
          ))}
        </div>

        {/* State picker — slides in when saving */}
        {saveState === 'picking' && (
          <div className="px-6 mb-4">
            <div className="bg-indigo-900/60 rounded-2xl p-4 border border-indigo-500/30">
              <p className="text-white/70 text-sm text-center mb-3">שמור לדרכון כ:</p>
              <div className="flex gap-2">
                {!alreadyBooked && (
                  <button
                    type="button"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all text-white py-2.5 rounded-xl text-sm font-bold"
                    onClick={() => handleSaveChoice('booked')}
                  >
                    ✈ הזמנתי!
                  </button>
                )}
                <button
                  type="button"
                  className="flex-1 bg-green-600 hover:bg-green-500 active:scale-95 transition-all text-white py-2.5 rounded-xl text-sm font-bold"
                  onClick={() => handleSaveChoice('visited')}
                >
                  ✅ ביקרנו!
                </button>
              </div>
              <button
                type="button"
                className="w-full mt-2 text-white/40 text-xs py-1.5"
                onClick={() => setSaveState('idle')}
              >
                ביטול
              </button>
            </div>
          </div>
        )}

        {/* Expandable wiki summary */}
        {summaryOpen && (
          <div className="px-6 mb-4">
            <div className="bg-white/5 rounded-xl p-4">
              {wikiLoading ? (
                <p className="text-white/30 text-sm text-center">טוען...</p>
              ) : wiki?.summary ? (
                <p className="text-white/65 text-sm leading-relaxed">{wiki.summary}</p>
              ) : (
                <p className="text-white/30 text-sm text-center">אין מידע זמין</p>
              )}
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="px-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onReroll}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-white text-sm font-bold py-3.5 rounded-xl"
          >
            ✈ טוס שוב
          </button>

          {saveState === 'saved' ? (
            <div className="bg-green-600/20 text-green-400 text-sm font-bold py-3.5 rounded-xl flex items-center justify-center">
              ✓ נשמר לדרכון!
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSaveState('picking')}
              className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white text-sm font-bold py-3.5 rounded-xl"
            >
              🌍 שמור לדרכון
            </button>
          )}

          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white text-sm font-bold py-3.5 rounded-xl"
          >
            {summaryOpen ? '▲ סגור' : '📖 ספר לי עוד'}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white text-sm font-bold py-3.5 rounded-xl"
          >
            💬 שתף
          </button>
        </div>
      </div>
    </motion.div>
  );
}
