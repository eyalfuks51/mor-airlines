import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, PASSPORT_ID } from '../lib/supabase';
import { usePassportStore, SyncBlob } from '../store/passportStore';
import { CeremonyPhase } from '../utils/ceremony';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'offline';

const PUSH_DEBOUNCE_MS = 2000;
const INITIAL_FETCH_DELAY_MS = 1000;

export function useSupabaseSync(ceremonyPhase: CeremonyPhase) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const overrides = usePassportStore(s => s.overrides);
  const userDestinations = usePassportStore(s => s.userDestinations);
  const storeUpdatedAt = usePassportStore(s => s.storeUpdatedAt);
  const hydrateFromSupabase = usePassportStore(s => s.hydrateFromSupabase);

  const storeUpdatedAtRef = useRef(storeUpdatedAt);
  useEffect(() => { storeUpdatedAtRef.current = storeUpdatedAt; }, [storeUpdatedAt]);

  const ceremonyActiveRef = useRef(false);
  useEffect(() => {
    ceremonyActiveRef.current = ceremonyPhase !== 'idle' && ceremonyPhase !== 'boarding-pass';
  }, [ceremonyPhase]);

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPushedAtRef = useRef('');
  const isInitialMountRef = useRef(true);

  const fetchFromSupabase = useCallback(async () => {
    if (!PASSPORT_ID || !import.meta.env.VITE_SUPABASE_URL) return;
    setSyncStatus('syncing');
    try {
      const { data, error } = await supabase
        .from('passports')
        .select('data, updated_at')
        .eq('id', PASSPORT_ID)
        .single();

      if (error) throw error;

      if (data?.data) {
        const remote = data.data as SyncBlob;
        const remoteAt = remote.updatedAt ?? data.updated_at ?? '';
        const localAt = storeUpdatedAtRef.current;

        if (!ceremonyActiveRef.current && (!localAt || remoteAt > localAt)) {
          hydrateFromSupabase(remote);
        }
      }
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
  }, [hydrateFromSupabase]);

  // Initial background fetch after mount
  useEffect(() => {
    const timer = setTimeout(fetchFromSupabase, INITIAL_FETCH_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced push on every store change (skip first render)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (!PASSPORT_ID || !import.meta.env.VITE_SUPABASE_URL) return;
    if (!storeUpdatedAt || storeUpdatedAt === lastPushedAtRef.current) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);

    pushTimerRef.current = setTimeout(async () => {
      if (ceremonyActiveRef.current) return;
      const blob: SyncBlob = { overrides, userDestinations, updatedAt: storeUpdatedAt };
      setSyncStatus('syncing');
      try {
        const { error } = await supabase
          .from('passports')
          .upsert({ id: PASSPORT_ID, data: blob, updated_at: new Date().toISOString() });
        if (error) throw error;
        lastPushedAtRef.current = storeUpdatedAt;
        setSyncStatus('synced');
      } catch {
        setSyncStatus('offline');
      }
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeUpdatedAt]);

  const manualRefresh = useCallback(() => {
    fetchFromSupabase();
  }, [fetchFromSupabase]);

  return { syncStatus, manualRefresh };
}
