export const CSS_ID = 'rss-styles'

export const SHIMMER_CSS = `
@keyframes rss-shimmer-ltr {
  0%   { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
@keyframes rss-shimmer-rtl {
  0%   { background-position: calc(200px + 100%) 0; }
  100% { background-position: -200px 0; }
}
[data-rss-bone] {
  display: inline-block;
  line-height: 1;
  background: linear-gradient(
    90deg,
    var(--rss-color, #e2e8f0) 25%,
    var(--rss-highlight, #f8fafc) 50%,
    var(--rss-color, #e2e8f0) 75%
  );
  background-size: 200px 100%;
  animation: rss-shimmer-ltr var(--rss-duration, 1.5s) infinite linear;
  border-radius: var(--rss-border-radius, 4px);
}
[data-rss-direction="rtl"] [data-rss-bone] {
  animation-name: rss-shimmer-rtl;
}
[data-rss-no-animation] [data-rss-bone] {
  animation: none;
  background: var(--rss-color, #e2e8f0);
}
[data-rss-boundary] {
  display: contents;
}
[data-rss-bone]:not([data-rss-inline]) + [data-rss-bone]:not([data-rss-inline]) {
  margin-top: 0.5em;
}
[data-rss-bone][data-rss-inline] + [data-rss-bone][data-rss-inline] {
  margin-left: 0.5em;
}
[data-rss-direction="rtl"] [data-rss-bone][data-rss-inline] + [data-rss-bone][data-rss-inline] {
  margin-left: 0;
  margin-right: 0.5em;
}
@media (prefers-reduced-motion: reduce) {
  [data-rss-bone] {
    animation: none !important;
    background: var(--rss-color, #e2e8f0) !important;
  }
}
`

export function ensureStylesInjected(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(CSS_ID)) return

  const style = document.createElement('style')
  style.id = CSS_ID
  style.textContent = SHIMMER_CSS
  document.head.appendChild(style)
}
