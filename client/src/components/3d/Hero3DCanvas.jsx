import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

// Elegant Sculptural Core in Forest & Sage
const SculpturalCore = () => {
  const meshRef = useRef();
  const wireframeRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.15;
      meshRef.current.rotation.y += delta * 0.2;
    }
    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.1;
      wireframeRef.current.rotation.y -= delta * 0.15;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.8}>
      {/* Outer subtle sage wireframe */}
      <mesh ref={wireframeRef}>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshStandardMaterial
          color="#94A999"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner faceted forest stone */}
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[1.45, 0]} />
        <meshPhysicalMaterial
          color="#244D39"
          roughness={0.25}
          metalness={0.4}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          reflectivity={0.9}
        />
      </mesh>
    </Float>
  );
};

// Static Fallback Component if WebGL is disabled or fails
export const FallbackGraphic = () => (
  <div className="w-full h-full flex items-center justify-center relative select-none">
    <div className="p-8 rounded-2xl bg-white border border-sand-200 shadow-card flex flex-col items-center text-center max-w-xs">
      <div className="w-20 h-20 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center shadow-soft mb-4">
        <svg
          className="w-10 h-10 text-forest-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>
      <p className="text-sm font-bold text-forest-900 font-sans">JobPilot System</p>
      <p className="text-xs text-stone-500 mt-1">Structured Career Flightpath</p>
    </div>
  </div>
);

// Main 3D Hero Component with WebGL detection & ErrorBoundary
export const Hero3DCanvas = () => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL || hasError) {
    return <FallbackGraphic />;
  }

  return (
    <div className="w-full h-[360px] md:h-[460px] relative pointer-events-auto flex items-center justify-center">
      <Suspense fallback={<FallbackGraphic />}>
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', background: 'transparent' }}
          gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
        >
          <ambientLight intensity={1.1} />
          <directionalLight position={[8, 10, 6]} intensity={1.6} color="#FFFFFF" />
          <pointLight position={[-8, -6, -4]} color="#B6C7BA" intensity={0.9} />
          <SculpturalCore />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Hero3DCanvas;
