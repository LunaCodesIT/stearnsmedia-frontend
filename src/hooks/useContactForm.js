import { useState } from 'react';
import { submitContactForm } from '@/services/contactFormService';

const EMPTY = { name: '', email: '', phone: '', message: '' };

// All contact-form behaviour: field state, validation, submission lifecycle.
// The component only renders what this hook exposes.
export function useContactForm() {
  const [fields, setFields] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    if (!fields.name.trim()) return 'Please enter your name.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(fields.email)) return 'Please enter a valid email address.';
    if (!fields.message.trim()) return 'Please enter a message.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setError('');
    try {
      await submitContactForm(fields);
      setStatus('success');
      setFields(EMPTY);
    } catch (err) {
      console.warn('[useContactForm] submission failed:', err.message);
      setError('Something went wrong sending your message. Please try again, or call us directly.');
      setStatus('error');
    }
  };

  return { fields, status, error, handleChange, handleSubmit };
}
