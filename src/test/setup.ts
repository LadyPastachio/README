import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement matchMedia; provide a simple stand-in.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom doesn't implement scrolling; the app only uses it for convenience.
window.scrollTo = () => {};
