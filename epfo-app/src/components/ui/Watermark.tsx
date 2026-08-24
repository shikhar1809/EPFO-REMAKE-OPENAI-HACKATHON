import { useMemo } from 'react';
import * as Icons from 'lucide-react';

const ICON_KEYS = [
  'Landmark', 'Users', 'Shield', 'Wallet', 'Briefcase', 'FileText', 
  'PiggyBank', 'GraduationCap', 'HeartPulse', 'Building2', 'UserCircle2', 
  'BadgeCheck', 'FileCheck2', 'Globe2', 'Banknote', 'HandCoins'
];

const COLORS = ['text-epfo-blue', 'text-epfo-orange', 'text-slate-900'];

export const Watermark = () => {
  const elements = useMemo(() => {
    // Generate 3 to 5 random background illustrations
    const count = Math.floor(Math.random() * 3) + 3;
    const selected = [];
    
    // Pre-defined zones to prevent overlapping in the exact same spot
    const zones = [
      { top: '15%', left: '15%' },
      { top: '15%', left: '85%' },
      { top: '85%', left: '15%' },
      { top: '85%', left: '85%' },
      { top: '50%', left: '50%' },
      { top: '50%', left: '15%' },
      { top: '50%', left: '85%' },
    ];
    
    // Shuffle zones
    zones.sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const iconName = ICON_KEYS[Math.floor(Math.random() * ICON_KEYS.length)];
      // @ts-ignore
      const IconComponent = Icons[iconName];
      const colorClass = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      const size = Math.floor(Math.random() * 200) + 200; // 200px to 400px
      const rotate = Math.floor(Math.random() * 120) - 60; // -60deg to +60deg
      
      // Jitter the exact position slightly
      const jitterTop = Math.floor(Math.random() * 20) - 10;
      const jitterLeft = Math.floor(Math.random() * 20) - 10;
      
      const zone = zones[i];
      const top = `calc(${zone.top} + ${jitterTop}%)`;
      const left = `calc(${zone.left} + ${jitterLeft}%)`;

      selected.push({
        id: i,
        IconComponent,
        colorClass,
        size,
        rotate,
        top,
        left
      });
    }
    return selected;
  }, []); // Re-runs on every mount

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-[0.03]">
      {elements.map((el) => {
        const { IconComponent } = el;
        return (
          <IconComponent 
            key={el.id}
            className={`absolute ${el.colorClass}`}
            style={{
              top: el.top,
              left: el.left,
              width: el.size,
              height: el.size,
              transform: `translate(-50%, -50%) rotate(${el.rotate}deg)`,
            }}
            strokeWidth={1} 
          />
        );
      })}
    </div>
  );
};
