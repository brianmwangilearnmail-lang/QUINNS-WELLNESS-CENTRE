import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSite } from '../context/SiteContext';

const SLIDE_DURATION = 5000; // ms per slide

function useSwipe(onLeft: () => void, onRight: () => void) {
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? onLeft() : onRight();
    touchStart.current = null;
  };
  return { onTouchStart, onTouchEnd };
}

export const Hero: React.FC = () => {
  const { hero } = useSite();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    if (!hero || hero.length <= 1) return;
    goTo((current + 1) % hero.length, 1);
  }, [current, hero, goTo]);

  const prev = useCallback(() => {
    if (!hero || hero.length <= 1) return;
    goTo(current === 0 ? hero.length - 1 : current - 1, -1);
  }, [current, hero, goTo]);

  // Auto-advance
  useEffect(() => {
    if (!hero || hero.length <= 1 || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % hero.length);
      setDirection(1);
    }, SLIDE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hero?.length, isPaused, current]);

  // Touch swipe support
  const swipe = useSwipe(next, prev);

  // Clean loading skeleton while banners haven't been set yet
  if (!hero || hero.length === 0) {
    return (
      <div
        className="w-full mt-14 md:mt-20 bg-gradient-to-r from-[#14532d]/10 via-[#14532d]/5 to-[#14532d]/10 animate-pulse flex items-center justify-center"
        style={{ height: 'min(56.25vw, 60vh)', minHeight: '200px' }}
      >
        <div className="flex flex-col items-center gap-3 opacity-40">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-[#14532d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 3h18M3 21h18" />
          </svg>
          <p className="text-[#14532d] text-[10px] md:text-xs font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const currentBanner = hero[current];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  return (
    <main
      className="relative w-full overflow-hidden bg-black mt-14 md:mt-24 z-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...swipe}
    >
      {/* Slide container — 16:9 ratio, capped at 80vh */}
      <div
        className="relative w-full"
        style={{ paddingBottom: 'min(56.25%, 80vh)' }}
      >
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={currentBanner?.id ?? current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', ease: [0.77, 0, 0.175, 1], duration: 0.65 },
              opacity: { duration: 0.4 },
            }}
            className="absolute inset-0 w-full h-full cursor-pointer"
            onClick={() => {
              const target = currentBanner?.link;
              if (!target) {
                document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
                return;
              }
              if (target.startsWith('#')) {
                document.getElementById(target.substring(1))?.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.open(target, '_blank', 'noopener');
              }
            }}
          >
            {currentBanner?.image ? (
              <img
                src={currentBanner.image}
                alt="Banner"
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <p className="font-black text-xl text-gray-400 uppercase tracking-widest">No Banner Image</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows */}
        {hero.length > 1 && (
          <>
            <button
              aria-label="Previous banner"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-sm active:scale-90"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              aria-label="Next banner"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/25 hover:bg-black/50 text-white flex items-center justify-center transition-all backdrop-blur-sm active:scale-90"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Bottom controls: dots + progress bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-2 pb-4 px-6">
              {/* Dot indicators */}
              <div className="flex gap-2">
                {hero.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to banner ${i + 1}`}
                    onClick={(e) => { e.stopPropagation(); goTo(i, i > current ? 1 : -1); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === current
                        ? 'bg-white w-7 h-2 shadow'
                        : 'bg-white/40 hover:bg-white/70 w-2 h-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};
