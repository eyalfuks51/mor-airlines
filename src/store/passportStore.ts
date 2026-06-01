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

export interface SyncBlob {
  overrides: Record<string, UserOverride>;
  userDestinations: Record<string, Destination>;
  updatedAt: string;
}

interface PassportStore {
  overrides: Record<string, UserOverride>;
  userDestinations: Record<string, Destination>;
  storeUpdatedAt: string;
  setDestState: (id: string, state: DestinationState) => void;
  toggleStarred: (id: string) => void;
  setTravelDate: (id: string, date: string) => void;
  setVisitedDate: (id: string, date: string) => void;
  setPersonalNote: (id: string, note: string) => void;
  addDestination: (dest: Destination) => void;
  updateDestination: (id: string, fields: Partial<Destination>) => void;
  deleteDestination: (id: string) => void;
  hydrateFromSupabase: (blob: SyncBlob) => void;
}

export const usePassportStore = create<PassportStore>()(
  persist(
    (set, get) => ({
      overrides: {},
      userDestinations: {},
      storeUpdatedAt: '',

      setDestState(id, state) {
        const now = new Date().toISOString();
        set(s => ({
          storeUpdatedAt: now,
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], state, updatedAt: now },
          },
        }));
      },

      toggleStarred(id) {
        const { overrides, userDestinations } = get();
        const seedDest = seedDestinations.find(d => d.id === id);
        const userDest = userDestinations[id];
        const cur = overrides[id]?.starred ?? userDest?.starred ?? seedDest?.starred ?? false;
        const now = new Date().toISOString();
        set(s => ({
          storeUpdatedAt: now,
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], starred: !cur, updatedAt: now },
          },
        }));
      },

      setTravelDate(id, date) {
        const now = new Date().toISOString();
        set(s => ({
          storeUpdatedAt: now,
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], travelDate: date, updatedAt: now },
          },
        }));
      },

      setVisitedDate(id, date) {
        const now = new Date().toISOString();
        set(s => ({
          storeUpdatedAt: now,
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], visitedDate: date, updatedAt: now },
          },
        }));
      },

      setPersonalNote(id, note) {
        const now = new Date().toISOString();
        set(s => ({
          storeUpdatedAt: now,
          overrides: {
            ...s.overrides,
            [id]: { ...s.overrides[id], personalNote: note, updatedAt: now },
          },
        }));
      },

      addDestination(dest) {
        set(s => ({
          storeUpdatedAt: dest.updatedAt,
          userDestinations: { ...s.userDestinations, [dest.id]: dest },
        }));
      },

      updateDestination(id, fields) {
        const now = new Date().toISOString();
        const isSeed = seedDestinations.some(d => d.id === id);
        if (isSeed) {
          set(s => ({
            storeUpdatedAt: now,
            overrides: {
              ...s.overrides,
              [id]: { ...s.overrides[id], ...fields, updatedAt: now },
            },
          }));
        } else {
          set(s => {
            const existing = s.userDestinations[id];
            if (!existing) return s;
            return {
              storeUpdatedAt: now,
              userDestinations: {
                ...s.userDestinations,
                [id]: { ...existing, ...fields, updatedAt: now },
              },
            };
          });
        }
      },

      deleteDestination(id) {
        const now = new Date().toISOString();
        set(s => {
          const next = { ...s.userDestinations };
          delete next[id];
          return { storeUpdatedAt: now, userDestinations: next };
        });
      },

      hydrateFromSupabase(blob) {
        set({
          overrides: blob.overrides ?? {},
          userDestinations: blob.userDestinations ?? {},
          storeUpdatedAt: blob.updatedAt,
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
