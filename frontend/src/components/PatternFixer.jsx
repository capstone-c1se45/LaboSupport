import { useEffect } from 'react';

export default function PatternFixer() {
  useEffect(() => {
    try {
      // Remove strict pattern on OTP inputs if present to avoid native blocking
      document.querySelectorAll('input[pattern]').forEach((el) => {
        const pat = el.getAttribute('pattern') || '';
        if (pat.includes('\\d{6}') || pat.includes('d{6}')) {
          el.removeAttribute('pattern');
          el.setAttribute('inputmode', 'numeric');
          el.setAttribute('autocomplete', 'one-time-code');
          el.setAttribute('maxlength', '6');
        }
      });
    } catch {}
  }, []);
  return null;
}

