import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CircularQualityMeterProps {
  score: number;
  category: 'Worst' | 'Average' | 'Good' | 'Best';
  size?: number;
}

export const CircularQualityMeter: React.FC<CircularQualityMeterProps> = ({
  score,
  category,
  size = 200,
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, score));
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = (t: number) => t * (2 - t);
      const current = Math.floor(start + (end - start) * easeOutQuad(progress));
      
      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const getColor = () => {
    switch (category) {
      case 'Worst': return '#EF4444';
      case 'Average': return '#F59E0B';
      case 'Good': return '#10B981';
      case 'Best': return '#8B5CF6';
      default: return '#8B5CF6';
    }
  };

  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const mainColor = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#171126"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={mainColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${mainColor}80)`
            }}
          />
        </svg>

        {/* Center score & category */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            className="text-4xl font-extrabold text-white tracking-tight"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {displayScore}
            <span className="text-lg font-medium text-gray-400">/100</span>
          </motion.span>
          <span
            className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1"
            style={{ backgroundColor: `${mainColor}20`, color: mainColor }}
          >
            {category}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 font-medium">Overall AI Quality Score</p>
    </div>
  );
};
