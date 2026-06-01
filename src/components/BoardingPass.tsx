import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Destination, DestinationState } from '../data/destinations';
import { usePassportStore } from '../store/passportStore';

interface Props {
  destination: Destination;
  onReroll: () => void;
  onSave: (state: DestinationState) => void;
  onShare: () => void;
  onToggleStar: () => void;
}

interface WikiData {
  summary: string;
  imageUrl: string | null;
}

type SaveState = 'idle' | 'picking' | 'saved';

export default function BoardingPass({ destination, onReroll, onSave, onShare, onToggleStar }: Props) {
  const [wiki, setWiki] = useState<WikiData | null>(null);
  const [wikiLoading, setWikiLoading] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const updateDestination = usePassportStore(s => s.updateDestination);

  useEffect(() => {
    setSummaryOpen(false);
    setSaveState('idle');

    if (destination.imageUrl || destination.wikiSummary) {
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
        const imageUrl: string | null = data.thumbnail?.source ?? null;
        const wikiSummary: string = data.extract || '';
        setWiki({ summary: wikiSummary, imageUrl });
        updateDestination(destination.id, { imageUrl: imageUrl ?? undefined, wikiSummary: wikiSummary || undefined });
      })
      .catch(() => {
        setWiki({ summary: '', imageUrl: null });
      })
      .finally(() => setWikiLoading(false));
  }, [destination.id, destination.imageUrl, destination.wikiSummary, updateDestination]);

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
      <div className="boarding-pass-ticket mx-1 pb-8 sm:mx-auto sm:max-w-2xl">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-900/20" />
        </div>

        {/* Airline header */}
        <div
          className="ticket-perforation flex items-center justify-between px-6 py-3"
          style={{ direction: 'rtl' }}
        >
          <div>
            <p className="artifact-label text-xs">נוסעים</p>
            <p className="font-airline text-base">מור & אייל</p>
          </div>
          <p className="font-stamp text-sm text-[color:var(--stamp-red)]">MOR AIRLINES</p>
          <div className="text-left">
            <p className="artifact-label text-xs">מושב</p>
            <p className="font-airline text-base">2A — חלון</p>
          </div>
        </div>

        {/* Destination heading */}
        <div className="px-6 pt-5 pb-3 text-center relative">
          <p className="artifact-label text-xs mb-1">יעד</p>
          <p className="font-airline leading-none text-[2.7rem] sm:text-[3.35rem]">
            {destination.nameHe}
          </p>
          <p className="font-stamp mt-1 text-sm text-[color:var(--stamp-blue)]">{destination.nameEn}</p>
          {destination.tagline && (
            <p className="text-[color:var(--ink-muted)] text-sm mt-2">{destination.tagline}</p>
          )}
          <button
            type="button"
            onClick={onToggleStar}
            className="absolute top-5 left-4 text-2xl leading-none transition-all active:scale-90 select-none"
            style={{ color: destination.starred ? 'oklch(0.58 0.22 355)' : 'color-mix(in oklch, var(--ink-muted) 36%, transparent)' }}
            aria-label={destination.starred ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            ★
          </button>
        </div>

        {/* Wiki image */}
        <div className="px-6 mb-4">
          {wikiLoading ? (
            <div className="ticket-image-frame h-40 rounded-xl flex items-center justify-center animate-pulse">
              <p className="text-[color:var(--ink-muted)] text-sm">טוען תמונה...</p>
            </div>
          ) : wiki?.imageUrl ? (
            <img
              src={wiki.imageUrl}
              alt={destination.nameEn}
              className="ticket-image-frame w-full h-44 object-cover rounded-xl"
            />
          ) : (
            <div className="ticket-image-frame h-32 rounded-xl flex items-center justify-center">
              <p className="text-[color:var(--ink-muted)] text-sm">אין תמונה זמינה</p>
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
            <div key={label} className="ticket-tile p-3 text-center">
              <p className="artifact-label text-xs mb-1">{label}</p>
              <p className="text-[color:var(--ink)] text-xs font-bold leading-snug">{value || '—'}</p>
            </div>
          ))}
        </div>

        {/* State picker — slides in when saving */}
        {saveState === 'picking' && (
          <div className="px-6 mb-4">
            <div className="ticket-tile p-4">
              <p className="text-[color:var(--ink-muted)] text-sm text-center mb-3">שמור לדרכון כ:</p>
              <div className="flex gap-2">
                {!alreadyBooked && (
                  <button
                    type="button"
                    className="ticket-action-secondary flex-1 text-sm font-bold"
                    onClick={() => handleSaveChoice('booked')}
                  >
                    הזמנתי
                  </button>
                )}
                <button
                  type="button"
                  className="ticket-action-secondary flex-1 text-sm font-bold"
                  onClick={() => handleSaveChoice('visited')}
                >
                  ביקרנו
                </button>
              </div>
              <button
                type="button"
                className="w-full mt-2 text-[color:var(--ink-muted)] text-xs py-1.5"
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
            <div className="ticket-tile p-4">
              {wikiLoading ? (
                <p className="text-[color:var(--ink-muted)] text-sm text-center">טוען...</p>
              ) : wiki?.summary ? (
                <p className="text-[color:var(--ink-muted)] text-sm leading-relaxed">{wiki.summary}</p>
              ) : (
                <p className="text-[color:var(--ink-muted)] text-sm text-center">אין מידע זמין</p>
              )}
            </div>
          </div>
        )}

        {/* Action row */}
        <div className="px-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onReroll}
            className="ticket-action-primary text-sm font-bold"
          >
            טוס שוב
          </button>

          {saveState === 'saved' ? (
            <div className="ticket-action-success text-sm font-bold flex items-center justify-center">
              נשמר לדרכון
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSaveState('picking')}
              className="ticket-action-secondary text-sm font-bold"
            >
              שמור לדרכון
            </button>
          )}

          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            className="ticket-action-secondary text-sm font-bold"
          >
            {summaryOpen ? 'סגור' : 'ספר לי עוד'}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="ticket-action-secondary text-sm font-bold"
          >
            שתף
          </button>
        </div>
      </div>
    </motion.div>
  );
}
