'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for mouse rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Metallic Wireframe Node (representing the core Form Engine)
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x4f7c7a,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x84a59d,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 2. Floating Orbiting Form Field Nodes
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);

    const nodeColors = [0x52796f, 0x84a59d, 0xf7d6c8, 0x4f7c7a, 0x354f52];
    const nodeCount = 6;
    const nodes: THREE.Mesh[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.8;

      const nodeGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: nodeColors[i % nodeColors.length],
        metalness: 0.5,
        roughness: 0.3,
      });

      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        (Math.random() - 0.5) * 0.8
      );
      nodeGroup.add(node);
      nodes.push(node);
    }

    // 3. 3D Connecting Lines between Nodes (Logic Flow Links)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x84a59d,
      transparent: true,
      opacity: 0.5,
    });

    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(nodeCount * 6); // 2 points per line segment

    for (let i = 0; i < nodeCount; i++) {
      const nextIdx = (i + 1) % nodeCount;
      const p1 = nodes[i].position;
      const p2 = nodes[nextIdx].position;

      linePositions[i * 6 + 0] = p1.x;
      linePositions[i * 6 + 1] = p1.y;
      linePositions[i * 6 + 2] = p1.z;

      linePositions[i * 6 + 3] = p2.x;
      linePositions[i * 6 + 4] = p2.y;
      linePositions[i * 6 + 5] = p2.z;
    }

    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const linesMesh = new THREE.LineSegments(lineGeo, lineMaterial);
    nodeGroup.add(linesMesh);

    // 4. Background Floating Particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particleCoords[i] = (Math.random() - 0.5) * 12;
      particleCoords[i + 1] = (Math.random() - 0.5) * 12;
      particleCoords[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particleCoords, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x52796f,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x4f7c7a, 3, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf7d6c8, 2, 20);
    pointLight2.position.set(-4, -4, 2);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      targetX = (x / rect.width) * 0.8;
      targetY = (y / rect.height) * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera/group tilt towards mouse
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      mainGroup.rotation.y = elapsedTime * 0.2 + mouseX;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.15) * 0.15 + mouseY;

      // Orbit inner components
      coreMesh.rotation.x = elapsedTime * 0.3;
      coreMesh.rotation.y = elapsedTime * 0.4;

      innerMesh.scale.setScalar(1 + Math.sin(elapsedTime * 2) * 0.05);

      nodeGroup.rotation.z = -elapsedTime * 0.15;

      // Pulse particle positions
      particles.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        height: '420px',
        position: 'relative',
        cursor: isHovered ? 'grab' : 'default',
        borderRadius: '24px',
        background: 'radial-gradient(circle at 50% 50%, rgba(132, 165, 157, 0.12), rgba(255, 254, 249, 0) 70%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 16px',
          borderRadius: 999,
          background: 'rgba(255, 254, 249, 0.75)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(184, 206, 207, 0.4)',
          fontSize: 12,
          fontWeight: 600,
          color: '#263B3B',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(38, 59, 59, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#4F7C7A', display: 'inline-block' }} />
        Interactive 3D Form Logic Node Engine • Move mouse to rotate
      </div>
    </div>
  );
}
