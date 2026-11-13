import { Fragment } from 'react';

/**
 * Renders a line of copy where *word* becomes the italic-serif accent.
 * Each word is wrapped so SplitText-free reveals and scrubs can target it.
 */
export default function AccentText({ text, accentClassName = 'accent-italic' }: { text: string; accentClassName?: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('*') ? (
          <em key={i} className={accentClassName}>
            {p.slice(1, -1)}
          </em>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

