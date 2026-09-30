'use client';

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Float,
  PerspectiveCamera,
  Html,
  ScrollControls,
  useScroll,
  Points,
  PointMaterial,
  Line,
  Text,
} from '@react-three/drei';
import * as THREE from 'three';
import {
  Layers,
  GitBranch,
  Palette,
  Share2,
  BarChart3,
  Webhook,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// --------------------------------------------------------
// Ambient Particles
// --------------------------------------------------------
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 2000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.03;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#a5b4fc" size={0.05} sizeAttenuation={true} depthWrite={false} opacity={0.4} />
    </Points>
  );
}

// --------------------------------------------------------
// Section: Hero (Z = 0)
// --------------------------------------------------------
function HeroSection() {
  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Html transform wrapperClass="hero-html" distanceFactor={15} position={[0, 1, 0]}>
          <div style={{ textAlign: 'center', width: '800px', padding: '40px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 999, background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
              ✨ Free for students & clubs
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#F3F4F6', marginBottom: 20, lineHeight: 1.1 }}>
              Build Smarter Forms.<br/>
              <span style={{ background: 'linear-gradient(135deg, #818CF8, #C084FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Automate Every Response.
              </span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#9CA3AF', marginBottom: '40px' }}>
              Create powerful forms, surveys and conditional workflows visually — without writing code.
            </p>
            <Link href="/builder" style={{ padding: '16px 32px', background: 'linear-gradient(135deg, #4F7C7A, #3F6258)', color: 'white', textDecoration: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start Building <ArrowRight size={20} />
            </Link>
          </div>
        </Html>
      </Float>

      {/* Orbiting form fields */}
      {[
        { label: 'Short Text', pos: [-5, 3, 2] as [number, number, number] },
        { label: 'Multiple Choice', pos: [5, 2, 1] as [number, number, number] },
        { label: 'Rating', pos: [-4, -1, 3] as [number, number, number] },
        { label: 'File Upload', pos: [4, -2, 2] as [number, number, number] },
      ].map((field, i) => (
        <Float key={i} speed={1.5 + Math.random()} rotationIntensity={0.5} floatIntensity={1}>
          <Html transform distanceFactor={12} position={field.pos}>
            <div style={{ padding: '12px 24px', background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(129, 140, 248, 0.4)', borderRadius: '12px', color: '#E0E7FF', fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
              {field.label}
            </div>
          </Html>
        </Float>
      ))}
    </group>
  );
}

// --------------------------------------------------------
// Section: Features (Z = -20)
// --------------------------------------------------------
function FeaturesSection() {
  const features = [
    { icon: Layers, title: 'Visual Builder', desc: 'Drag-and-drop fields.', pos: [-4, 2, -18] as [number, number, number] },
    { icon: Palette, title: 'Custom Themes', desc: 'Make every form yours.', pos: [4, 3, -22] as [number, number, number] },
    { icon: Share2, title: 'Share Links', desc: 'Publish instantly.', pos: [-3, -2, -26] as [number, number, number] },
    { icon: BarChart3, title: 'Analytics', desc: 'Track in real-time.', pos: [3, -1, -30] as [number, number, number] },
  ];

  return (
    <group>
      {features.map((f, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
          <Html transform distanceFactor={15} position={f.pos}>
            <div style={{ width: '280px', padding: '24px', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '1rem', margin: 0 }}>{f.desc}</p>
            </div>
          </Html>
        </Float>
      ))}
    </group>
  );
}

// --------------------------------------------------------
// Section: Conditional Logic (Z = -45)
// --------------------------------------------------------
function LogicSection() {
  return (
    <group position={[0, 0, -45]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Html transform distanceFactor={15} position={[0, 3, 0]}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', textAlign: 'center', textShadow: '0 0 20px rgba(99,102,241,0.5)', whiteSpace: 'nowrap' }}>Conditional Logic Workflow</h2>
        </Html>
      </Float>

      {/* 3D Nodes and glowing lines */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 0.2]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#3730a3" emissiveIntensity={0.5} />
      </mesh>
      <Html transform distanceFactor={10} position={[0, 0, 0.2]}>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', textShadow: '0 0 10px #818cf8', whiteSpace: 'nowrap' }}>IF Student</div>
      </Html>

      <Line points={[[0, -0.5, 0], [-3, -3, 0]]} color="#60a5fa" lineWidth={3} dashed />
      <Line points={[[0, -0.5, 0], [3, -3, 0]]} color="#f472b6" lineWidth={3} dashed />

      <mesh position={[-3, -3, 0]}>
        <boxGeometry args={[2, 1, 0.2]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#1d4ed8" emissiveIntensity={0.5} />
      </mesh>
      <Html transform distanceFactor={10} position={[-3, -3, 0.2]}>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap' }}>College Name</div>
      </Html>

      <mesh position={[3, -3, 0]}>
        <boxGeometry args={[2, 1, 0.2]} />
        <meshStandardMaterial color="#1e1b4b" emissive="#be185d" emissiveIntensity={0.5} />
      </mesh>
      <Html transform distanceFactor={10} position={[3, -3, 0.2]}>
        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap' }}>Work Role</div>
      </Html>
    </group>
  );
}

// --------------------------------------------------------
// Section: Analytics (Z = -75)
// --------------------------------------------------------
function AnalyticsSection() {
  return (
    <group position={[0, 0, -75]}>
      <Html transform distanceFactor={15} position={[0, 4, -2]}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', textAlign: 'center', whiteSpace: 'nowrap' }}>Real-time Analytics</h2>
      </Html>

      {/* 3D Bar Charts */}
      {[...Array(7)].map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <mesh position={[-6 + i * 2, -3 + Math.random() * 2, 0]}>
            <boxGeometry args={[1, 2 + Math.random() * 4, 1]} />
            <meshStandardMaterial color="#34d399" transparent opacity={0.8} />
          </mesh>
        </Float>
      ))}

      <Html transform distanceFactor={12} position={[4, 1, 2]}>
        <div style={{ width: '220px', padding: '20px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(52, 211, 153, 0.4)' }}>
          <div style={{ color: '#34D399', fontSize: '2rem', fontWeight: 'bold' }}>+84%</div>
          <div style={{ color: '#9CA3AF', fontSize: '1rem' }}>Conversion Rate</div>
        </div>
      </Html>
    </group>
  );
}

// --------------------------------------------------------
// Section: Integrations (Z = -105)
// --------------------------------------------------------
function IntegrationsSection() {
  return (
    <group position={[0, 0, -105]}>
      <Html transform distanceFactor={15} position={[0, 3, 0]}>
        <div style={{ textAlign: 'center', color: 'white', width: '600px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '20px', whiteSpace: 'nowrap' }}>Webhooks & Integrations</h2>
          <Link href="/builder" style={{ padding: '16px 32px', background: '#6366F1', color: 'white', textDecoration: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, display: 'inline-block' }}>
            Start For Free
          </Link>
        </div>
      </Html>
      
      {/* Network sphere */}
      <mesh position={[0, 0, -5]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial color="#6366f1" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Floating API packets */}
      {[...Array(10)].map((_, i) => (
        <Float key={i} speed={3} rotationIntensity={2} floatIntensity={3}>
          <mesh position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, -2 + Math.random() * 4]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={2} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// --------------------------------------------------------
// Camera Controller
// --------------------------------------------------------
function CameraController() {
  const scroll = useScroll();
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(() => {
    if (cameraRef.current) {
      // scroll.offset goes from 0 to 1
      // We map 0 -> 1 to Z values 5 -> -110
      const targetZ = 5 - scroll.offset * 125;
      
      // Smooth interpolation for camera position
      cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, targetZ, 0.05);

      // Slight rotation for depth feeling
      cameraRef.current.rotation.x = THREE.MathUtils.lerp(cameraRef.current.rotation.x, scroll.offset * 0.1, 0.05);
      cameraRef.current.rotation.y = THREE.MathUtils.lerp(cameraRef.current.rotation.y, Math.sin(scroll.offset * Math.PI * 2) * 0.05, 0.05);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 5]} fov={60} />;
}

// --------------------------------------------------------
// Main Canvas Component
// --------------------------------------------------------
export default function StorytellingCanvas() {
  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 10, 40]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#c7d2fe" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#f472b6" />
        
        <Particles />

        <ScrollControls pages={5} damping={0.2} maxSpeed={0.5}>
          <CameraController />
          
          <HeroSection />
          <FeaturesSection />
          <LogicSection />
          <AnalyticsSection />
          <IntegrationsSection />
        </ScrollControls>
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}
