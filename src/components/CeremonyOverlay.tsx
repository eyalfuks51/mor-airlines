import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CeremonyPhase } from '../utils/ceremony';
import { Destination } from '../data/destinations';

interface Props {
  phase: CeremonyPhase;
  dest: Destination | null;
}

export default function CeremonyOverlay({ phase, dest }: Props) {
  useEffect(() => {
    if (phase !== 'reveal') return;
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.55 }, colors: ['#FFD700', '#FF69B4', '#38BDF8', '#4ADE80', '#FF6B35'] });
    const t = setTimeout(() => {
      confetti({ particleCount: 90, angle: 60, spread: 60, origin: { x: 0, y: 0.6 } });
      confetti({ particleCount: 90, angle: 120, spread: 60, origin: { x: 1, y: 0.6 } });
    }, 350);
    return () => clearTimeout(t);
  }, [phase]);

  const showVignette = phase !== 'idle';
  const showName = (phase === 'reveal' || phase === 'boarding-pass') && dest;

  return (
    <>
      {/* Vignette overlay */}
      <AnimatePresence>
        {showVignette && (
          <motion.div
            key="vignette"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-30 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.72) 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Destination name reveal */}
      <AnimatePresence>
        {showName && (
          <motion.div
            key={`name-${dest.id}`}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none"
            style={{ paddingBottom: phase === 'boarding-pass' ? '55vh' : '0' }}
          >
            <p
              className="font-airline text-[color:var(--paper)] drop-shadow-2xl text-center px-6"
              style={{
                fontSize: 'clamp(2.6rem, 10vw, 5.25rem)',
                textShadow: '0 0 40px rgba(255,215,0,0.6), 0 4px 16px rgba(0,0,0,0.8)',
              }}
            >
              {dest.nameHe}
            </p>
            <p
              className="font-stamp text-[color:var(--gold)] mt-2 text-center"
              style={{ fontSize: 'clamp(1rem, 4vw, 1.5rem)' }}
            >
              {dest.nameEn}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
