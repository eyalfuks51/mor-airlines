import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Destination, DestinationState, VibeTag, seedDestinations } from '../data/destinations';

export type UserOverride = {
  state?: DestinationState;
  starred?: boolean;
  travelDate?: string;
  visitedDate?: string;
  personalNote?: string;
  nameHe?: string;
  nameEn?: string;
  tagline?: string;
  localDish?: string;
  bestSeason?: string;
  whyHere?: string;
  vibeTags?: VibeTag[];
  lat?: number;
  lng?: number;
  imageUrl?: string;
  wikiSummary?: string;
  updatedAt: string;
};

interface PassportStore {
  overrides: Record<string, UserOverride>;
  userDestinations: Record<string, Destination>;
  setDestState: (id: string, state: DestinationState) => void;
  toggleStarred: (id: string) => void;
  setTravelDate: (id: string, date: string) => void;
  setVisitedDate: (id: string, date: string) => void;
  setPersonalNote: (id: string, note: string) => void;
  addDestination: (dest: Destination) => void;
  updateDestination: (id: string, fields: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
}

export const usePassportStore = create<PassportStore>()(
  persist(
    (set, get) => ({
      overrides: {},
      userDestinations: {},

      setDestState(id, state) {
        set(s => ({
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], state, updatedAt: new Date().toISOString() },
          },
        }));
      },

      toggleStarred(id) {
        const { overrides, userDestinations } = get();
        const seedDest = seedDestinations.find(d => d.id === id);
        const userDest = userDestinations[id];
        const cur = overrides[id]?.starred ?? userDest?.starred ?? seedDest?.starred ?? false;
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

      addDestination(dest) {
        set(s => ({
          userDestinations: { ...s.userDestinations, [dest.id]: dest },
        }));
      },

      updateDestination(id, fields) {
        const isSeed = seedDestinations.some(d => d.id === id);
        if (isSeed) {
          set(s => ({
            overrides: {
              ...s.overrides,
              [id]: { ...s.overrides[id], ...fields, updatedAt: new Date().toISOString() },
            },
          }));
        } else {
          set(s => {
            const existing = s.userDestinations[id];
            if (!existing) return s;
            return {
              userDestinations: {
                ...s.userDestinations,
                [id]: { ...existing, ...fields, updatedAt: new Date().toISOString() },
              },
            };
          });
        }
      },

      deleteDestination(id) {
        set(s => {
          const next = { ...s.userDestinations };
          delete next[id];
          return { userDestinations: next };
        });
      },
    }),
    { name: 'mor-airlines-passport' },
  ),
);

export function mergeDestinations(
  overrides: Record<string, UserOverride>,
  userDestinations: Record<string, Destination>,
): Destination[] {
  const seedMerged = seedDestinations.map(d => ({ ...d, ...overrides[d.id] }));
  const userDests = Object.values(userDestinations).map(d => ({ ...d, ...overrides[d.id] }));
  return [...seedMerged, ...userDests];
}
