'use client';

interface ArmeniaMapProps {
  regionCounts?: Record<string, number>;
  selectedRegionId?: string;
  onRegionClick?: (svgPathId: string) => void;
}

// SVG path data for Armenia's 11 regions
// svgPathId values match the database Region.svgPathId field
const REGIONS = [
  { id: 'aragatsotn', name: 'Aragatsotn', d: 'M120,80 L160,60 L200,80 L190,120 L150,130 L120,110 Z' },
  { id: 'ararat', name: 'Ararat', d: 'M170,180 L220,160 L260,180 L250,220 L200,230 L170,210 Z' },
  { id: 'armavir', name: 'Armavir', d: 'M80,130 L130,110 L150,140 L140,170 L100,180 L80,160 Z' },
  { id: 'gegharkunik', name: 'Gegharkunik', d: 'M260,80 L320,60 L360,90 L350,140 L300,150 L260,120 Z' },
  { id: 'kotayk', name: 'Kotayk', d: 'M190,110 L240,90 L260,120 L250,160 L210,170 L190,140 Z' },
  { id: 'lori', name: 'Lori', d: 'M160,20 L220,10 L250,40 L240,70 L200,80 L170,60 Z' },
  { id: 'shirak', name: 'Shirak', d: 'M60,30 L120,20 L140,50 L130,80 L90,90 L60,60 Z' },
  { id: 'syunik', name: 'Syunik', d: 'M280,240 L330,220 L360,260 L340,310 L300,320 L280,280 Z' },
  { id: 'tavush', name: 'Tavush', d: 'M250,30 L310,20 L340,50 L320,80 L280,70 L260,50 Z' },
  { id: 'vayots-dzor', name: 'Vayots Dzor', d: 'M240,180 L290,170 L310,200 L290,240 L260,240 L240,210 Z' },
  { id: 'yerevan', name: 'Yerevan', d: 'M150,140 L180,130 L195,150 L185,170 L160,175 L148,158 Z' },
];

export function ArmeniaMap({ regionCounts = {}, selectedRegionId, onRegionClick }: ArmeniaMapProps) {
  return (
    <svg viewBox="0 0 400 340" className="w-full max-w-lg">
      {REGIONS.map((region) => {
        const count = regionCounts[region.id] || 0;
        const isSelected = selectedRegionId === region.id;
        const hasCount = count > 0;

        return (
          <g key={region.id} onClick={() => onRegionClick?.(region.id)} className="cursor-pointer">
            <path
              d={region.d}
              fill={isSelected ? '#f97316' : hasCount ? '#fed7aa' : '#f3f4f6'}
              stroke="#9ca3af"
              strokeWidth={1}
              className="transition-colors hover:fill-orange-200"
            />
            <title>{region.name}{count ? ` (${count})` : ''}</title>
          </g>
        );
      })}
    </svg>
  );
}
