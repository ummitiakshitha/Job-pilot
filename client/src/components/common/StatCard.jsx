import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  // Preserving any passed styling hints gracefully
  iconBg,
  iconColor,
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth springs for 3D tilt
  const rotateX = useSpring(0, { stiffness: 300, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 25 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate subtle tilt angle (-6 to 6 deg)
    const tiltX = ((y - centerY) / centerY) * -5;
    const tiltY = ((x - centerX) / centerX) * 5;

    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative p-6 rounded-2xl bg-white border border-sand-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden cursor-default group"
      >
        {/* Subtle warm depth gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sage-50/60 rounded-full blur-2xl pointer-events-none group-hover:bg-sage-100/70 transition-colors" />

        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 font-sans">
            {title}
          </span>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-forest-50 border border-forest-100/80 text-forest-700 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 relative z-10">
          <span className="text-3xl font-extrabold tracking-tight text-forest-950 font-sans">
            {value ?? 0}
          </span>
          {trend && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
              {trend}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="mt-2 text-xs text-stone-500 font-medium relative z-10">
            {subtitle}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default StatCard;
