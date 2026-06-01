export type CeremonyPhase =
  | 'idle'
  | 'spin'
  | 'lock'
  | 'pin-drop'
  | 'reveal'
  | 'boarding-pass';

export const TIMINGS = {
  SPIN_MS: 3000,
  LOCK_MS: 2500,
  PIN_MS: 1500,
  REVEAL_MS: 1500,
  BOARD_DELAY: 500,
} as const;

export const TOTAL_CEREMONY_MS =
  TIMINGS.SPIN_MS +
  TIMINGS.LOCK_MS +
  TIMINGS.PIN_MS +
  TIMINGS.REVEAL_MS +
  TIMINGS.BOARD_DELAY;
