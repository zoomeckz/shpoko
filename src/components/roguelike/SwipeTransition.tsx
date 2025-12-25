import { useEffect, useState } from 'react';

interface SwipeTransitionProps {
  isActive: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  onComplete?: () => void;
  children?: React.ReactNode;
}

export function SwipeTransition({ 
  isActive, 
  direction = 'left', 
  onComplete,
  children 
}: SwipeTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'entering' | 'full' | 'exiting'>('idle');

  useEffect(() => {
    if (isActive) {
      setPhase('entering');
      const timer1 = setTimeout(() => setPhase('full'), 300);
      const timer2 = setTimeout(() => {
        setPhase('exiting');
        onComplete?.();
      }, 600);
      const timer3 = setTimeout(() => setPhase('idle'), 900);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isActive, onComplete]);

  if (phase === 'idle') return null;

  const getTransform = () => {
    const transforms = {
      left: {
        entering: 'translateX(100%)',
        full: 'translateX(0)',
        exiting: 'translateX(-100%)',
      },
      right: {
        entering: 'translateX(-100%)',
        full: 'translateX(0)',
        exiting: 'translateX(100%)',
      },
      up: {
        entering: 'translateY(100%)',
        full: 'translateY(0)',
        exiting: 'translateY(-100%)',
      },
      down: {
        entering: 'translateY(-100%)',
        full: 'translateY(0)',
        exiting: 'translateY(100%)',
      },
    };

    return transforms[direction][phase as 'entering' | 'full' | 'exiting'];
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-primary flex items-center justify-center"
      style={{
        transform: getTransform(),
        transition: 'transform 0.3s ease-in-out',
      }}
    >
      {children || (
        <div className="text-primary-foreground text-4xl font-bold">
          Shpoko
        </div>
      )}
    </div>
  );
}
