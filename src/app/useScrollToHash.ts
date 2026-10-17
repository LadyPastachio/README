import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to the element named after the second "#" in the URL
 * (e.g. #/progress#skill-json) and marks it so CSS can highlight it.
 * Needed because hash-based routes stop the browser doing this itself.
 */
export function useScrollToHash(block: ScrollLogicalPosition = 'center') {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!el) return;
    el.scrollIntoView?.({ block });
    el.classList.add('is-target');
    const t = setTimeout(() => el.classList.remove('is-target'), 2400);
    return () => {
      clearTimeout(t);
      el.classList.remove('is-target');
    };
  }, [hash, block]);
}
