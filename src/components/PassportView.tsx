import { ReactNode, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Destination, DestinationState } from '../data/destinations';
import { usePassportStore } from '../store/passportStore';
import { seedDestinations } from '../data/destinations';
import DestinationModal, { ModalFormData } from './DestinationModal';
import { fetchWikiData } from '../hooks/wikiData';

interface Props {
  destinations: Destination[];
  onBack: () => void;
}

type PassportPage = 'all' | 'visited' | 'booked' | 'dream' | 'starred';

const STATE_COPY: Record<DestinationState, { label: string; className: string; eyebrow: string }> = {
  dream: { label: 'חלום', className: 'stamp-gold', eyebrow: 'יעד חלום' },
  booked: { label: 'הוזמנה', className: 'stamp-blue', eyebrow: 'מסלול טיסה' },
  visited: { label: 'ביקרנו', className: 'stamp-green', eyebrow: 'חותמת זיכרון' },
};

const PAGE_COPY: Record<PassportPage, { label: string; tabLabel: string; subtitle: string; empty: string }> = {
  all: {
    label: 'כל החותמות',
    tabLabel: 'הכל',
    subtitle: 'כל היעדים בדרכון הזוגי',
    empty: 'עדיין אין חותמות בדרכון',
  },
  visited: {
    label: 'היינו',
    tabLabel: 'היינו',
    subtitle: 'חותמות שכבר הפכו לזיכרון',
    empty: 'עוד לא נוספה חותמת ביקור. בקרוב.',
  },
  booked: {
    label: 'מסלול',
    tabLabel: 'מסלול',
    subtitle: 'טיסות שכבר מחכות ביומן',
    empty: 'אין טיסות מתוכננות בדרכון כרגע.',
  },
  dream: {
    label: 'חלומות',
    tabLabel: 'חלומות',
    subtitle: 'יעדים שמחכים לרגע הנכון',
    empty: 'כל החלומות כבר הוזזו למסלול או לזיכרונות.',
  },
  starred: {
    label: 'דקור',
    tabLabel: 'דקור',
    subtitle: 'החותמות שממש לא רוצים לשכוח',
    empty: 'עוד לא דקרתם יעד בכוכב.',
  },
};

const revealEase = [0.22, 1, 0.36, 1] as const;

export default function PassportView({ destinations, onBack }: Props) {
  const { setDestState, toggleStarred, setTravelDate, setVisitedDate, setPersonalNote, updateDestination, deleteDestination } =
    usePassportStore();
  const reduceMotion = Boolean(useReducedMotion());

  const [activePage, setActivePage] = useState<PassportPage>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  const visited = destinations.filter(d => d.state === 'visited');
  const booked = destinations.filter(d => d.state === 'booked');
  const dream = destinations.filter(d => d.state === 'dream');
  const starred = destinations.filter(d => d.starred);

  const pageDestinations = useMemo(() => {
    const pageMap: Record<PassportPage, Destination[]> = {
      all: destinations,
      visited,
      booked,
      dream,
      starred,
    };

    return [...pageMap[activePage]].sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1;
      if (a.state !== b.state) {
        const order: Record<DestinationState, number> = { booked: 0, visited: 1, dream: 2 };
        return order[a.state] - order[b.state];
      }
      return a.nameHe.localeCompare(b.nameHe, 'he');
    });
  }, [activePage, destinations, visited, booked, dream, starred]);

  const selectedDestination = useMemo(
    () => destinations.find(d => d.id === selectedId) ?? null,
    [destinations, selectedId],
  );

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
    setSelectedId(null);
    setEditingDest(null);
  }, [editingDest, deleteDestination]);

  return (
    <div
      className="passport-page overflow-y-auto"
      style={{ direction: 'rtl' }}
    >
      <div className="passport-header sticky top-0 z-10">
        <div className="flex items-center px-4 py-3 gap-2">
          <button
            type="button"
            onClick={onBack}
            className="passport-back-button whitespace-nowrap"
          >
            חזרה לגלובוס
          </button>
          <h1 className="font-stamp flex-1 text-center text-lg text-[color:var(--paper)]">הדרכון שלנו</h1>
          <div className="w-28 flex-shrink-0" />
        </div>
      </div>

      <main className="passport-shell">
        <section className="passport-cover" aria-label="פרטי הדרכון">
          <div className="passport-cover-frame">
            <p className="font-stamp text-[color:var(--gold)] text-sm">MOR AIRLINES</p>
            <div className="passport-emblem" aria-hidden="true">MA</div>
            <div>
              <p className="passport-cover-kicker">דרכון זוגי</p>
              <h2 className="font-airline text-3xl leading-none text-[color:var(--paper)]">מור ואייל</h2>
            </div>
            <div className="passport-id-strip" dir="ltr">
              <span>PASS No. 2A</span>
              <span>RTL-HE</span>
            </div>
          </div>
        </section>

        <section className="passport-identity-page" aria-label="סיכום הדרכון">
          <div className="passport-identity-copy">
            <p className="artifact-label text-xs">נוסעים רשומים</p>
            <h2 className="font-airline text-2xl leading-tight text-[color:var(--ink)]">מור + אייל</h2>
            <p className="text-sm text-[color:var(--ink-muted)]">
              החותמות, החלומות והמסלול המשותף במקום אחד.
            </p>
          </div>
          <div className="passport-stat-grid">
            <PassportStat label="ביקרנו" value={visited.length} tone="green" />
            <PassportStat label="במסלול" value={booked.length} tone="blue" />
            <PassportStat label="חלומות" value={dream.length} tone="gold" />
            <PassportStat label="דקור" value={starred.length} tone="red" />
          </div>
        </section>

        <nav className="passport-page-tabs" aria-label="עמודי הדרכון">
          {(['all', 'visited', 'booked', 'dream', 'starred'] as PassportPage[]).map((page, index) => (
            <motion.button
              key={page}
              type="button"
              data-passport-motion="tab"
              onClick={() => setActivePage(page)}
              className={activePage === page ? 'is-active' : undefined}
              aria-pressed={activePage === page}
              initial={reduceMotion ? false : { opacity: 0, y: -10, filter: 'blur(8px)' }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: index * 0.045, duration: 0.28, ease: revealEase }}
            >
              <span>{PAGE_COPY[page].tabLabel}</span>
              <small>
                {page === 'all'
                  ? destinations.length
                  : page === 'visited'
                  ? visited.length
                  : page === 'booked'
                  ? booked.length
                  : page === 'dream'
                  ? dream.length
                  : starred.length}
              </small>
            </motion.button>
          ))}
        </nav>

        <section className="passport-stamp-page" aria-label={PAGE_COPY[activePage].label}>
          <div className="passport-page-heading">
            <div>
              <p className="artifact-label text-xs">{PAGE_COPY[activePage].subtitle}</p>
              <h2 className="font-airline text-2xl text-[color:var(--ink)]">{PAGE_COPY[activePage].label}</h2>
            </div>
            <span className="passport-page-number" dir="ltr">P. {pageNumber(activePage)}</span>
          </div>

          {pageDestinations.length === 0 ? (
            <p className="passport-empty text-sm text-center py-8">
              {PAGE_COPY[activePage].empty}
            </p>
          ) : (
            <div className="passport-stamp-grid">
              {pageDestinations.map((dest, index) => (
                <PassportStamp
                  key={`${activePage}-${dest.id}`}
                  dest={dest}
                  index={index}
                  reduceMotion={reduceMotion}
                  onOpen={() => setSelectedId(dest.id)}
                  onToggleStar={() => toggleStarred(dest.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedDestination && (
          <DestinationPassportDetail
            key={selectedDestination.id}
            dest={selectedDestination}
            onClose={() => setSelectedId(null)}
            onToggleStar={() => toggleStarred(selectedDestination.id)}
            onEdit={() => setEditingDest(selectedDestination)}
            onSetState={state => setDestState(selectedDestination.id, state)}
            onSetTravelDate={date => setTravelDate(selectedDestination.id, date)}
            onSetVisitedDate={date => setVisitedDate(selectedDestination.id, date)}
            onSetPersonalNote={note => setPersonalNote(selectedDestination.id, note)}
          />
        )}
      </AnimatePresence>

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

function PassportStat({ label, value, tone }: { label: string; value: number; tone: 'green' | 'blue' | 'gold' | 'red' }) {
  return (
    <div className={`passport-stat passport-stat-${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function PassportStamp({
  dest, index, reduceMotion, onOpen, onToggleStar,
}: {
  dest: Destination;
  index: number;
  reduceMotion: boolean;
  onOpen: () => void;
  onToggleStar: () => void;
}) {
  const state = STATE_COPY[dest.state];
  const dateLabel = getDateLabel(dest);
  const tilt = `${((index % 5) - 2) * 0.45}deg`;
  const revealDelay = Math.min(index, 12) * 0.035;

  return (
    <motion.article
      className="passport-stamp"
      data-passport-motion="stamp"
      style={{ '--stamp-tilt': tilt } as React.CSSProperties}
      initial={reduceMotion ? false : { opacity: 0, y: -14, filter: 'blur(10px)' }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ delay: revealDelay, duration: 0.34, ease: revealEase }}
    >
      <button
        type="button"
        className="passport-stamp-favorite"
        onClick={onToggleStar}
        aria-label={dest.starred ? 'הסר מדקור' : 'דקור יעד'}
      >
        <span className={dest.starred ? 'is-starred' : undefined}>★</span>
      </button>

      <button
        type="button"
        className="passport-stamp-body"
        onClick={onOpen}
      >
        <span className={`stamp-pill ${state.className}`}>{state.label}</span>
        <span className="passport-stamp-title">{dest.nameHe}</span>
        <span className="passport-stamp-en" dir="ltr">{dest.nameEn}</span>
        {dest.tagline && <span className="passport-stamp-line">{dest.tagline}</span>}
        <span className="passport-stamp-meta">
          {dateLabel ?? state.eyebrow}
          {dest.personalNote ? ' · יש זיכרון' : ''}
        </span>
      </button>
    </motion.article>
  );
}

function DestinationPassportDetail({
  dest,
  onClose,
  onToggleStar,
  onEdit,
  onSetState,
  onSetTravelDate,
  onSetVisitedDate,
  onSetPersonalNote,
}: {
  dest: Destination;
  onClose: () => void;
  onToggleStar: () => void;
  onEdit: () => void;
  onSetState: (state: DestinationState) => void;
  onSetTravelDate: (date: string) => void;
  onSetVisitedDate: (date: string) => void;
  onSetPersonalNote: (note: string) => void;
}) {
  const state = STATE_COPY[dest.state];

  return (
    <motion.div
      className="passport-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={`פרטי יעד ${dest.nameHe}`}
        className="passport-detail-page"
        initial={{ y: 42, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 42, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="passport-detail-header">
          <button type="button" onClick={onClose} className="passport-detail-close">
            סגור
          </button>
          <span className={`stamp-pill ${state.className}`}>{state.label}</span>
        </div>

        <div className="passport-detail-title-row">
          <div>
            <p className="artifact-label text-xs">{state.eyebrow}</p>
            <h2 className="font-airline text-3xl leading-tight text-[color:var(--ink)]">{dest.nameHe}</h2>
            <p className="font-stamp text-sm text-[color:var(--stamp-blue)]" dir="ltr">{dest.nameEn}</p>
          </div>
          <button
            type="button"
            onClick={onToggleStar}
            className="passport-star-control"
            aria-label={dest.starred ? 'הסר מדקור' : 'דקור יעד'}
          >
            <span className={dest.starred ? 'is-starred' : undefined}>★</span>
          </button>
        </div>

        {dest.tagline && (
          <p className="passport-detail-note">{dest.tagline}</p>
        )}

        <div className="passport-detail-facts">
          {dest.localDish && <Fact label="מנה מקומית" value={dest.localDish} />}
          {dest.bestSeason && <Fact label="עונה מומלצת" value={dest.bestSeason} />}
          {dest.whyHere && <Fact label="למה כאן" value={dest.whyHere} />}
        </div>

        <div className="passport-detail-editing">
          {dest.state === 'visited' && (
            <>
              <FieldRow label="תאריך ביקור">
                <input
                  type="date"
                  dir="ltr"
                  value={dest.visitedDate ?? ''}
                  onChange={e => onSetVisitedDate(e.target.value)}
                  className="passport-input"
                />
              </FieldRow>
              <FieldRow label="זיכרון אישי">
                <textarea
                  value={dest.personalNote ?? ''}
                  onChange={e => onSetPersonalNote(e.target.value)}
                  placeholder="כתבו זיכרון קטן מהטיול..."
                  rows={3}
                  className="passport-input resize-none"
                />
              </FieldRow>
            </>
          )}

          {dest.state === 'booked' && (
            <>
              <FieldRow label="תאריך יציאה">
                <input
                  type="date"
                  dir="ltr"
                  value={dest.travelDate ?? ''}
                  onChange={e => onSetTravelDate(e.target.value)}
                  className="passport-input"
                />
              </FieldRow>
              <button
                type="button"
                onClick={() => onSetState('visited')}
                className="passport-action-green w-full mt-3"
              >
                ביקרנו, העבר לזיכרונות
              </button>
            </>
          )}

          {dest.state === 'dream' && (
            <div className="passport-detail-actions">
              <button
                type="button"
                onClick={() => onSetState('booked')}
                className="passport-action-blue"
              >
                הזמנתי
              </button>
              <button
                type="button"
                onClick={() => onSetState('visited')}
                className="passport-action-green"
              >
                ביקרנו
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="passport-edit-destination"
        >
          עריכת פרטי יעד
        </button>
      </motion.aside>
    </motion.div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="artifact-label text-xs">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-3">
      <p className="artifact-label text-xs mb-1">{label}</p>
      {children}
    </div>
  );
}

function getDateLabel(dest: Destination) {
  const date = dest.state === 'visited' ? dest.visitedDate : dest.state === 'booked' ? dest.travelDate : undefined;
  if (!date) return null;

  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).format(new Date(`${date}T00:00:00`));
}

function pageNumber(page: PassportPage) {
  return {
    all: '01',
    visited: '02',
    booked: '03',
    dream: '04',
    starred: '05',
  }[page];
}
