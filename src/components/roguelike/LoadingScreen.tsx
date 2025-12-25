import { useEffect, useState } from 'react';
import shpokoLoading from '@/assets/roguelike/shpoko_loading.png';

interface LoadingScreenProps {
  isLoading: boolean;
  onComplete: () => void;
  minDuration?: number;
}

export function LoadingScreen({ isLoading, onComplete, minDuration = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (isLoading ? 2 : 10);
        return Math.min(newProgress, isLoading ? 90 : 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && progress >= 100) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);
      
      setTimeout(() => {
        setShow(false);
        setTimeout(onComplete, 500); // Wait for fade out
      }, remaining);
    }
  }, [isLoading, progress, onComplete, minDuration, startTime]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        progress >= 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img 
        src={shpokoLoading} 
        alt="Loading" 
        className="w-full max-w-2xl h-auto object-contain"
      />
      
      <div className="mt-8 w-64 h-4 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-200 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="mt-4 text-muted-foreground animate-pulse">
        Зареждане... {Math.floor(progress)}%
      </p>
    </div>
  );
}
