/** Diagram: browser asks DNS for an address, then exchanges request/response with the server. */
export function RequestDiagram() {
  return (
    <figure className="diagram">
      <div className="diagram__scroll">
        <svg viewBox="0 0 640 230" role="img" aria-labelledby="rd-title rd-desc" className="diagram__svg">
          <title id="rd-title">How a browser gets a page</title>
          <desc id="rd-desc">
            Step 1: the browser asks DNS for example.com's address and gets a number back. Step 2: it sends an HTTP GET request
            to the server. Step 3: the server replies with status 200 and the HTML. Step 4: the browser requests the CSS, JavaScript
            and images the HTML mentions.
          </desc>
          <defs>
            <marker id="rd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" fill="var(--ink-2)" />
            </marker>
          </defs>

          {/* Browser */}
          <rect x="12" y="62" width="150" height="104" rx="12" fill="var(--surface)" stroke="var(--line-strong)" />
          <rect x="12" y="62" width="150" height="24" rx="12" fill="var(--surface-2)" />
          <rect x="12" y="74" width="150" height="12" fill="var(--surface-2)" />
          <circle cx="28" cy="74" r="3.5" fill="var(--line-strong)" /><circle cx="40" cy="74" r="3.5" fill="var(--line-strong)" />
          <text x="87" y="122" textAnchor="middle" className="d-title">Browser</text>
          <text x="87" y="142" textAnchor="middle" className="d-sub">on your device</text>

          {/* DNS */}
          <rect x="248" y="8" width="144" height="54" rx="10" fill="var(--surface-2)" stroke="var(--line)" />
          <text x="320" y="31" textAnchor="middle" className="d-title">DNS</text>
          <text x="320" y="50" textAnchor="middle" className="d-sub">name → address</text>

          {/* Server */}
          <rect x="478" y="62" width="150" height="104" rx="12" fill="var(--surface)" stroke="var(--line-strong)" />
          <path d="M498 88h110M498 108h110M498 128h110" stroke="var(--line)" />
          <text x="553" y="152" textAnchor="middle" className="d-title">Server</text>

          {/* 1: DNS lookup */}
          <path d="M150 64 C 190 40, 210 36, 244 36" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rd-arrow)" />
          <circle cx="186" cy="46" r="10" fill="var(--accent)" /><text x="186" y="50" textAnchor="middle" className="d-num">1</text>

          {/* 2: request */}
          <path d="M166 98 H 472" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rd-arrow)" />
          <circle cx="210" cy="98" r="10" fill="var(--accent)" /><text x="210" y="102" textAnchor="middle" className="d-num">2</text>
          <text x="330" y="90" textAnchor="middle" className="d-code">GET /about</text>

          {/* 3: response */}
          <path d="M474 132 H 168" fill="none" stroke="var(--ink-2)" strokeWidth="1.5" markerEnd="url(#rd-arrow)" />
          <circle cx="430" cy="132" r="10" fill="var(--accent)" /><text x="430" y="136" textAnchor="middle" className="d-num">3</text>
          <text x="320" y="152" textAnchor="middle" className="d-code">200 OK · HTML</text>

          {/* 4: follow-up requests */}
          <path d="M87 172 C 87 210, 300 214, 520 172" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" strokeDasharray="5 5" markerEnd="url(#rd-arrow)" />
          <circle cx="300" cy="206" r="10" fill="var(--accent)" /><text x="300" y="210" textAnchor="middle" className="d-num">4</text>
          <text x="318" y="212" className="d-sub" textAnchor="start">then CSS, JS, images…</text>
        </svg>
      </div>
      <figcaption className="subtle">One page load: an address lookup, then a request and response, then more requests for what the HTML mentions.</figcaption>
    </figure>
  );
}
