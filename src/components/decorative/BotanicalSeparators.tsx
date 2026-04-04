import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const Leaf = ({ x, y, angle, delay, scale = 1 }: { x: number, y: number, angle: number, delay: number, scale?: number }) => {
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
            rotate: { delay: delay + 0.8, duration: rustleDuration, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ originX: 0, originY: 0 }}
        >
          <motion.path
            d="M 0 0 C 10 -15, 25 -10, 30 0 C 25 10, 10 15, 0 0 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="currentColor"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            whileInView={{ pathLength: 1, fillOpacity: 0.2 }}
            animate={{
              x: [-wobbleX, wobbleX, -wobbleX],
              y: [-wobbleY, wobbleY, -wobbleY]
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              pathLength: { duration: 0.9, delay, ease: "easeInOut" },
              fillOpacity: { duration: 0.6, delay: delay + 0.4, ease: "easeIn" },
              x: { duration: wobbleDuration, repeat: Infinity, ease: "easeInOut" },
              y: { duration: wobbleDuration * 1.1, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.path
            d="M 0 0 Q 15 0, 28 0"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            animate={{
              x: [-wobbleX, wobbleX, -wobbleX],
              y: [-wobbleY, wobbleY, -wobbleY]
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              pathLength: { duration: 0.7, delay: delay + 0.3, ease: "easeOut" },
              opacity: { duration: 0.3, delay: delay + 0.3 },
              x: { duration: wobbleDuration, repeat: Infinity, ease: "easeInOut" },
              y: { duration: wobbleDuration * 1.1, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.path
            d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z"
            fill="currentColor"
            initial={{ opacity: 0, scale: 0, x: 24, y: -6 }}
            whileInView={{ 
              opacity: [0, 0, 0.8, 0, 0],
              scale: [0, 0, 1, 0, 0],
              rotate: [0, 0, 90, 180, 180]
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              duration: sparkleDuration,
              repeat: Infinity,
              delay: sparkleDelay,
              times: [0, 0.8, 0.85, 0.9, 1],
              ease: "easeInOut"
            }}
            style={{ color: '#c9a84c' }}
          />
          <motion.path
            d="M 0 0 C 1.5 0, 2 -1, 2 -2 C 2 -3, 0 -5, 0 -5 C 0 -5, -2 -3, -2 -2 C -2 -1, -1.5 0, 0 0 Z"
            fill="currentColor"
            initial={{ opacity: 0, scale: 0, x: 12, y: 4 }}
            whileInView={{ 
              opacity: [0, 0, dewdropOpacity * 0.8, dewdropOpacity, 0, 0],
              scale: [0, 0, dewdropScale * 0.8, dewdropScale, 0, 0],
              x: [12, 12, 12, 13, 13, 13],
              y: [4, 4, 4, 6, 6, 6]
            }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              duration: dewdropDuration,
              repeat: Infinity,
              delay: dewdropDelay,
              times: [0, 0.6, 0.7, 0.85, 0.9, 1],
              ease: "easeInOut"
            }}
            style={{ color: '#a8c8a8' }}
          />
        </motion.g>
      </motion.g>
    </motion.g>
  );
};

const Sparkle = ({ x, y, delay, scale = 1 }: { x: number, y: number, delay: number, scale?: number }) => {
  const sparkleDuration = 4 + ((x + y) % 3);
  return (
    <motion.path
      d="M 0 -3 Q 0 0 3 0 Q 0 0 0 3 Q 0 0 -3 0 Q 0 0 0 -3 Z"
      fill="currentColor"
      initial={{ opacity: 0, scale: 0, x, y }}
      whileInView={{ 
        opacity: [0, 0, 0.8, 0, 0],
        scale: [0, 0, scale, 0, 0],
        rotate: [0, 0, 90, 180, 180]
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: sparkleDuration,
        repeat: Infinity,
        delay,
        times: [0, 0.8, 0.85, 0.9, 1],
        ease: "easeInOut"
      }}
      style={{ originX: '50%', originY: '50%', color: '#c9a84c' }}
    />
  );
};

export const SymmetricalBranch = () => {
  return (
    <div className="w-full flex justify-center py-12 overflow-hidden">
      <svg width="500" height="80" viewBox="0 0 500 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#3a6a3a' }}>
        <motion.g
          animate={{ rotate: [-1.5, 1.5, -1.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "250px", originY: "60px" }}
        >
          <motion.path d="M 250 60 Q 150 60, 50 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 1.5, ease: "easeOut" }} />
          <motion.path d="M 250 60 Q 350 60, 450 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 1.5, ease: "easeOut" }} />
          {[
            { x: 250, y: 60, angle: -90, scale: 1 },
            { x: 220, y: 60, angle: -20, scale: 0.7 },
            { x: 280, y: 60, angle: -160, scale: 0.7 },
            { x: 200, y: 52, angle: -160, scale: 0.8 },
            { x: 300, y: 52, angle: -20, scale: 0.8 },
            { x: 170, y: 50, angle: -40, scale: 0.8 },
            { x: 330, y: 50, angle: -140, scale: 0.8 },
            { x: 150, y: 42, angle: -140, scale: 0.9 },
            { x: 350, y: 42, angle: -40, scale: 0.9 },
            { x: 120, y: 38, angle: -30, scale: 0.9 },
            { x: 380, y: 38, angle: -150, scale: 0.9 },
            { x: 100, y: 30, angle: -150, scale: 0.8 },
            { x: 400, y: 30, angle: -30, scale: 0.8 },
            { x: 70, y: 26, angle: -50, scale: 0.7 },
            { x: 430, y: 26, angle: -130, scale: 0.7 },
            { x: 60, y: 20, angle: -130, scale: 0.7 },
            { x: 440, y: 20, angle: -50, scale: 0.7 },
          ].map((leaf, index) => (
            <Leaf key={index} x={leaf.x} y={leaf.y} angle={leaf.angle} delay={0.2 + index * 0.08} scale={leaf.scale} />
          ))}
          <Sparkle x={180} y={30} delay={1.5} scale={1.2} />
          <Sparkle x={80} y={40} delay={2.1} scale={0.8} />
          <Sparkle x={320} y={30} delay={1.8} scale={1.2} />
          <Sparkle x={420} y={40} delay={2.4} scale={0.8} />
          <Sparkle x={250} y={20} delay={2.7} scale={1.5} />
        </motion.g>
      </svg>
    </div>
  );
};

export const WindingVine = () => {
  return (
    <div className="w-full flex justify-center py-16 overflow-hidden">
      <motion.svg width="100%" height="100" viewBox="0 0 1000 100" preserveAspectRatio="xMidYMid slice" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#5a8a5a', maxWidth: '80rem' }}
        initial={{ scaleX: 0.96 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 4, ease: "easeOut" }}>
        <motion.path d="M 0 50 C 150 -20, 350 120, 500 50 C 650 -20, 850 120, 1000 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"
          initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ pathLength: { duration: 3.2, ease: "easeInOut" }, opacity: { duration: 0.6, ease: "easeOut" } }} />
        <Leaf x={80} y={25} angle={-45} delay={0.4} scale={0.8} />
        <Leaf x={180} y={15} angle={-20} delay={0.8} scale={0.7} />
        <Leaf x={300} y={75} angle={20} delay={1.2} scale={0.8} />
        <Leaf x={420} y={80} angle={-20} delay={1.6} scale={0.8} />
        <Leaf x={550} y={20} angle={-45} delay={2.0} scale={0.8} />
        <Leaf x={680} y={20} angle={-20} delay={2.4} scale={0.7} />
        <Leaf x={800} y={75} angle={20} delay={2.8} scale={0.8} />
        <Leaf x={920} y={80} angle={-20} delay={3.2} scale={0.8} />
        <Sparkle x={150} y={40} delay={1.5} scale={1.2} />
        <Sparkle x={400} y={50} delay={1.8} scale={1.2} />
        <Sparkle x={720} y={80} delay={2.7} scale={1.5} />
      </motion.svg>
    </div>
  );
};
