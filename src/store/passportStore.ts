import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Destination, DestinationState, seedDestinations } from '../data/destinations';

export type UserOverride = {
  state?: DestinationState;
  starred?: boolean;
  travelDate?: string;
  visitedDate?: string;
  personalNote?: string;
  updatedAt: string;
};

interface PassportStore {
  overrides: Record<string, UserOverride>;
  setDestState: (id: string, state: DestinationState) => void;
  toggleStarred: (id: string) => void;
  setTravelDate: (id: string, date: string) => void;
  setVisitedDate: (id: string, date: string) => void;
  setPersonalNote: (id: string, note: string) => void;
}

export const usePassportStore = create<PassportStore>()(
  persist(
    (set, get) => ({
      overrides: {},

      setDestState(id, state) {
        set(s => ({
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], state, updatedAt: new Date().toISOString() },
          },
        }));
      },

      toggleStarred(id) {
        const { overrides } = get();
        const seed = seedDestinations.find(d => d.id === id);
        const cur = overrides[id]?.starred ?? seed?.starred ?? false;
        set(s => ({
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], starred: !cur, updatedAt: new Date().toISOString() },
          },
        }));
      },

      setTravelDate(id, date) {
        set(s => ({
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], travelDate: date, updatedAt: new Date().toISOString() },
          },
        }));
      },

      setVisitedDate(id, date) {
        set(s => ({
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], visitedDate: date, updatedAt: new Date().toISOString() },
          },
        }));
      },

      setPersonalNote(id, note) {
        set(s => ({
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], personalNote: note, updatedAt: new Date().toISOString() },
          },
        }));
      },
    }),
    { name: 'mor-airlines-passport' },
  ),
);

export function mergeDestinations(overrides: Record<string, UserOverride>): Destination[] {
  return seedDestinations.map(d => ({ ...d, ...overrides[d.id] }));
}
