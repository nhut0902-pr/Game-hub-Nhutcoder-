import React, { useMemo } from 'https://esm.sh/react@19.0.0';

const FLOWER_COUNT = 35;

const TetEffect: React.FC = () => {
  const flowers = useMemo(() => {
    return Array.from({ length: FLOWER_COUNT }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animationDuration: 5 + Math.random() * 10,
      animationDelay: Math.random() * 5,
      size: 15 + Math.random() * 20,
      swayDuration: 2 + Math.random() * 2,
      type: Math.random() > 0.5 ? 'mai' : 'dao',
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {flowers.map((f) => (
        <div
          key={f.id}
          className="falling-petal"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDuration: `${f.animationDuration}s, ${f.swayDuration}s`,
            animationDelay: `${f.animationDelay}s, 0s`,
          }}
        >
          {f.type === 'mai' ? (
             <svg viewBox="0 0 512 512" fill="#FFD700" className="drop-shadow-sm opacity-90">
                <path d="M256 0C233.1 46.1 204.6 96.8 159.4 116.2 110.6 137.1 53.6 132.3 8 154.5c-45.7 22.3-7.4 83.3 27.2 113.8 30.6 27 75.8 37.8 98.4 72.8 23.3 36.1 14.5 98.6 49.3 126.9 39.5 32.1 96-15.5 133.5-47.5 28.3-24.1 61.4-60.6 103.5-60.6 42.1 0 75.2 36.5 103.5 60.6 37.5 32 94 79.6 133.5 47.5 34.8-28.3 26-90.8 49.3-126.9 22.6-35 67.8-45.8 98.4-72.8 34.6-30.5 72.9-91.5 27.2-113.8-45.6-22.2-102.6-17.4-151.4-38.3-45.2-19.4-73.7-70.1-96.6-116.2z" />
                <circle cx="256" cy="256" r="40" fill="#DAA520" />
             </svg>
          ) : (
             <svg viewBox="0 0 512 512" fill="#FF99CC" className="drop-shadow-sm opacity-90">
                <path d="M256 0C233.1 46.1 204.6 96.8 159.4 116.2 110.6 137.1 53.6 132.3 8 154.5c-45.7 22.3-7.4 83.3 27.2 113.8 30.6 27 75.8 37.8 98.4 72.8 23.3 36.1 14.5 98.6 49.3 126.9 39.5 32.1 96-15.5 133.5-47.5 28.3-24.1 61.4-60.6 103.5-60.6 42.1 0 75.2 36.5 103.5 60.6 37.5 32 94 79.6 133.5 47.5 34.8-28.3 26-90.8 49.3-126.9 22.6-35 67.8-45.8 98.4-72.8 34.6-30.5 72.9-91.5 27.2-113.8-45.6-22.2-102.6-17.4-151.4-38.3-45.2-19.4-73.7-70.1-96.6-116.2z" />
                <circle cx="256" cy="256" r="40" fill="#C71585" />
             </svg>
          )}
        </div>
      ))}
    </div>
  );
};

export default TetEffect;