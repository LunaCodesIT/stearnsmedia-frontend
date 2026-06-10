import { Globe2, Loader2, CalendarCheck } from 'lucide-react';
import { useBookingForm } from '@/hooks/useBookingForm';

const INPUT_CLASS =
  'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-stearns-green-light focus:ring-2 focus:ring-stearns-green/30 transition-colors';

// Discovery-call booking with timezone conversion: slots are SAST business
// hours, shown in the visitor's (auto-detected, changeable) timezone. All
// behaviour comes from useBookingForm; this component only renders.
export function BookingWidget() {
  const {
    timeZones, timeZone, setTimeZone,
    dates, dateIso, selectDate,
    slots, slotMs, setSlotMs, selected,
    fields, handleChange, handleSubmit,
    status, error,
  } = useBookingForm();

  if (status === 'success') {
    return (
      <div className="px-6 sm:px-8 py-12 text-center">
        <CalendarCheck size={36} className="mx-auto text-stearns-green-light mb-4" />
        <p className="text-white font-semibold mb-2">Booking request sent!</p>
        <p className="text-white/55 text-sm">
          We&apos;ll confirm your discovery call by email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="px-6 sm:px-8 pb-8 pt-5 space-y-5">
      {/* Timezone converter */}
      <label className="block">
        <span className="flex items-center gap-2 text-white/55 text-xs uppercase tracking-wider mb-2">
          <Globe2 size={13} /> Times shown in your timezone
        </span>
        <select
          value={timeZone}
          onChange={(e) => setTimeZone(e.target.value)}
          className={`${INPUT_CLASS} appearance-none cursor-pointer`}
        >
          {timeZones.map((tz) => (
            <option key={tz} value={tz} className="bg-stearns-dark text-white">
              {tz.replaceAll('_', ' ')}
            </option>
          ))}
        </select>
      </label>

      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {dates.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => selectDate(d.iso)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors duration-200 ${
              d.iso === dateIso
                ? 'bg-stearns-green border-stearns-green text-white'
                : 'border-white/15 text-white/60 hover:border-stearns-green-light hover:text-white'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Time picker */}
      {slots.length === 0 ? (
        <p className="text-white/45 text-sm">No slots left on this day — pick another date.</p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {slots.map((s) => (
            <button
              key={s.ms}
              type="button"
              onClick={() => setSlotMs(s.ms)}
              className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-colors duration-200 ${
                s.ms === slotMs
                  ? 'bg-stearns-green border-stearns-green text-white'
                  : 'border-white/15 text-white/70 hover:border-stearns-green-light'
              }`}
            >
              {s.local}
              {s.dayShift !== 0 && (
                <span className="block text-[9px] font-normal text-stearns-gold">
                  {s.dayShift > 0 ? '+1 day' : '−1 day'}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <p className="text-white/45 text-xs">
          {selected.local} your time = {selected.sast} SAST (our office, South Africa)
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="name"
          placeholder="Name"
          autoComplete="name"
          value={fields.name}
          onChange={handleChange}
          className={INPUT_CLASS}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          value={fields.email}
          onChange={handleChange}
          className={INPUT_CLASS}
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center gap-2 bg-stearns-green text-white px-7 py-3.5 rounded-full font-bold text-sm hover:shadow-[0_8px_30px_rgba(28,89,55,0.4)] transition-shadow duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
        {status === 'submitting' ? 'Booking…' : 'Request Booking'}
      </button>
    </form>
  );
}
