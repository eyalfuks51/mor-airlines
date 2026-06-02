import { useRef, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import GlobeView from './components/GlobeView';
import CeremonyOverlay from './components/CeremonyOverlay';
import BoardingPass from './components/BoardingPass';
import PassportView from './components/PassportView';
import DestinationModal, { ModalFormData } from './components/DestinationModal';
import SyncIndicator from './components/SyncIndicator';
import { CeremonyPhase, TIMINGS } from './utils/ceremony';
import { playBingBong, startDrumroll, stopDrumroll, playDing, playApplause } from './utils/sounds';
import { Destination, DestinationState, VibeTag } from './data/destinations';
import { usePassportStore, mergeDestinations } from './store/passportStore';
import { fetchWikiData } from './hooks/wikiData';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import { matchesVibeFilters } from './utils/destinationFilters';

type AppView = 'globe' | 'passport';

export default function App() {
  const [view, setView] = useState<AppView>('globe');
  const [phase, setPhase] = useState<CeremonyPhase>('idle');
  const [dest, setDest] = useState<Destination | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Filter state
  const [activeVibes, setActiveVibes] = useState<VibeTag[]>([]);
  const [activeState, setActiveState] = useState<DestinationState | 'all'>('all');

  const overrides = usePassportStore(s => s.overrides);
  const userDestinations = usePassportStore(s => s.userDestinations);
  const setDestState = usePassportStore(s => s.setDestState);
  const toggleStarred = usePassportStore(s => s.toggleStarred);
  const addDestination = usePassportStore(s => s.addDestination);

  const { syncStatus, manualRefresh } = useSupabaseSync(phase);

  const destinations = useMemo(
    () => mergeDestinations(overrides, userDestinations),
    [overrides, userDestinations],
  );

  const filteredDestinations = useMemo(() => {
    return destinations.filter(d => {
      const vibeMatch = matchesVibeFilters(d, activeVibes);
      const stateMatch = activeState === 'all' || d.state === activeState;
      return vibeMatch && stateMatch;
    });
  }, [destinations, activeVibes, activeState]);

  const handleVibeToggle = useCallback((vibe: VibeTag) => {
    setActiveVibes(prev =>
      prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe],
    );
  }, []);

  const handleStateChange = useCallback((state: DestinationState | 'all') => {
    setActiveState(state);
  }, []);

  const handleResetFilters = useCallback(() => {
    setActiveVibes([]);
    setActiveState('all');
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const lotteryPool = useMemo(
    () => filteredDestinations.filter(d => d.state !== 'visited'),
    [filteredDestinations],
  );

  const runCeremony = useCallback((excludeId?: string) => {
    const pool = excludeId ? lotteryPool.filter(d => d.id !== excludeId) : lotteryPool;
    if (pool.length === 0 && lotteryPool.length === 0) return;
    if (pool.length === 0 && lotteryPool.length <= 1) return;
    clearTimers();
    stopDrumroll();

    const activePool = pool.length > 0 ? pool : lotteryPool;
    const chosen = activePool[Math.floor(Math.random() * activePool.length)];
    setDest(chosen);
    setPhase('spin');
    playBingBong();

    const t1 = setTimeout(() => startDrumroll(), 600);

    const t2 = setTimeout(() => {
      stopDrumroll();
      setPhase('lock');
    }, TIMINGS.SPIN_MS);

    const t3 = setTimeout(() => {
      setPhase('pin-drop');
      playDing();
    }, TIMINGS.SPIN_MS + TIMINGS.LOCK_MS);

    const t4 = setTimeout(() => {
      setPhase('reveal');
      playApplause();
    }, TIMINGS.SPIN_MS + TIMINGS.LOCK_MS + TIMINGS.PIN_MS);

    const t5 = setTimeout(() => {
      setPhase('boarding-pass');
    }, TIMINGS.SPIN_MS + TIMINGS.LOCK_MS + TIMINGS.PIN_MS + TIMINGS.REVEAL_MS);

    timersRef.current = [t1, t2, t3, t4, t5];
  }, [lotteryPool, clearTimers]);

  const handleReroll = useCallback(() => {
    clearTimers();
    stopDrumroll();
    runCeremony(dest?.id);
  }, [runCeremony, clearTimers, dest]);

  const handleSave = useCallback((state: DestinationState) => {
    if (dest) {
      setDestState(dest.id, state);
      setDest(prev => (prev ? { ...prev, state } : prev));
    }
  }, [dest, setDestState]);

  const handleToggleStar = useCallback(() => {
    if (dest) {
      toggleStarred(dest.id);
      setDest(prev => (prev ? { ...prev, starred: !prev.starred } : prev));
    }
  }, [dest, toggleStarred]);

  const handleShare = useCallback(() => {
    if (!dest) return;
    if (navigator.share) {
      navigator.share({
        title: `מור איירליינס — ${dest.nameHe}`,
        text: dest.tagline ?? `טסים ל${dest.nameHe}!`,
      });
    } else {
      navigator.clipboard?.writeText(`${dest.nameHe} (${dest.nameEn})`);
    }
  }, [dest]);

  const handleAddDestination = useCallback(async (data: ModalFormData) => {
    const wiki = await fetchWikiData(data.nameEn).catch(() => null);
    const newDest: Destination = {
      id: crypto.randomUUID(),
      nameHe: data.nameHe,
      nameEn: data.nameEn,
      lat: data.lat,
      lng: data.lng,
      tagline: data.tagline || undefined,
      localDish: data.localDish || undefined,
      bestSeason: data.bestSeason || undefined,
      whyHere: data.whyHere || undefined,
      vibeTags: data.vibeTags,
      imageUrl: wiki?.imageUrl ?? undefined,
      wikiSummary: wiki?.wikiSummary || undefined,
      state: 'dream',
      starred: false,
      source: 'user',
      updatedAt: new Date().toISOString(),
    };
    addDestination(newDest);
    setAddModalOpen(false);
  }, [addDestination]);

  if (view === 'passport') {
    return (
      <>
        <PassportView
          destinations={destinations}
          onBack={() => setView('globe')}
        />
        <AnimatePresence>
          {addModalOpen && (
            <DestinationModal
              key="add-modal"
              mode="add"
              onClose={() => setAddModalOpen(false)}
              onSave={handleAddDestination}
            />
          )}
        </AnimatePresence>
        <SyncIndicator status={syncStatus} onRetry={manualRefresh} />
      </>
    );
  }

  return (
    <>
      <GlobeView
        destinations={filteredDestinations}
        onLottery={runCeremony}
        onOpenPassport={() => setView('passport')}
        onAddDestination={() => setAddModalOpen(true)}
        ceremonyPhase={phase}
        selectedDest={dest}
        activeVibes={activeVibes}
        activeState={activeState}
        onVibeToggle={handleVibeToggle}
        onStateChange={handleStateChange}
        onResetFilters={handleResetFilters}
        lotteryPoolEmpty={lotteryPool.length === 0}
      />

      <CeremonyOverlay phase={phase} dest={dest} />

      <AnimatePresence>
        {phase === 'boarding-pass' && dest && (
          <BoardingPass
            key={dest.id}
            destination={dest}
            onReroll={handleReroll}
            onSave={handleSave}
            onShare={handleShare}
            onToggleStar={handleToggleStar}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addModalOpen && (
          <DestinationModal
            key="add-modal"
            mode="add"
            onClose={() => setAddModalOpen(false)}
            onSave={handleAddDestination}
          />
        )}
      </AnimatePresence>

      <SyncIndicator status={syncStatus} onRetry={manualRefresh} />
    </>
  );
}
