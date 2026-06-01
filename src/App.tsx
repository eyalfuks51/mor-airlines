import { useRef, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import GlobeView from './components/GlobeView';
import CeremonyOverlay from './components/CeremonyOverlay';
import BoardingPass from './components/BoardingPass';
import PassportView from './components/PassportView';
import { CeremonyPhase, TIMINGS } from './utils/ceremony';
import { playBingBong, startDrumroll, stopDrumroll, playDing, playApplause } from './utils/sounds';
import { Destination, DestinationState } from './data/destinations';
import { usePassportStore, mergeDestinations } from './store/passportStore';

type AppView = 'globe' | 'passport';

export default function App() {
  const [view, setView] = useState<AppView>('globe');
  const [phase, setPhase] = useState<CeremonyPhase>('idle');
  const [dest, setDest] = useState<Destination | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const overrides = usePassportStore(s => s.overrides);
  const setDestState = usePassportStore(s => s.setDestState);
  const destinations = useMemo(() => mergeDestinations(overrides), [overrides]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const runCeremony = useCallback(() => {
    clearTimers();
    stopDrumroll();

    const pool = destinations.filter(d => d.state !== 'visited');
    const chosen = pool[Math.floor(Math.random() * pool.length)];
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
  }, [destinations, clearTimers]);

  const handleReroll = useCallback(() => {
    clearTimers();
    stopDrumroll();
    runCeremony();
  }, [runCeremony, clearTimers]);

  const handleSave = useCallback((state: DestinationState) => {
    if (dest) {
      setDestState(dest.id, state);
      setDest(prev => (prev ? { ...prev, state } : prev));
    }
  }, [dest, setDestState]);

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

  if (view === 'passport') {
    return (
      <PassportView
        destinations={destinations}
        onBack={() => setView('globe')}
      />
    );
  }

  return (
    <>
      <GlobeView
        destinations={destinations}
        onLottery={runCeremony}
        onOpenPassport={() => setView('passport')}
        ceremonyPhase={phase}
        selectedDest={dest}
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
          />
        )}
      </AnimatePresence>
    </>
  );
}
