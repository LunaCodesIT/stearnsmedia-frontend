// Contact form delivery. Two channels:
//  1. FormSubmit (https://formsubmit.co) — primary email delivery. No account
//     needed: the first submission sends an activation email to the target
//     inbox, which the client must confirm once.
//  2. HubSpot CRM Forms API — optional lead capture, only attempted when
//     VITE_HUBSPOT_PORTAL_ID and VITE_HUBSPOT_FORM_GUID are configured.
import {
  FORMSUBMIT_TARGET,
  HUBSPOT_PORTAL_ID,
  HUBSPOT_FORM_GUID,
} from '@/lib/constants';

async function submitToFormSubmit({ name, email, phone, message }) {
  const res = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_TARGET}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone,
      message,
      _subject: 'New enquiry — stearnsmedia.com',
      _template: 'table',
    }),
  });
  if (!res.ok) throw new Error(`FormSubmit responded ${res.status}`);
  const data = await res.json();
  if (String(data.success) !== 'true') {
    throw new Error(data.message || 'FormSubmit rejected the submission');
  }
  return data;
}

async function submitToHubspot({ name, email, phone, message }) {
  if (!HUBSPOT_PORTAL_ID || !HUBSPOT_FORM_GUID) return null; // not configured — skip
  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;
  const [firstname, ...rest] = name.trim().split(/\s+/);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: [
        { objectTypeId: '0-1', name: 'firstname', value: firstname },
        { objectTypeId: '0-1', name: 'lastname', value: rest.join(' ') },
        { objectTypeId: '0-1', name: 'email', value: email },
        { objectTypeId: '0-1', name: 'phone', value: phone },
        { objectTypeId: '0-1', name: 'message', value: message },
      ],
      context: { pageUri: window.location.href, pageName: document.title },
    }),
  });
  if (!res.ok) throw new Error(`HubSpot responded ${res.status}`);
  return res.json();
}

// Email delivery is the source of truth for success; the HubSpot push is best
// effort and must never fail a submission the client already received by email.
export async function submitContactForm(fields) {
  const result = await submitToFormSubmit(fields);
  try {
    await submitToHubspot(fields);
  } catch (err) {
    console.warn('[contactFormService] HubSpot push failed (non-fatal):', err.message);
  }
  return result;
}
