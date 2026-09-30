'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Scroll3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group that moves with scroll
    const scrollGroup = new THREE.Group();
    scene.add(scrollGroup);

    // 1. Floating 3D Geometric Form Elements
    const elements: { mesh: THREE.Mesh; rotSpeed: { x: number; y: number }; initialY: number }[] = [];

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.2, metalness: 0.8, wireframe: true }),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.3, metalness: 0.6 }),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, metalness: 0.9 }),
      new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.4, metalness: 0.5 }),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2, metalness: 0.7, wireframe: true }),
    ];

    const geometries = [
      new THREE.BoxGeometry(0.8, 0.8, 0.8),
      new THREE.IcosahedronGeometry(0.7, 0),
      new THREE.OctahedronGeometry(0.75, 0),
      new THREE.TorusGeometry(0.5, 0.2, 16, 32),
      new THREE.TetrahedronGeometry(0.8, 0),
    ];

    // Create floating objects scattered vertically along scroll path
    for (let i = 0; i < 24; i++) {
      const geo = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geo, mat);

      const x = (Math.random() - 0.5) * 14;
      const initialY = 12 - (i / 24) * 35; // Distribute from top y=12 down to y=-23
      const z = (Math.random() - 0.5) * 8 - 2;

      mesh.position.set(x, initialY, z);
      scrollGroup.add(mesh);

      elements.push({
        mesh,
        rotSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
        },
        initialY,
      });
    }

    // 2. Central Scroll-interactive Logic Ring Node
    const ringGeo = new THREE.TorusGeometry(3.5, 0.04, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.4, wireframe: true });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0, -3);
    scene.add(ringMesh);

    // 3. Scroll Particles
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 20;
      particlePositions[i + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i + 2] = (Math.random() - 0.5) * 15;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x6366f1, 4, 30);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x06b6d4, 3, 30);
    light2.position.set(-5, -10, 5);
    scene.add(light2);

    // Scroll Tracking
    let targetScrollY = 0;
    let currentScrollY = 0;

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;
      const scrollRatio = currentScrollY / (document.body.scrollHeight || 1);

      // Move camera and 3D scene smoothly with scroll
      camera.position.y = -currentScrollY * 0.012;
      camera.rotation.z = Math.sin(scrollRatio * Math.PI * 2) * 0.05;

      ringMesh.rotation.x = time * 0.2 + currentScrollY * 0.002;
      ringMesh.rotation.y = time * 0.3 + currentScrollY * 0.003;
      ringMesh.position.y = camera.position.y;

      // Animate 3D elements based on scroll activity
      elements.forEach(({ mesh, rotSpeed }, idx) => {
        mesh.rotation.x += rotSpeed.x + currentScrollY * 0.00005 * (idx % 2 === 0 ? 1 : -1);
        mesh.rotation.y += rotSpeed.y + currentScrollY * 0.00005;

        // Floating hover motion
        mesh.position.x += Math.sin(time + idx) * 0.003;
      });

      particles.rotation.y = time * 0.02;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', handleScroll);
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
