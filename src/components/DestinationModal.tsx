import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Destination, VibeTag } from '../data/destinations';
import { geocodePlace } from '../hooks/geocoding';

const VIBE_LABELS: Record<VibeTag, string> = {
  beach: 'חוף',
  city: 'עיר',
  adventure: 'הרפתקה',
  food: 'אוכל',
  far: 'רחוק',
  near: 'קרוב',
};

const ALL_TAGS: VibeTag[] = ['beach', 'city', 'adventure', 'food', 'far', 'near'];

export interface ModalFormData {
  nameHe: string;
  nameEn: string;
  tagline: string;
  localDish: string;
  bestSeason: string;
  whyHere: string;
  vibeTags: VibeTag[];
  lat: number;
  lng: number;
}

interface Props {
  mode: 'add' | 'edit';
  destination?: Destination;
  onClose: () => void;
  onSave: (data: ModalFormData) => Promise<void>;
  onDelete?: () => void;
}

type GeoStatus = 'idle' | 'loading' | 'found' | 'error';

export default function DestinationModal({ mode, destination, onClose, onSave, onDelete }: Props) {
  const [nameHe, setNameHe] = useState(destination?.nameHe ?? '');
  const [nameEn, setNameEn] = useState(destination?.nameEn ?? '');
  const [tagline, setTagline] = useState(destination?.tagline ?? '');
  const [localDish, setLocalDish] = useState(destination?.localDish ?? '');
  const [bestSeason, setBestSeason] = useState(destination?.bestSeason ?? '');
  const [whyHere, setWhyHere] = useState(destination?.whyHere ?? '');
  const [vibeTags, setVibeTags] = useState<VibeTag[]>(destination?.vibeTags ?? []);
  const [latStr, setLatStr] = useState(destination?.lat?.toString() ?? '');
  const [lngStr, setLngStr] = useState(destination?.lng?.toString() ?? '');
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const geoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced auto-geocoding in add mode
  useEffect(() => {
    if (mode !== 'add') return;
    if (nameEn.trim().length < 2) return;

    if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
    geoTimerRef.current = setTimeout(async () => {
      setGeoStatus('loading');
      const result = await geocodePlace(nameEn.trim());
      if (result) {
        setLatStr(result.lat.toFixed(4));
        setLngStr(result.lng.toFixed(4));
        setGeoStatus('found');
      } else {
        setGeoStatus('error');
      }
    }, 700);

    return () => {
      if (geoTimerRef.current) clearTimeout(geoTimerRef.current);
    };
  }, [nameEn, mode]);

  const triggerGeocode = useCallback(async () => {
    if (!nameEn.trim()) return;
    setGeoStatus('loading');
    const result = await geocodePlace(nameEn.trim());
    if (result) {
      setLatStr(result.lat.toFixed(4));
      setLngStr(result.lng.toFixed(4));
      setGeoStatus('found');
    } else {
      setGeoStatus('error');
    }
  }, [nameEn]);

  const toggleTag = useCallback((tag: VibeTag) => {
    setVibeTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  }, []);

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const isValid =
    nameHe.trim().length > 0 &&
    nameEn.trim().length > 0 &&
    !isNaN(lat) &&
    !isNaN(lng);

  const handleSave = useCallback(async () => {
    if (!isValid) return;
    setSaving(true);
    try {
      await onSave({
        nameHe: nameHe.trim(),
        nameEn: nameEn.trim(),
        tagline: tagline.trim(),
        localDish: localDish.trim(),
        bestSeason: bestSeason.trim(),
        whyHere: whyHere.trim(),
        vibeTags,
        lat,
        lng,
      });
    } finally {
      setSaving(false);
    }
  }, [isValid, onSave, nameHe, nameEn, tagline, localDish, bestSeason, whyHere, vibeTags, lat, lng]);

  const geoHint =
    geoStatus === 'loading' ? '🔍 מחפש...' :
    geoStatus === 'found' ? '✅ נמצא' :
    geoStatus === 'error' ? '⚠️ לא נמצא — ערוך ידנית' :
    '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/70 flex items-end sm:items-center justify-center"
      style={{ direction: 'rtl' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
        className="bg-[color:var(--night)] rounded-t-2xl sm:rounded-2xl w-full max-w-lg border border-white/10 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[color:var(--night)] border-b border-white/10 flex items-center justify-between px-5 py-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="text-white/55 hover:text-white text-sm transition-colors"
          >
            ✕ ביטול
          </button>
          <h2 className="font-airline text-white text-base">
            {mode === 'add' ? '+ הוסף יעד חדש' : '✏ עריכת יעד'}
          </h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid || saving}
            className="bg-[color:var(--gold)] hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-[color:var(--ink)] text-sm font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
          >
            {saving ? '...' : 'שמור'}
          </button>
        </div>

        <div className="px-5 py-5 space-y-5 pb-10">
          {/* Names */}
          <FieldGroup label="שם בעברית *">
            <input
              type="text"
              value={nameHe}
              onChange={e => setNameHe(e.target.value)}
              placeholder="סנטוריני"
              className="input-field"
              dir="rtl"
            />
          </FieldGroup>

          <FieldGroup
            label="שם באנגלית *"
            hint={geoHint}
            hintError={geoStatus === 'error'}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="Santorini"
                className={`input-field ${geoStatus === 'error' ? 'border-yellow-500/50' : ''}`}
                dir="ltr"
              />
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={triggerGeocode}
                  disabled={!nameEn.trim() || geoStatus === 'loading'}
                  className="flex-shrink-0 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs px-3 rounded-xl transition-all whitespace-nowrap"
                >
                  🔍 מצא
                </button>
              )}
            </div>
          </FieldGroup>

          {/* Coordinates */}
          <div>
            <p className="font-stamp text-white/50 text-xs mb-2">קואורדינטות</p>
            <div className="grid grid-cols-2 gap-2">
              <FieldGroup label="קו רוחב (lat)">
                <input
                  type="number"
                  step="0.0001"
                  value={latStr}
                  onChange={e => setLatStr(e.target.value)}
                  placeholder="36.3932"
                  className="input-field"
                  dir="ltr"
                />
              </FieldGroup>
              <FieldGroup label="קו אורך (lng)">
                <input
                  type="number"
                  step="0.0001"
                  value={lngStr}
                  onChange={e => setLngStr(e.target.value)}
                  placeholder="25.4615"
                  className="input-field"
                  dir="ltr"
                />
              </FieldGroup>
            </div>
          </div>

          {/* Content fields */}
          <FieldGroup label="תיאור קצר">
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="שקיעות כחולות-לבנות שנחרטות בזיכרון"
              className="input-field"
            />
          </FieldGroup>
          <FieldGroup label="מנה מקומית">
            <input
              type="text"
              value={localDish}
              onChange={e => setLocalDish(e.target.value)}
              placeholder="פרי קטימס"
              className="input-field"
            />
          </FieldGroup>
          <FieldGroup label="עונה מומלצת">
            <input
              type="text"
              value={bestSeason}
              onChange={e => setBestSeason(e.target.value)}
              placeholder="ספטמבר-אוקטובר"
              className="input-field"
            />
          </FieldGroup>
          <FieldGroup label="למה כאן">
            <input
              type="text"
              value={whyHere}
              onChange={e => setWhyHere(e.target.value)}
              placeholder="כי יש שקיעות שמשנות אנשים"
              className="input-field"
            />
          </FieldGroup>

          {/* Vibe tags */}
          <div>
            <p className="font-stamp text-white/50 text-xs mb-2">תגיות</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`font-stamp px-3 py-1.5 rounded-lg text-sm transition-all active:scale-95 border ${
                    vibeTags.includes(tag)
                      ? 'bg-[color:var(--paper)] text-[color:var(--ink)] border-[color:var(--paper)]'
                      : 'bg-white/[0.07] text-white/60 border-white/10 hover:bg-white/15'
                  }`}
                >
                  {VIBE_LABELS[tag]}
                </button>
              ))}
            </div>
          </div>

          {/* Delete (edit mode, user destinations only) */}
          {mode === 'edit' && onDelete && (
            <div className="pt-3 border-t border-white/10">
              {showDeleteConfirm ? (
                <div className="bg-red-900/30 rounded-2xl p-4 border border-red-500/30">
                  <p className="text-white/70 text-sm text-center mb-3">
                    למחוק את {destination?.nameHe}?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onDelete}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all active:scale-95"
                    >
                      כן, מחק
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-white/10 text-white/60 text-sm py-2.5 rounded-xl hover:bg-white/15 transition-all"
                    >
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full text-red-400 hover:text-red-300 text-sm py-2.5 rounded-xl hover:bg-red-900/20 transition-all"
                >
                  🗑 מחק יעד זה
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FieldGroup({
  label,
  hint,
  hintError,
  children,
}: {
  label: string;
  hint?: string;
  hintError?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <p className="font-stamp text-white/50 text-xs">{label}</p>
        {hint && (
          <p className={`text-xs ${hintError ? 'text-yellow-400' : 'text-white/40'}`}>{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}
