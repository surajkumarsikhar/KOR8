'use client';

import { useRef, useState, type FormEvent } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/intro';
import { contact, site } from '@/content/site';
import { cn } from '@/lib/utils';
import AccentText from '@/components/ui/AccentText';
import MagneticButton from '@/components/ui/MagneticButton';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** The one pure-white (grained) section, entered through a diagonal clip-path wipe. */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [need, setNeed] = useState<string[]>([]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Diagonal wipe from the black page into white: the right edge leads.
      gsap.fromTo(
        '[data-wipe]',
        { clipPath: 'polygon(0% 100%, 100% 55%, 100% 100%, 0% 100%)' },
        {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 15%', scrub: true },
        },
      );

      // Headline letters lean subtly away from the cursor.
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const chars = gsap.utils.toArray<HTMLElement>('[data-char]');
      const setters = chars.map((c) => ({
        el: c,
        x: gsap.quickTo(c, 'x', { duration: 0.8, ease: 'power3.out' }),
        y: gsap.quickTo(c, 'y', { duration: 0.8, ease: 'power3.out' }),
      }));
      const move = (e: PointerEvent) => {
        setters.forEach(({ el, x, y }) => {
          const r = el.getBoundingClientRect();
          const dx = r.left + r.width / 2 - e.clientX;
          const dy = r.top + r.height / 2 - e.clientY;
          const d = Math.hypot(dx, dy);
          const f = Math.max(0, 1 - d / 260) * 14;
          x(d ? (dx / d) * f : 0);
          y(d ? (dy / d) * f : 0);
        });
      };
      const h1 = root.current!.querySelector<HTMLElement>('[data-react]')!;
      const leave = () => setters.forEach(({ x, y }) => (x(0), y(0)));
      h1.addEventListener('pointermove', move);
      h1.addEventListener('pointerleave', leave);
      return () => {
        h1.removeEventListener('pointermove', move);
        h1.removeEventListener('pointerleave', leave);
      };
    },
    { scope: root },
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, need }),
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
      form.reset();
      setNeed([]);
    } catch {
      setStatus('error');
    }
  };

  const field =
    'w-full border-b border-black/20 bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-black/35 focus:border-accent';

  return (
    <section ref={root} id="contact" className="relative">
      <div
        data-wipe
        className="paper relative min-h-svh px-5 pb-24 pt-[18vh] md:px-10"
        style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
      >
        <div className="paper-grain-soft" />
        <div className="relative mx-auto grid max-w-[1280px] gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="label mb-6">[ contact ] · 05</p>
            <h2 data-react className="headline text-[clamp(3rem,7.4vw,8rem)]">
              {contact.headline.map((line) => (
                <span key={line} className="block">
                  {line.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, pi) =>
                    part.startsWith('*') ? (
                      <AccentText key={pi} text={part} accentClassName="accent-italic text-accent" />
                    ) : (
                      part.split(/(\s+)/).map((word, wi) =>
                        /^\s+$/.test(word) || word === '' ? (
                          word
                        ) : (
                          <span key={`${pi}-${wi}`} className="inline-block whitespace-nowrap">
                            {word.split('').map((ch, ci) => (
                              <span key={ci} data-char className="inline-block">
                                {ch}
                              </span>
                            ))}
                          </span>
                        ),
                      )
                    ),
                  )}
                </span>
              ))}
            </h2>
            <p className="mt-8 max-w-md text-lg text-black/65">{contact.sub}</p>
            <a href={`mailto:${site.email}`} className="mt-10 inline-block border-b border-black pb-1 text-2xl hover:border-accent hover:text-accent">
              {site.email}
            </a>
          </div>

          <form onSubmit={submit} className="space-y-8 md:col-span-5 md:pt-24" noValidate={false}>
            <label className="block">
              <span className="label">A. Name</span>
              <input name="name" required autoComplete="name" className={field} placeholder="Your name" />
            </label>
            <label className="block">
              <span className="label">B. Email</span>
              <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@company.com" />
            </label>
            <fieldset>
              <legend className="label mb-3">C. What you need</legend>
              <div className="flex flex-wrap gap-2">
                {contact.needs.map((n) => {
                  const on = need.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setNeed((s) => (on ? s.filter((x) => x !== n) : [...s, n]))}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm transition-colors',
                        on ? 'border-black bg-black text-white' : 'border-black/20 hover:border-black',
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label className="block">
              <span className="label">D. Budget range</span>
              <select name="budget" defaultValue="" className={cn(field, 'appearance-none')}>
                <option value="" disabled>Select a range</option>
                {contact.budgets.map((b) => <option key={b}>{b}</option>)}
              </select>
            </label>

            <div className="flex items-center gap-6 pt-2">
              <MagneticButton
                type="submit"
                disabled={status === 'sending' || status === 'sent'}
                className={cn(
                  'h-14 border-black bg-black px-8 text-white hover:border-accent hover:bg-accent',
                  status === 'sent' && 'w-14 bg-accent px-0',
                )}
              >
                {status === 'sent' ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" aria-label="Sent">
                    <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2" className="animate-[draw_0.6s_ease-out_forwards] [stroke-dasharray:24] [stroke-dashoffset:24]" />
                  </svg>
                ) : status === 'sending' ? (
                  'Sending…'
                ) : (
                  'Start a project'
                )}
              </MagneticButton>
              <p className="label" role="status" aria-live="polite">
                {status === 'sent' && 'Thanks. We reply within one working day.'}
                {status === 'error' && <span className="text-accent">Your enquiry wasn&apos;t sent. <a className="underline" href={`mailto:${site.email}`}>Email us instead.</a></span>}
              </p>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes draw { to { stroke-dashoffset: 0 } }`}</style>
    </section>
  );
}

