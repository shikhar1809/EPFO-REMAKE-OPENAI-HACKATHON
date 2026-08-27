import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  intervalMs?: number;
}

export const SwappableCards: React.FC<Props> = ({ children, intervalMs = 5000 }) => {
  const cards = React.Children.toArray(children);
  const count = cards.length;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, paused]);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const target = el.children[active] as HTMLElement | undefined;
    if (target) el.scrollTo({ left: target.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, [active]);

  const goTo = (i: number) => setActive(((i % count) + count) % count);

  return (
    <section
      className='relative'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setTimeout(() => setPaused(false), 2500)}
    >
      <div ref={railRef} className='overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth flex items-stretch'>
        {cards.map((card, i) => (
          <div key={i} className='snap-center shrink-0 w-full'>
            {card}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className='flex items-center justify-center gap-3 mt-1.5'>
          <button
            onClick={() => goTo(active - 1)}
            className='p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors'
            aria-label='Previous card'
          >
            <ChevronLeft className='w-3.5 h-3.5' />
          </button>
          <div className='flex gap-1.5'>
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'bg-epfo-blue w-4' : 'bg-slate-300 w-1.5'}`}
                aria-label={`Card ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(active + 1)}
            className='p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors'
            aria-label='Next card'
          >
            <ChevronRight className='w-3.5 h-3.5' />
          </button>
        </div>
      )}
    </section>
  );
};