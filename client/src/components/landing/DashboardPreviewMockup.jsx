import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import {
  Compass,
  Search,
  Plus,
  Building,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DashboardPreviewMockup = () => {
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Smooth mouse-follow 3D perspective tilt
  const rotateX = useSpring(10, { stiffness: 260, damping: 25 });
  const rotateY = useSpring(0, { stiffness: 260, damping: 25 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = 10 + ((y - centerY) / centerY) * -6;
    const tiltY = ((x - centerX) / centerX) * 6;

    rotateX.set(tiltX);
    rotateY.set(tiltY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(10);
    rotateY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1400 }}
      className="w-full max-w-5xl mx-auto px-2 select-none"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl bg-white/95 border border-sand-200/90 p-4 sm:p-6 shadow-modal backdrop-blur-md overflow-hidden group transition-all duration-300"
      >
        {/* Subtle glass reflection highlight across the mockup */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-sage-50/20 pointer-events-none" />

        {/* Mockup Top Application Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-sand-200/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-800 text-ivory-50 flex items-center justify-center font-bold text-xs shadow-soft">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-forest-950 font-sans">JobPilot Pipeline</span>
              <span className="text-[10px] text-stone-400 block font-medium">Live Candidate Workspace</span>
            </div>
          </div>

          {/* Search bar & quick action pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ivory-50 border border-sand-200 text-xs text-stone-500 w-56">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span>Search applications...</span>
              <span className="ml-auto text-[10px] bg-white border border-sand-200 px-1.5 py-0.5 rounded text-stone-400">⌘K</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-forest text-xs font-semibold shadow-soft">
              <Plus className="w-3.5 h-3.5" />
              <span>Track Application</span>
            </div>

            <div className="w-8 h-8 rounded-lg bg-forest-100 border border-forest-200 text-forest-800 font-bold text-xs flex items-center justify-center">
              AH
            </div>
          </div>
        </div>

        {/* Mockup 3-Column Kanban Board Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Applied */}
          <div className="rounded-2xl bg-ivory-50/90 border border-sand-200/80 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-sand-200/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span className="text-xs font-bold text-forest-950 font-sans">Applied</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-800 border border-teal-200">
                2
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-white border border-sand-200 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <h6 className="text-xs font-bold text-stone-900 font-sans">Product Engineer</h6>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                    $155k
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 flex items-center gap-1 mb-2 font-medium">
                  <Building className="w-3 h-3 text-forest-600" /> Airbnb
                </p>
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Calendar className="w-3 h-3" /> Applied 2d ago
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-sand-200 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <h6 className="text-xs font-bold text-stone-900 font-sans">UI Platform Systems</h6>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                    $170k
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 flex items-center gap-1 mb-2 font-medium">
                  <Building className="w-3 h-3 text-forest-600" /> Netflix
                </p>
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Calendar className="w-3 h-3" /> Applied 4d ago
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Interview */}
          <div className="rounded-2xl bg-ivory-50/90 border border-sand-200/80 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-sand-200/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-subtle" />
                <span className="text-xs font-bold text-forest-950 font-sans">Interview</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-900 border border-amber-200">
                1 Active
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-300 shadow-sm relative">
              <div className="flex justify-between items-start mb-1">
                <h6 className="text-xs font-bold text-stone-900 font-sans">Software Engineer II</h6>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  $175k
                </span>
              </div>
              <p className="text-[11px] text-stone-500 flex items-center gap-1 mb-2 font-medium">
                <Building className="w-3 h-3 text-forest-600" /> Google Cloud
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 text-[10px] font-semibold border border-amber-200/80">
                <Clock className="w-3 h-3 text-amber-600" /> Technical Screen: Oct 17
              </div>
            </div>
          </div>

          {/* Column 3: Offer */}
          <div className="rounded-2xl bg-ivory-50/90 border border-sand-200/80 p-3 flex flex-col">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-sand-200/70">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="text-xs font-bold text-forest-950 font-sans">Offer</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Extended
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-emerald-300 shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full blur-xl pointer-events-none" />
              <div className="flex justify-between items-start mb-1">
                <h6 className="text-xs font-bold text-forest-950 font-sans">Senior Full Stack</h6>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Offer Received
                </span>
              </div>
              <p className="text-[11px] text-stone-500 flex items-center gap-1 mb-2 font-medium">
                <Building className="w-3 h-3 text-forest-600" /> Stripe
              </p>
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-sand-100">
                <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                  <DollarSign className="w-3.5 h-3.5" /> $165,000 / yr
                </span>
                <span className="text-stone-400 text-[10px] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" /> Signed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom subtle elevation badge */}
        <div className="mt-4 pt-3 border-t border-sand-100 flex items-center justify-between text-[11px] text-stone-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>Interactive Multi-stage Pipeline &bull; Filterable by Status & Company</span>
          </div>
          <span className="hidden sm:inline text-stone-400">Click & Drag to advance candidates</span>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPreviewMockup;
