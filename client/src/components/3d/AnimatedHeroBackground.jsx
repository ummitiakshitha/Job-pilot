import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

// Individual Rich 3D Floating Geometric Object
const FloatingShape = ({
  geometry,
  materialProps,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  speed = 1.8,
  floatIntensity = 1.4,
  rotationIntensity = 0.8,
  mouse,
}) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    // Continuous smooth rotation
    meshRef.current.rotation.x += delta * 0.2 * speed;
    meshRef.current.rotation.y += delta * 0.25 * speed;

    // Responsive parallax response to mouse
    if (mouse?.current) {
      meshRef.current.position.x +=
        (position[0] + mouse.current.x * 0.5 - meshRef.current.position.x) * 0.06;
      meshRef.current.position.y +=
        (position[1] + mouse.current.y * 0.4 - meshRef.current.position.y) * 0.06;
    }
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={rotationIntensity}
      floatIntensity={floatIntensity}
      position={position}
    >
      <mesh ref={meshRef} rotation={rotation} scale={scale} castShadow receiveShadow>
        {geometry}
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
    </Float>
  );
};

// 3D Scene containing prominent, visibly striking geometric shapes
// 3D Scene containing prominent, visibly striking, centered geometric shapes
const FloatingScene = ({ mouse }) => {
  return (
    <>
      {/* Rich Front & Studio Lighting so shapes are bright, lustrous, and never in shadow */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 8, 6]} intensity={2.5} color="#FFFFFF" />
      <directionalLight position={[-6, -4, 5]} intensity={1.5} color="#E8F5E9" />
      {/* Front fill light directly on the camera axis */}
      <pointLight position={[0, 1, 7]} intensity={2.8} color="#FFFFFF" distance={20} />
      {/* Accent warm and emerald rim lights */}
      <pointLight position={[3, 4, 3]} color="#A7F3D0" intensity={2.0} distance={12} />
      <pointLight position={[-3, -3, 3]} color="#FEF3C7" intensity={1.8} distance={12} />

      {/* 1. Lustrous Forest Green Torus Ring (Upper Right of Hero) */}
      <FloatingShape
        geometry={<torusGeometry args={[1.05, 0.38, 32, 64]} />}
        materialProps={{
          color: '#24523B',
          roughness: 0.18,
          metalness: 0.3,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          reflectivity: 0.95,
        }}
        position={[2.0, 0.9, 0.2]}
        rotation={[0.8, 0.6, 0.3]}
        scale={1.05}
        speed={1.6}
        floatIntensity={1.5}
        rotationIntensity={1.2}
        mouse={mouse}
      />

      {/* 2. Faceted Ivory & Gold Dodecahedron (Upper Left of Hero) */}
      <FloatingShape
        geometry={<dodecahedronGeometry args={[0.95, 0]} />}
        materialProps={{
          color: '#FAF6ED',
          roughness: 0.15,
          metalness: 0.25,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
        }}
        position={[-1.9, 0.85, 0.3]}
        rotation={[0.4, 0.8, 0.2]}
        scale={1.0}
        speed={1.4}
        floatIntensity={1.4}
        rotationIntensity={1.1}
        mouse={mouse}
      />

      {/* 3. Glossy Translucent Emerald Octahedron (Lower Right of Hero) */}
      <FloatingShape
        geometry={<octahedronGeometry args={[0.9, 0]} />}
        materialProps={{
          color: '#2D6A4F',
          roughness: 0.15,
          metalness: 0.35,
          clearcoat: 1.0,
          transmission: 0.2,
          opacity: 0.95,
          transparent: true,
        }}
        position={[1.8, -1.2, 0.4]}
        rotation={[1.1, 0.4, 0.8]}
        scale={0.95}
        speed={1.8}
        floatIntensity={1.6}
        rotationIntensity={1.3}
        mouse={mouse}
      />

      {/* 4. Smooth Satin Sage Sphere (Lower Left of Hero) */}
      <FloatingShape
        geometry={<sphereGeometry args={[0.95, 48, 48]} />}
        materialProps={{
          color: '#5C7A68',
          roughness: 0.22,
          metalness: 0.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.12,
        }}
        position={[-1.8, -1.1, 0.3]}
        scale={1.0}
        speed={1.5}
        floatIntensity={1.5}
        mouse={mouse}
      />

      {/* 5. Glistening Amber/Gold Icosahedron (Top Center-Right) */}
      <FloatingShape
        geometry={<icosahedronGeometry args={[0.7, 0]} />}
        materialProps={{
          color: '#D4AF37',
          roughness: 0.2,
          metalness: 0.5,
          clearcoat: 1.0,
        }}
        position={[0.8, 2.1, -0.4]}
        rotation={[0.3, 0.5, 0.7]}
        scale={0.85}
        speed={2.0}
        floatIntensity={1.8}
        mouse={mouse}
      />

      {/* 6. Deep Forest Mini-Torus (Top Center-Left) */}
      <FloatingShape
        geometry={<torusGeometry args={[0.6, 0.2, 24, 48]} />}
        materialProps={{
          color: '#1C3A2B',
          roughness: 0.2,
          metalness: 0.3,
          clearcoat: 0.9,
        }}
        position={[-0.9, 2.0, -0.3]}
        rotation={[0.7, 0.3, 0.9]}
        scale={0.8}
        speed={1.7}
        floatIntensity={1.3}
        mouse={mouse}
      />

      {/* 7. Floating 3D Status Sphere: Applied (Sage Green) */}
      <FloatingShape
        geometry={<sphereGeometry args={[0.35, 32, 32]} />}
        materialProps={{
          color: '#34D399',
          roughness: 0.1,
          metalness: 0.4,
          clearcoat: 1.0,
        }}
        position={[-1.1, 1.4, 0.6]}
        speed={2.2}
        floatIntensity={2.0}
        mouse={mouse}
      />

      {/* 8. Floating 3D Status Sphere: Interview (Amber Gold) */}
      <FloatingShape
        geometry={<sphereGeometry args={[0.32, 32, 32]} />}
        materialProps={{
          color: '#F59E0B',
          roughness: 0.1,
          metalness: 0.4,
          clearcoat: 1.0,
        }}
        position={[1.2, 1.5, 0.5]}
        speed={2.4}
        floatIntensity={2.2}
        mouse={mouse}
      />

      {/* 9. Floating 3D Status Sphere: Offer (Emerald) */}
      <FloatingShape
        geometry={<sphereGeometry args={[0.36, 32, 32]} />}
        materialProps={{
          color: '#10B981',
          roughness: 0.1,
          metalness: 0.4,
          clearcoat: 1.0,
        }}
        position={[1.1, -1.8, 0.6]}
        speed={2.1}
        floatIntensity={1.9}
        mouse={mouse}
      />
    </>
  );
};

export const AnimatedHeroBackground = () => {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    // Parallax pointer listener on window
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', listener);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 min-h-screen">
      {/* 1. Visibly Moving Organic Ambient Gradients (Always active in CSS) */}
      <div className="absolute -top-24 left-1/5 w-[650px] h-[650px] bg-gradient-to-br from-sage-200/60 via-forest-100/50 to-transparent rounded-full blur-[110px] animate-pulse-subtle" />
      <div className="absolute top-1/4 -right-16 w-[620px] h-[620px] bg-gradient-to-bl from-sand-200/70 via-sage-100/50 to-transparent rounded-full blur-[130px] animate-float-gentle" />
      <div className="absolute top-1/2 left-4 w-[500px] h-[500px] bg-gradient-to-tr from-forest-100/60 via-sage-50/60 to-transparent rounded-full blur-[120px]" />

      {/* 2. React Three Fiber Visible 3D Floating Geometry Scene */}
      {hasWebGL && !prefersReducedMotion ? (
        <div className="absolute inset-0 w-full h-[850px] pointer-events-none z-0">
          <Suspense fallback={null}>
            <Canvas
              camera={{ position: [0, 0, 6.8], fov: 46 }}
              style={{ width: '100%', height: '100%', background: 'transparent' }}
              gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
            >
              <FloatingScene mouse={mouse} />
            </Canvas>
          </Suspense>
        </div>
      ) : (
        /* CSS Animated Fallback for non-WebGL / reduced-motion environments */
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 right-16 w-32 h-32 rounded-full border-4 border-forest-600/30 animate-float-gentle" />
          <div className="absolute top-44 left-12 w-28 h-28 rounded-full bg-sage-300/30 animate-pulse-subtle" />
          <div className="absolute top-80 right-28 w-24 h-24 rounded-2xl border-2 border-forest-700/20 rotate-12" />
        </div>
      )}

      {/* 3. Subtle Depth Fade to Content */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-ivory-100 to-transparent pointer-events-none" />
    </div>
  );
};

export default AnimatedHeroBackground;
