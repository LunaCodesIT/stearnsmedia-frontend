// Booking-request delivery — same two channels as the contact form:
// FormSubmit email (primary) plus best-effort HubSpot CRM lead capture.
import {
  FORMSUBMIT_TARGET,
  HUBSPOT_PORTAL_ID,
  HUBSPOT_FORM_GUID,
} from '@/lib/constants';

export async function submitBookingRequest({ name, email, slotSast, slotLocal, timeZone }) {
  const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_TARGET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name,
      email,
      'requested-slot-sast': slotSast,
      'requested-slot-visitor-time': `${slotLocal} (${timeZone})`,
      _subject: 'New discovery call booking — stearnsmedia.com',
      _template: 'table',
    }),
  });
  if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
  const data = await res.json();
  if (String(data.success) !== 'true') {
    throw new Error(data.message || 'FormSubmit rejected the submission');
  }

  // Best effort — never fail a booking the client already received by email
  if (HUBSPOT_PORTAL_ID && HUBSPOT_FORM_GUID) {
    try {
      const [firstname, ...rest] = name.trim().split(/\s+/);
      await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: [
              { objectTypeId: '0-1', name: 'firstname', value: firstname },
              { objectTypeId: '0-1', name: 'lastname', value: rest.join(' ') },
              { objectTypeId: '0-1', name: 'email', value: email },
              { objectTypeId: '0-1', name: 'message', value: `Discovery call request: ${slotSast} / ${slotLocal} (${timeZone})` },
            ],
            context: { pageUri: window.location.href, pageName: document.title },
          }),
        }
      );
    } catch (err) {
      console.warn('[bookingService] HubSpot push failed (non-fatal):', err.message);
    }
  }
  return data;
}
