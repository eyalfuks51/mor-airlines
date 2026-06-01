import { ReactNode, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Destination } from '../data/destinations';
import { usePassportStore } from '../store/passportStore';
import { seedDestinations } from '../data/destinations';
import DestinationModal, { ModalFormData } from './DestinationModal';
import { fetchWikiData } from '../hooks/wikiData';

interface Props {
  destinations: Destination[];
  onBack: () => void;
}

export default function PassportView({ destinations, onBack }: Props) {
  const { setDestState, toggleStarred, setTravelDate, setVisitedDate, setPersonalNote, updateDestination, deleteDestination } =
    usePassportStore();

  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  const visited = destinations.filter(d => d.state === 'visited');
  const booked = destinations.filter(d => d.state === 'booked');
  const dream = destinations.filter(d => d.state === 'dream');
  const starred = destinations.filter(d => d.starred);

  const isSeed = useCallback(
    (id: string) => seedDestinations.some(d => d.id === id),
    [],
  );

  const handleEditSave = useCallback(async (data: ModalFormData) => {
    if (!editingDest) return;
    const nameEnChanged = editingDest.nameEn !== data.nameEn;
    let wikiUpdate: { imageUrl?: string; wikiSummary?: string } = {};
    if (nameEnChanged) {
      const wiki = await fetchWikiData(data.nameEn).catch(() => null);
      if (wiki) {
        wikiUpdate = {
          imageUrl: wiki.imageUrl ?? undefined,
          wikiSummary: wiki.wikiSummary || undefined,
        };
      }
    }
    updateDestination(editingDest.id, {
      nameHe: data.nameHe,
      nameEn: data.nameEn,
      tagline: data.tagline || undefined,
      localDish: data.localDish || undefined,
      bestSeason: data.bestSeason || undefined,
      whyHere: data.whyHere || undefined,
      vibeTags: data.vibeTags,
      lat: data.lat,
      lng: data.lng,
      ...wikiUpdate,
    });
    setEditingDest(null);
  }, [editingDest, updateDestination]);

  const handleDelete = useCallback(() => {
    if (!editingDest) return;
    deleteDestination(editingDest.id);
    setEditingDest(null);
  }, [editingDest, deleteDestination]);

  return (
    <div
      className="passport-page overflow-y-auto"
      style={{ direction: 'rtl' }}
    >
      {/* Sticky header */}
      <div className="passport-header sticky top-0 z-10">
        <div className="flex items-center px-4 py-3 gap-2">
          <button
            type="button"
            onClick={onBack}
            className="text-[color:var(--gold)] font-bold text-sm whitespace-nowrap"
          >
            חזרה לגלובוס
          </button>
          <h1 className="font-stamp flex-1 text-center text-lg text-[color:var(--paper)]">הדרכון שלנו</h1>
          <div className="w-28 flex-shrink-0" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-lg mx-auto pb-12">
        {/* היינו — visited */}
        <Section
          title="היינו"
          icon="חותמות"
          count={visited.length}
          empty="עדיין לא ביקרתם בשום מקום — בקרוב!"
        >
          {visited.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              stampLabel="ביקרנו"
              stampColor="stamp-green"
              onToggleStar={() => toggleStarred(d.id)}
              onEdit={() => setEditingDest(d)}
            >
              <FieldRow label="תאריך ביקור">
                <input
                  type="date"
                  dir="ltr"
                  value={d.visitedDate ?? ''}
                  onChange={e => setVisitedDate(d.id, e.target.value)}
                  className="passport-input"
                />
              </FieldRow>
              <FieldRow label="זיכרון אישי">
                <textarea
                  value={d.personalNote ?? ''}
                  onChange={e => setPersonalNote(d.id, e.target.value)}
                  placeholder="כתוב/י זיכרון קטן מהטיול..."
                  rows={2}
                  className="passport-input resize-none"
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
              stampLabel="הזמנה"
              stampColor="stamp-blue"
              onToggleStar={() => toggleStarred(d.id)}
              onEdit={() => setEditingDest(d)}
            >
              <FieldRow label="תאריך יציאה">
                <input
                  type="date"
                  dir="ltr"
                  value={d.travelDate ?? ''}
                  onChange={e => setTravelDate(d.id, e.target.value)}
                  className="passport-input"
                />
              </FieldRow>
              <button
                type="button"
                onClick={() => setDestState(d.id, 'visited')}
                className="passport-action-green w-full mt-3"
              >
                ביקרנו, העבר לזיכרונות
              </button>
            </DestCard>
          ))}
        </Section>

        {/* חלומות — dream */}
        <Section
          title="חלומות"
          icon="יעדים"
          count={dream.length}
          empty={
            visited.length + booked.length === destinations.length
              ? 'כל החלומות הושגו!'
              : 'אין יעדי חלום עדיין'
          }
        >
          {dream.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              onToggleStar={() => toggleStarred(d.id)}
              onEdit={() => setEditingDest(d)}
            >
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setDestState(d.id, 'booked')}
                  className="passport-action-blue flex-1"
                >
                  הזמנתי
                </button>
                <button
                  type="button"
                  onClick={() => setDestState(d.id, 'visited')}
                  className="passport-action-green flex-1"
                >
                  ביקרנו
                </button>
              </div>
            </DestCard>
          ))}
        </Section>

        {/* דקור — starred */}
        <Section
          title="מועדפים"
          icon="דקורים"
          count={starred.length}
          empty="לא הוספתם מועדפים עדיין — לחצו על ★ בכל יעד"
        >
          {starred.map(d => (
            <DestCard
              key={d.id}
              dest={d}
              stampLabel={
                d.state === 'visited' ? 'ביקרנו' : d.state === 'booked' ? 'הזמנה' : 'חלום'
              }
              stampColor={
                d.state === 'visited'
                  ? 'stamp-green'
                  : d.state === 'booked'
                  ? 'stamp-blue'
                  : 'stamp-gold'
              }
              onToggleStar={() => toggleStarred(d.id)}
              onEdit={() => setEditingDest(d)}
            />
          ))}
        </Section>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editingDest && (
          <DestinationModal
            key={editingDest.id}
            mode="edit"
            destination={editingDest}
            onClose={() => setEditingDest(null)}
            onSave={handleEditSave}
            onDelete={!isSeed(editingDest.id) ? handleDelete : undefined}
          />
        )}
      </AnimatePresence>
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
        <h2 className="font-airline text-[color:var(--paper)] text-lg">{title}</h2>
        <span className="font-stamp text-[color:var(--gold)] text-sm">{icon}</span>
        {count > 0 && (
          <span className="rounded-full border border-white/15 bg-white/10 text-white/70 text-xs px-2 py-0.5">
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <p className="passport-empty text-sm text-center py-6">
          {empty}
        </p>
      ) : (
        <div className="space-y-3">{children}</div>
      )}
    </div>
  );
}

function DestCard({
  dest, stampLabel, stampColor, onToggleStar, onEdit, children,
}: {
  dest: Destination;
  stampLabel?: string;
  stampColor?: string;
  onToggleStar: () => void;
  onEdit: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="passport-card p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <p className="font-airline text-base leading-tight text-[color:var(--ink)]">{dest.nameHe}</p>
          <p className="font-stamp text-[color:var(--stamp-blue)] text-xs mt-0.5">{dest.nameEn}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {stampLabel && (
            <span className={`stamp-pill ${stampColor}`}>
              {stampLabel}
            </span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="font-stamp text-xs leading-none transition-all active:scale-90 select-none text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] px-1"
            aria-label="ערוך יעד"
          >
            ערוך
          </button>
          <button
            type="button"
            onClick={onToggleStar}
            className="text-xl leading-none transition-all active:scale-90 select-none"
            style={{ color: dest.starred ? 'oklch(0.58 0.22 355)' : 'color-mix(in oklch, var(--ink-muted) 36%, transparent)' }}
            aria-label={dest.starred ? 'הסר ממועדפים' : 'הוסף למועדפים'}
          >
            ★
          </button>
        </div>
      </div>
      {dest.tagline && (
        <p className="text-[color:var(--ink-muted)] text-xs mt-0.5">{dest.tagline}</p>
      )}
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-2">
      <p className="artifact-label text-xs mb-1">{label}</p>
      {children}
    </div>
  );
}
