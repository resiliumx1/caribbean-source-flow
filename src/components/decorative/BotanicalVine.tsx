import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

// ============================================================
// FULL LEAF — dewdrops, sparkles, wind sway, wobble, hover
// ============================================================
const Leaf = ({ x, y, angle, delay, scale = 1 }: { x: number; y: number; angle: number; delay: number; scale?: number }) => {
  const ref = useRef<SVGGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const rustleDuration = 3 + ((x + y) % 3);
  const sparkleDelay = delay + 1.5 + ((x + y) % 2);
  const sparkleDuration = 4 + ((x + y) % 3);
  const dewdropDelay = delay + 2.5 + ((x + y) % 2.5);
  const dewdropDuration = 5 + ((x + y) % 4);
  const dewdropScale = 0.5 + ((x + y) % 5) * 0.1;
  const dewdropOpacity = 0.6 + ((x + y) % 4) * 0.1;
  const windDuration = 6 + ((x + y) % 4);
  const windSway = 4 + ((x + y) % 4);
  const wobbleDuration = 2.5 + ((x + y) % 2);
  const wobbleX = 0.5 + ((x + y) % 0.5);
  const wobbleY = 0.5 + ((x + y) % 0.5);

  return (
    <motion.g
      ref={ref}
      transform={`translate(${x}, ${y}) rotate(${angle}) scale(${scale})`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
    >
      <motion.g
        animate={{ rotate: [-windSway, windSway, -windSway] }}
        transition={{ duration: windDuration, repeat: Infinity, ease: "easeInOut" }}
        style={{ originX: 0, originY: 0 }}
      >
        <motion.g
          initial={{ scale: 0.5, rotate: -10 }}
          whileInView={{ scale: 1, rotate: [0, 3, -2, 0] }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            scale: { duration: 0.8, delay, ease: "backOut" },
            rotate: { delay: delay + 0.8, duration: rustleDuration, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{ originX: 0, originY: 0 }}
        >
          <motion.path
            d="M 0 0 C 10 -15, 25 -10, 30 0 C 25 10, 10 15, 0 0 Z"
            stroke="currentColor" strokeWidth="1.5" fill="currentColor"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            whileInView={{ pathLength: 1, fillOpacity: 0.2 }}
            animate={{ x: [-wobbleX, wobbleX, -wobbleX], y: [-wobbleY, wobbleY, -wobbleY] }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              pathLength: { duration: 0.9, delay, ease: "easeInOut" },
              fillOpacity: { duration: 0.6, delay: delay + 0.4, ease: "easeIn" },
              x: { duration: wobbleDuration, repeat: Infinity, ease: "easeInOut" },
              y: { duration: wobbleDuration * 1.1, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.path
            d="M 0 0 Q 15 0, 28 0"
            stroke="currentColor" strokeWidth="1" fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            animate={{ x: [-wobbleX, wobbleX, -wobbleX], y: [-wobbleY, wobbleY, -wobbleY] }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
              pathLength: { duration: 0.7, delay: delay + 0.3, ease: "easeOut" },
              opacity: { duration: 0.3, delay: delay + 0.3 },
              x: { duration: wobbleDuration, repeat: Infinity, ease: "easeInOut" },
              y: { duration: wobbleDuration * 1.1, repeat: Infinity, ease: "easeInOut" },
            }}
          />
          <motion.path
            d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z"
            fill="#c9a84c"
            initial={{ opacity: 0, scale: 0, x: 24, y: -6 }}
            whileInView={{
              opacity: [0, 0, 0.8, 0, 0],
              scale: [0, 0, 1, 0, 0],
              rotate: [0, 0, 90, 180, 180],
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: sparkleDuration, repeat: Infinity, delay: sparkleDelay, times: [0, 0.8, 0.85, 0.9, 1], ease: "easeInOut" }}
          />
          <motion.path
            d="M 0 0 C 1.5 0, 2 -1, 2 -2 C 2 -3, 0 -5, 0 -5 C 0 -5, -2 -3, -2 -2 C -2 -1, -1.5 0, 0 0 Z"
            fill="#a8c8a8"
            initial={{ opacity: 0, scale: 0, x: 12, y: 4 }}
            whileInView={{
              opacity: [0, 0, dewdropOpacity * 0.8, dewdropOpacity, 0, 0],
              scale: [0, 0, dewdropScale * 0.8, dewdropScale, 0, 0],
              x: [12, 12, 12, 13, 13, 13],
              y: [4, 4, 4, 6, 6, 6],
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: dewdropDuration, repeat: Infinity, delay: dewdropDelay, times: [0, 0.6, 0.7, 0.85, 0.9, 1], ease: "easeInOut" }}
          />
        </motion.g>
      </motion.g>
    </motion.g>
  );
};

const Sparkle = ({ x, y, delay, scale = 1 }: { x: number; y: number; delay: number; scale?: number }) => (
  <motion.path
    d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z"
    fill="#c9a84c"
    initial={{ opacity: 0, scale: 0, x, y }}
    whileInView={{ opacity: [0, 0, 0.8, 0, 0], scale: [0, 0, scale, 0, 0], rotate: [0, 0, 90, 180, 180] }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 4 + ((x + y) % 3), repeat: Infinity, delay, times: [0, 0.8, 0.85, 0.9, 1], ease: "easeInOut" }}
    style={{ originX: '50%', originY: '50%' }}
  />
);

// Variation A — gentle S-curve, sparse leaves
export function VineVariationA({ className = "" }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'absolute', left: 0, right: 0, bottom: -30, height: 70, zIndex: 5, pointerEvents: 'none', overflow: 'visible' }}>
      <svg width="100%" height="70" viewBox="0 0 1000 70" preserveAspectRatio="xMidYMid slice" fill="none" style={{ color: '#3a6a3a', opacity: 0.5 }}>
        <motion.g animate={{ rotate: [-0.4, 0.4, -0.4] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "500px", originY: "35px" }}>
          <motion.path d="M 0 35 C 250 5, 500 65, 750 25 C 850 15, 950 40, 1000 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 2.5, ease: "easeInOut" }} />
          <Leaf x={150} y={18} angle={-35} delay={0.3} scale={0.65} />
          <Leaf x={380} y={52} angle={140} delay={0.7} scale={0.55} />
          <Leaf x={600} y={30} angle={-80} delay={1.1} scale={0.7} />
          <Leaf x={850} y={22} angle={-130} delay={1.5} scale={0.6} />
          <Sparkle x={280} y={10} delay={2.0} scale={0.7} />
          <Sparkle x={720} y={50} delay={2.5} scale={0.9} />
        </motion.g>
      </svg>
    </div>
  );
}

// Variation B — undulating wave, denser foliage
export function VineVariationB({ className = "" }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'absolute', left: 0, right: 0, bottom: -35, height: 80, zIndex: 5, pointerEvents: 'none', overflow: 'visible' }}>
      <svg width="100%" height="80" viewBox="0 0 1000 80" preserveAspectRatio="xMidYMid slice" fill="none" style={{ color: '#2d5a2d', opacity: 0.45 }}>
        <motion.g animate={{ rotate: [-0.6, 0.6, -0.6] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "500px", originY: "40px" }}>
          <motion.path d="M 0 50 C 120 15, 280 70, 400 35 C 520 0, 680 75, 800 40 C 880 20, 960 50, 1000 45" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 2.8, ease: "easeInOut" }} />
          <Leaf x={80} y={40} angle={-50} delay={0.2} scale={0.6} />
          <Leaf x={200} y={25} angle={130} delay={0.5} scale={0.55} />
          <Leaf x={350} y={55} angle={-25} delay={0.8} scale={0.7} />
          <Leaf x={470} y={15} angle={-140} delay={1.0} scale={0.6} />
          <Leaf x={620} y={60} angle={35} delay={1.3} scale={0.65} />
          <Leaf x={750} y={30} angle={-120} delay={1.6} scale={0.55} />
          <Leaf x={900} y={45} angle={-45} delay={1.9} scale={0.6} />
          <Sparkle x={300} y={15} delay={1.8} scale={0.8} />
          <Sparkle x={550} y={65} delay={2.2} scale={1.0} />
          <Sparkle x={820} y={18} delay={2.6} scale={0.7} />
        </motion.g>
      </svg>
    </div>
  );
}

// Variation C — asymmetric sweep from left
export function VineVariationC({ className = "" }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'absolute', left: 0, right: 0, bottom: -25, height: 65, zIndex: 5, pointerEvents: 'none', overflow: 'visible' }}>
      <svg width="100%" height="65" viewBox="0 0 1000 65" preserveAspectRatio="xMidYMid slice" fill="none" style={{ color: '#4a7a4a', opacity: 0.4 }}>
        <motion.g animate={{ rotate: [-0.3, 0.3, -0.3] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "200px", originY: "32px" }}>
          <motion.path d="M -20 45 C 100 10, 300 55, 500 30 C 700 5, 850 45, 1020 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 3, ease: "easeInOut" }} />
          <Leaf x={60} y={35} angle={-60} delay={0.4} scale={0.7} />
          <Leaf x={250} y={40} angle={150} delay={0.7} scale={0.6} />
          <Leaf x={450} y={28} angle={-100} delay={1.0} scale={0.65} />
          <Leaf x={700} y={12} angle={-35} delay={1.4} scale={0.55} />
          <Leaf x={920} y={28} angle={135} delay={1.7} scale={0.6} />
          <Sparkle x={180} y={20} delay={2.0} scale={0.8} />
          <Sparkle x={600} y={8} delay={2.8} scale={0.9} />
        </motion.g>
      </svg>
    </div>
  );
}

// Variation D — branching fork, symmetrical
export function VineVariationD({ className = "" }: { className?: string }) {
  return (
    <div className={className} style={{ position: 'absolute', left: 0, right: 0, bottom: -30, height: 75, zIndex: 5, pointerEvents: 'none', overflow: 'visible' }}>
      <svg width="100%" height="75" viewBox="0 0 1000 75" preserveAspectRatio="xMidYMid slice" fill="none" style={{ color: '#3a6a3a', opacity: 0.5 }}>
        <motion.g animate={{ rotate: [-0.5, 0.5, -0.5] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "500px", originY: "60px" }}>
          <motion.path d="M 500 60 C 350 50, 200 20, 30 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeOut" }} />
          <motion.path d="M 500 60 C 650 50, 800 20, 970 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.8, ease: "easeOut" }} />
          <Leaf x={500} y={60} angle={-90} delay={0.3} scale={0.75} />
          <Leaf x={380} y={48} angle={-30} delay={0.5} scale={0.6} />
          <Leaf x={620} y={48} angle={-150} delay={0.5} scale={0.6} />
          <Leaf x={250} y={28} angle={-140} delay={0.9} scale={0.65} />
          <Leaf x={750} y={28} angle={-40} delay={0.9} scale={0.65} />
          <Leaf x={120} y={32} angle={-50} delay={1.2} scale={0.55} />
          <Leaf x={880} y={32} angle={-130} delay={1.2} scale={0.55} />
          <Sparkle x={300} y={20} delay={1.8} scale={0.8} />
          <Sparkle x={700} y={20} delay={2.0} scale={0.8} />
          <Sparkle x={500} y={30} delay={2.5} scale={1.2} />
        </motion.g>
      </svg>
    </div>
  );
}

// Footer vine — full animated leaves with dewdrops + sparkles
export function FooterVine() {
  return (
    <div style={{ width: '100%', overflow: 'hidden', height: 80, marginBottom: -30, pointerEvents: 'none' }}>
      <svg width="100%" height="80" viewBox="0 0 1000 80" preserveAspectRatio="xMidYMid slice" fill="none" style={{ color: '#3a6a3a', opacity: 0.55 }}>
        <motion.g animate={{ rotate: [-0.8, 0.8, -0.8] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "500px", originY: "40px" }}>
          <motion.path d="M 0 40 C 150 10, 350 70, 500 40 C 650 10, 850 70, 1000 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
            initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 2.5, ease: "easeInOut" }} />
          <Leaf x={70} y={28} angle={-45} delay={0.2} scale={0.7} />
          <Leaf x={150} y={18} angle={-130} delay={0.4} scale={0.65} />
          <Leaf x={250} y={30} angle={35} delay={0.6} scale={0.6} />
          <Leaf x={370} y={55} angle={-20} delay={0.8} scale={0.7} />
          <Leaf x={500} y={40} angle={-90} delay={1.0} scale={0.8} />
          <Leaf x={630} y={20} angle={-140} delay={1.2} scale={0.65} />
          <Leaf x={750} y={55} angle={40} delay={1.4} scale={0.7} />
          <Leaf x={850} y={28} angle={-50} delay={1.6} scale={0.6} />
          <Leaf x={940} y={38} angle={130} delay={1.8} scale={0.65} />
          <Sparkle x={120} y={10} delay={1.5} scale={0.9} />
          <Sparkle x={320} y={60} delay={2.0} scale={0.8} />
          <Sparkle x={560} y={12} delay={2.3} scale={1.0} />
          <Sparkle x={800} y={58} delay={2.7} scale={0.8} />
          <Sparkle x={950} y={22} delay={3.0} scale={0.7} />
        </motion.g>
      </svg>
    </div>
  );
}
