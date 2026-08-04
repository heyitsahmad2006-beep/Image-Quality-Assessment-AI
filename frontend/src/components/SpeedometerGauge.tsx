import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gauge, BarChart2 } from 'lucide-react';

export interface QualitySpeedometerProps {
  score?: number;
  suitability?: string;
  category?: 'Worst' | 'Average' | 'Good' | 'Best';
  isAnimating?: boolean;
}

// SVG Arc Geometry Helpers
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(x: number, y: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, r, endAngle);
  const end = polarToCartesian(x, y, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

// Category Configuration Map
const CATEGORY_CONFIG = {
  Worst: {
    color: '#EF4444',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
    suitability: 'Not Suitable',
    explanation: 'This image has critical quality defects and is not recommended for downstream CV tasks.'
  },
  Average: {
    color: '#F59E0B',
    badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    suitability: 'Needs Improvement',
    explanation: 'This image has moderate quality issues that may affect downstream accuracy.'
  },
  Good: {
    color: '#38BDF8',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.2)]',
    suitability: 'Suitable',
    explanation: 'This image is suitable for most downstream computer-vision tasks.'
  },
  Best: {
    color: '#8B5CF6',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]',
    suitability: 'Highly Suitable',
    explanation: 'This image is highly suitable for high-precision computer-vision processing.'
  }
};

const CX = 200;
const CY = 158;
const RADIUS = 120;
const STROKE_WIDTH = 14;

const MAJOR_TICKS = [
  { value: 0, angle: -180 },
  { value: 25, angle: -135 },
  { value: 50, angle: -90 },
  { value: 75, angle: -45 },
  { value: 100, angle: 0 },
];

const MINOR_TICKS = Array.from({ length: 21 }, (_, i) => i * 5)
  .filter((v) => v % 25 !== 0)
  .map((v) => ({ value: v, angle: -180 + (v / 100) * 180 }));

const SEGMENT_LABELS = [
  { text: 'Worst', angle: -157.5, color: '#EF4444' },
  { text: 'Average', angle: -112.5, color: '#F59E0B' },
  { text: 'Good', angle: -67.5, color: '#38BDF8' },
  { text: 'Best', angle: -22.5, color: '#8B5CF6' },
];

export const QualitySpeedometer: React.FC<QualitySpeedometerProps> = ({
  score,
  suitability: propSuitability,
  category: propCategory,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [viewMode, setViewMode] = useState<'gauge' | 'vertical'>('gauge');

  const hasScore = score !== undefined && score !== null && !isNaN(Number(score));
  const clampedScore = hasScore ? Math.max(0, Math.min(100, Number(score))) : 0;

  const category: 'Worst' | 'Average' | 'Good' | 'Best' = propCategory || (
    clampedScore < 25 ? 'Worst' : clampedScore < 50 ? 'Average' : clampedScore < 75 ? 'Good' : 'Best'
  );

  const config = CATEGORY_CONFIG[category];
  const suitability = propSuitability || config.suitability;
  const visualNeedleAngle = (180 + (clampedScore / 100) * 180) - 270;

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!hasScore) {
      setDisplayScore(0);
      return;
    }
    if (shouldReduceMotion) {
      setDisplayScore(Math.round(clampedScore));
      return;
    }

    const end = Math.round(clampedScore);
    const duration = 1400;
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      setDisplayScore(Math.round(end * easeOutQuad(progress)));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [clampedScore, hasScore, shouldReduceMotion]);

  return (
    <div
      className="w-full max-w-[540px] mx-auto bg-dark-900/90 rounded-3xl p-6 border border-purple-900/30 shadow-purple-card relative overflow-hidden backdrop-blur-md"
      aria-label={`Downstream Suitability Gauge. Score: ${displayScore} out of 100, Category: ${category}, Suitability: ${suitability}`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-900/15 blur-3xl pointer-events-none rounded-full" />

      {/* Header Bar with Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 font-mono">
          AI Downstream Suitability Gauge
        </span>

        <div className="flex items-center bg-dark-800/80 p-0.5 rounded-lg border border-purple-900/40">
          <button
            onClick={() => setViewMode('gauge')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              viewMode === 'gauge' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Gauge className="w-3 h-3" />
            <span>Gauge</span>
          </button>
          <button
            onClick={() => setViewMode('vertical')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
              viewMode === 'vertical' ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Vertical</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: AUTOMOTIVE SPEEDOMETER GAUGE */}
      {viewMode === 'gauge' && (
        <div className="relative w-full flex justify-center items-center">
          <svg viewBox="0 0 400 230" className="w-full max-w-[460px] h-auto overflow-visible select-none">
            <defs>
              <filter id="gauge-glow-soft" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="needle-razor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="pivot-cap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B0764" />
                <stop offset="100%" stopColor="#0F0919" />
              </linearGradient>
            </defs>

            {/* Dark Gauge Background Arc Track */}
            <path
              d={describeArc(CX, CY, RADIUS, -180, 0)}
              fill="none"
              stroke="#130B24"
              strokeWidth={STROKE_WIDTH + 4}
              strokeLinecap="round"
            />

            {/* 4 Colored Range Arcs */}
            <path d={describeArc(CX, CY, RADIUS, -180, -135)} fill="none" stroke="#EF4444" strokeWidth={STROKE_WIDTH} strokeOpacity={0.85} strokeLinecap="round" />
            <path d={describeArc(CX, CY, RADIUS, -135, -90)} fill="none" stroke="#F59E0B" strokeWidth={STROKE_WIDTH} strokeOpacity={0.85} />
            <path d={describeArc(CX, CY, RADIUS, -90, -45)} fill="none" stroke="#38BDF8" strokeWidth={STROKE_WIDTH} strokeOpacity={0.85} />
            <path d={describeArc(CX, CY, RADIUS, -45, 0)} fill="none" stroke="#8B5CF6" strokeWidth={STROKE_WIDTH} strokeOpacity={0.85} strokeLinecap="round" />

            {/* Active Range Highlight Arc */}
            <path
              d={describeArc(
                CX, CY, RADIUS,
                category === 'Worst' ? -180 : category === 'Average' ? -135 : category === 'Good' ? -90 : -45,
                category === 'Worst' ? -135 : category === 'Average' ? -90 : category === 'Good' ? -45 : 0
              )}
              fill="none"
              stroke={config.color}
              strokeWidth={STROKE_WIDTH + 2}
              filter="url(#gauge-glow-soft)"
            />

            {/* Minor Ticks */}
            {MINOR_TICKS.map(({ value, angle }) => {
              const inner = polarToCartesian(CX, CY, RADIUS - STROKE_WIDTH / 2 - 4, angle);
              const outer = polarToCartesian(CX, CY, RADIUS - STROKE_WIDTH / 2 - 10, angle);
              return <line key={`minor-${value}`} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#4C1D95" strokeWidth={1} strokeOpacity={0.6} />;
            })}

            {/* Major Ticks & Scale Numbers */}
            {MAJOR_TICKS.map(({ value, angle }) => {
              const inner = polarToCartesian(CX, CY, RADIUS - STROKE_WIDTH / 2 - 2, angle);
              const outer = polarToCartesian(CX, CY, RADIUS - STROKE_WIDTH / 2 - 14, angle);
              const textPos = polarToCartesian(CX, CY, RADIUS - STROKE_WIDTH / 2 - 28, angle);
              return (
                <g key={`major-${value}`}>
                  <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#A78BFA" strokeWidth={2} />
                  <text x={textPos.x} y={textPos.y} fill="#C4B5FD" fontSize="10" fontWeight="700" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Category Segment Labels */}
            {SEGMENT_LABELS.map(({ text, angle, color }) => {
              const pos = polarToCartesian(CX, CY, RADIUS + STROKE_WIDTH / 2 + 15, angle);
              const isSelected = text === category;
              return (
                <text
                  key={`label-${text}`}
                  x={pos.x}
                  y={pos.y}
                  fill={isSelected ? color : '#6B7280'}
                  fontSize={isSelected ? '10' : '9'}
                  fontWeight={isSelected ? '900' : '600'}
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {text.toUpperCase()}
                </text>
              );
            })}

            {/* Ultra-Thin Precision Razor Needle */}
            <g transform={`translate(${CX}, ${CY})`}>
              <motion.g
                initial={shouldReduceMotion ? { rotate: visualNeedleAngle } : { rotate: -90 }}
                animate={{ rotate: visualNeedleAngle }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 45, damping: 14 }}
              >
                <polygon points="0,-78 -1.25,0 1.25,0" fill="url(#needle-razor-grad)" />
                <circle cx={0} cy={-78} r={1.2} fill="#FFFFFF" />
              </motion.g>
              <circle cx={0} cy={0} r={12} fill="#5B21B6" fillOpacity={0.3} />
              <circle cx={0} cy={0} r={7} fill="url(#pivot-cap-grad)" stroke="#A78BFA" strokeWidth={1.5} />
              <circle cx={0} cy={0} r={2.5} fill="#FFFFFF" />
            </g>

            {/* Center Digital Score Counter */}
            <g transform={`translate(${CX}, ${CY + 36})`}>
              <text x={0} y={0} fill="#FFFFFF" fontSize="32" fontWeight="900" fontFamily="monospace" textAnchor="middle" dominantBaseline="central">
                {displayScore}
              </text>
              <text x={26} y={-8} fill="#9CA3AF" fontSize="12" fontWeight="700" textAnchor="start">
                /100
              </text>
            </g>
          </svg>
        </div>
      )}

      {/* VIEW MODE 2: VERTICAL 100 LED SEGMENT METER */}
      {viewMode === 'vertical' && (
        <div className="py-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>Score Level</span>
            <span className="text-white font-bold text-lg">{displayScore} / 100</span>
          </div>

          <div className="w-full h-8 bg-dark-950 rounded-xl p-1 border border-purple-900/40 relative overflow-hidden flex items-center gap-0.5">
            {Array.from({ length: 40 }).map((_, idx) => {
              const segValue = (idx + 1) * 2.5;
              const isActive = displayScore >= segValue;
              const segColor = segValue <= 25 ? '#EF4444' : segValue <= 50 ? '#F59E0B' : segValue <= 75 ? '#38BDF8' : '#8B5CF6';

              return (
                <div
                  key={idx}
                  className="h-full flex-1 rounded-sm transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? segColor : '#1F192F',
                    boxShadow: isActive ? `0 0 6px ${segColor}80` : 'none',
                    opacity: isActive ? 1 : 0.4
                  }}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px] font-bold">
            <span className={category === 'Worst' ? 'text-red-400' : 'text-gray-500'}>0-24 WORST</span>
            <span className={category === 'Average' ? 'text-amber-400' : 'text-gray-500'}>25-49 AVERAGE</span>
            <span className={category === 'Good' ? 'text-sky-400' : 'text-gray-500'}>50-74 GOOD</span>
            <span className={category === 'Best' ? 'text-purple-400' : 'text-gray-500'}>75-100 BEST</span>
          </div>
        </div>
      )}

      {/* Bottom Suitability Status Badge */}
      <div className="mt-4 pt-4 border-t border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 font-medium">Suitability:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${config.badgeClass}`}>
            {suitability}
          </span>
        </div>

        <div className="text-xs text-gray-400 text-center sm:text-right font-medium line-clamp-1">
          {config.explanation}
        </div>
      </div>
    </div>
  );
};

export const SpeedometerGauge = QualitySpeedometer;
