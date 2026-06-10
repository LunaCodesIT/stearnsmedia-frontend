import { useMemo, useState } from 'react';
import { submitBookingRequest } from '@/services/bookingService';

// All booking behaviour: business-hours slot generation in SAST, conversion
// into the visitor's (selectable) timezone, selection state, and submission.
// The widget component only renders what this hook returns.

const BUSINESS_TZ = 'Africa/Johannesburg'; // SAST — UTC+2, no DST
const START_HOUR = 9; // 09:00 SAST
const END_HOUR = 17; // last slot starts 16:30 SAST
const SLOT_MINUTES = 30;
const BUSINESS_DAYS_SHOWN = 10;

const isoInTz = (date, timeZone) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(date);

// Upcoming business days (Mon–Fri), as YYYY-MM-DD in SAST
function businessDays() {
  const days = [];
  const cursor = new Date(`${isoInTz(new Date(), BUSINESS_TZ)}T12:00:00Z`);
  while (days.length < BUSINESS_DAYS_SHOWN) {
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      const iso = cursor.toISOString().slice(0, 10);
      days.push({
        iso,
        label: new Intl.DateTimeFormat('en-GB', {
          weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
        }).format(cursor),
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function useBookingForm() {
  const [timeZone, setTimeZone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || BUSINESS_TZ
  );
  const dates = useMemo(businessDays, []);
  const [dateIso, setDateIso] = useState(dates[0].iso);
  const [slotMs, setSlotMs] = useState(null);
  const [fields, setFields] = useState({ name: '', email: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const timeZones = useMemo(
    () => (typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [BUSINESS_TZ]),
    []
  );

  // Slots for the selected SAST business day, displayed in the visitor's zone.
  // Each slot's instant is anchored with an explicit +02:00 offset, so the
  // conversion is exact regardless of the visitor's clock.
  const slots = useMemo(() => {
    const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone });
    const now = Date.now();
    const out = [];
    for (let h = START_HOUR; h < END_HOUR; h += SLOT_MINUTES / 60) {
      const hh = String(Math.floor(h)).padStart(2, '0');
      const mm = String(Math.round((h % 1) * 60)).padStart(2, '0');
      const ms = Date.parse(`${dateIso}T${hh}:${mm}:00+02:00`);
      if (ms <= now) continue; // past slots
      const date = new Date(ms);
      const localIso = isoInTz(date, timeZone);
      out.push({
        ms,
        sast: `${hh}:${mm}`,
        local: timeFmt.format(date),
        // visitor's calendar day differs from the SAST business day (far-east /
        // far-west timezones) — the widget flags these
        dayShift: localIso === dateIso ? 0 : localIso > dateIso ? 1 : -1,
      });
    }
    return out;
  }, [dateIso, timeZone]);

  const selected = slots.find((s) => s.ms === slotMs) || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
  };

  const selectDate = (iso) => {
    setDateIso(iso);
    setSlotMs(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError('Please pick a time slot.');
      setStatus('error');
      return;
    }
    if (!fields.name.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) {
      setError('Please enter your name and a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      const fullLocal = new Intl.DateTimeFormat('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone,
      }).format(new Date(selected.ms));
      await submitBookingRequest({
        name: fields.name,
        email: fields.email,
        slotSast: `${dateIso} ${selected.sast} (SAST)`,
        slotLocal: fullLocal,
        timeZone,
      });
      setStatus('success');
    } catch (err) {
      console.warn('[useBookingForm] booking failed:', err.message);
      setError('Something went wrong sending your booking. Please try again, or call us directly.');
      setStatus('error');
    }
  };

  return {
    timeZones, timeZone, setTimeZone,
    dates, dateIso, selectDate,
    slots, slotMs, setSlotMs, selected,
    fields, handleChange, handleSubmit,
    status, error,
  };
}
