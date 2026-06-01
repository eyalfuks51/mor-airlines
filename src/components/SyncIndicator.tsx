import { useEffect, useState } from 'react';
import { SyncStatus } from '../hooks/useSupabaseSync';

interface Props {
  status: SyncStatus;
  onRetry: () => void;
}

export default function SyncIndicator({ status, onRetry }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status === 'syncing' || status === 'offline') {
      setVisible(true);
    } else if (status === 'synced') {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [status]);

  if (!visible) return null;

  const base =
    'fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs shadow-lg select-none';

  if (status === 'offline') {
    return (
      <div className={`${base} bg-red-900/80 text-red-200`} dir="rtl">
        <span>אין חיבור לענן</span>
        <button
          onClick={onRetry}
          className="underline text-red-100 hover:text-white transition-colors"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div className={`${base} bg-slate-800/80 text-slate-300`} dir="rtl">
        <svg className="animate-spin h-3 w-3 text-slate-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
        </svg>
        <span>מסתנכרן...</span>
      </div>
    );
  }

  if (status === 'synced') {
    return (
      <div className={`${base} bg-emerald-900/70 text-emerald-300`} dir="rtl">
        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
        <span>מסונכרן</span>
      </div>
    );
  }

  return null;
}
