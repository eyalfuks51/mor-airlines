import { useRef, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import GlobeView from './components/GlobeView';
import CeremonyOverlay from './components/CeremonyOverlay';
import BoardingPass from './components/BoardingPass';
import { CeremonyPhase, TIMINGS } from './utils/ceremony';
import { playBingBong, startDrumroll, stopDrumroll, playDing, playApplause } from './utils/sounds';
import { seedDestinations, Destination } from './data/destinations';

function pickDest(): Destination {
  const pool = seedDestinations.filter((d) => d.state !== 'visited');
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function App() {
  const [phase, setPhase] = useState<CeremonyPhase>('idle');
  const [dest, setDest] = useState<Destination | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const runCeremony = useCallback(() => {
    clearTimers();
    stopDrumroll();

    const chosen = pickDest();
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
  }, []);

  const handleReroll = useCallback(() => {
    clearTimers();
    stopDrumroll();
    runCeremony(); // phase jumps to 'spin'; AnimatePresence exits boarding pass
  }, [runCeremony]);

  const handleSave = useCallback(() => {
    if (dest) console.log('שמור לדרכון (Phase 3):', dest.nameEn);
  }, [dest]);

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

  return (
    <>
      <GlobeView
        onLottery={runCeremony}
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
