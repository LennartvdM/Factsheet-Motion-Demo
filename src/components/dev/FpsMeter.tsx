import { memo, useEffect, useRef, useState } from 'react';

const FpsMeterComponent = () => {
  const [fps, setFps] = useState(0);
  const frameRef = useRef<number>();
  const lastSampleRef = useRef(performance.now());
  const framesRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const loop = (timestamp: number) => {
      framesRef.current += 1;
      const delta = timestamp - lastSampleRef.current;

      if (delta >= 500) {
        const nextFps = Math.round((framesRef.current * 1000) / delta);
        if (mounted) {
          setFps(nextFps);
        }
        framesRef.current = 0;
        lastSampleRef.current = timestamp;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      mounted = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] rounded-lg bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-100 shadow-lg shadow-slate-950/40 ring-1 ring-sky-500/40">
      {fps} FPS
    </div>
  );
};

export const FpsMeter = memo(FpsMeterComponent);

export default FpsMeter;
