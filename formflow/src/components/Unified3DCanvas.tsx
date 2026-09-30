'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Unified3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

    // Renderer — high-perf
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // ── Groups ──
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // ── 1. Central Core — morphing wireframe icosahedron ──
    const coreGeo = new THREE.IcosahedronGeometry(1.4, 1);
    const corePositions = coreGeo.attributes.position.array.slice(); // save original
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // Inner sphere
    const innerGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // ── 2. Orbital rings that expand/contract with scroll ──
    const rings: THREE.Mesh[] = [];
    const ringRadii = [2.2, 3.0, 3.8];
    const ringColors = [0x818cf8, 0xa78bfa, 0xc4b5fd];

    ringRadii.forEach((r, i) => {
      const ringGeo = new THREE.TorusGeometry(r, 0.015, 8, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.25,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + (i * 0.3);
      ring.rotation.y = i * 0.5;
      mainGroup.add(ring);
      rings.push(ring);
    });

    // ── 3. Floating geometric satellites ──
    const satellites: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; yOffset: number }[] = [];
    const satGeos = [
      new THREE.OctahedronGeometry(0.15, 0),
      new THREE.TetrahedronGeometry(0.18, 0),
      new THREE.BoxGeometry(0.14, 0.14, 0.14),
      new THREE.IcosahedronGeometry(0.12, 0),
    ];

    for (let i = 0; i < 12; i++) {
      const geo = satGeos[i % satGeos.length];
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.65 + (i / 12) * 0.15, 0.7, 0.65),
        wireframe: i % 3 === 0,
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 12) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 2;
      mesh.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 3,
        Math.sin(angle) * radius - 2
      );
      mainGroup.add(mesh);
      satellites.push({
        mesh,
        angle,
        radius,
        speed: 0.1 + Math.random() * 0.15,
        yOffset: (Math.random() - 0.5) * 3,
      });
    }

    // ── 4. Particles ──
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount); // individual drift speeds

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 18;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 28;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      particleSpeeds[i] = 0.2 + Math.random() * 0.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.09,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── 5. Connection lines from core to satellites (scroll-reactive) ──
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(satellites.length * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.08,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    mainGroup.add(lines);

    // ── Scroll & Mouse tracking ──
    let latestScrollY = 0;
    let targetScrollY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let scrollVelocity = 0;
    let prevScrollY = 0;

    const onScroll = () => {
      latestScrollY = window.scrollY;
    };

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width - 0.5) * 0.4;
      targetMouseY = (e.clientY / height - 0.5) * 0.4;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Resize
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // ── Animation ──
    let animId: number;
    let lastTime = performance.now();

    const totalPageHeight = () => Math.max(document.body.scrollHeight - window.innerHeight, 1);

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) * 0.001, 0.05); // cap delta
      lastTime = now;

      // Smooth scroll lerp
      targetScrollY += (latestScrollY - targetScrollY) * 0.1;
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Scroll velocity (for reactive burst effects)
      scrollVelocity = Math.abs(targetScrollY - prevScrollY);
      prevScrollY = targetScrollY;

      // Scroll ratio 0 → 1
      const scrollRatio = targetScrollY / totalPageHeight();

      // ── Core morph based on scroll ──
      const posAttr = coreGeo.attributes.position;
      const time = now * 0.001;
      for (let i = 0; i < posAttr.count; i++) {
        const ox = corePositions[i * 3];
        const oy = corePositions[i * 3 + 1];
        const oz = corePositions[i * 3 + 2];
        const noise = Math.sin(ox * 3 + time * 1.5) * Math.cos(oy * 2.5 + time) * 0.12;
        const scrollMorph = scrollRatio * 0.25;
        posAttr.setXYZ(
          i,
          ox * (1 + noise + scrollMorph),
          oy * (1 + noise * 0.8 + scrollMorph * 0.5),
          oz * (1 + noise * 1.2 + scrollMorph)
        );
      }
      posAttr.needsUpdate = true;

      // Core rotation — accelerates with scroll velocity
      const velocityBoost = Math.min(scrollVelocity * 0.002, 0.8);
      coreMesh.rotation.y += delta * (0.3 + velocityBoost);
      coreMesh.rotation.x += delta * (0.2 + velocityBoost * 0.5);
      innerMesh.rotation.y -= delta * 0.2;

      // Core color shift with scroll
      const hue = 0.65 + scrollRatio * 0.15; // indigo → purple shift
      (coreMat as THREE.MeshBasicMaterial).color.setHSL(hue, 0.7, 0.6);
      coreMat.opacity = 0.5 + scrollRatio * 0.3;

      // Inner sphere pulses faster on scroll
      const pulse = 1 + Math.sin(time * 2 + scrollRatio * 10) * (0.05 + scrollVelocity * 0.001);
      innerMesh.scale.setScalar(pulse);

      // ── Orbital rings expand/tilt with scroll ──
      rings.forEach((ring, i) => {
        const baseScale = 1 + scrollRatio * (0.3 + i * 0.15);
        ring.scale.setScalar(baseScale);
        ring.rotation.x += delta * (0.1 + i * 0.05 + velocityBoost * 0.3);
        ring.rotation.z += delta * (0.05 + i * 0.03);
        // Opacity peaks mid-page, fades at edges
        const ringOpacity = 0.15 + Math.sin(scrollRatio * Math.PI) * 0.25;
        (ring.material as THREE.MeshBasicMaterial).opacity = ringOpacity;
      });

      // ── Satellites orbit and react to scroll ──
      satellites.forEach((sat, i) => {
        sat.angle += delta * sat.speed * (1 + velocityBoost * 2);
        const dynamicRadius = sat.radius + scrollRatio * 1.5 + Math.sin(time + i) * 0.3;
        sat.mesh.position.x = Math.cos(sat.angle) * dynamicRadius;
        sat.mesh.position.z = Math.sin(sat.angle) * dynamicRadius - 2;
        sat.mesh.position.y = sat.yOffset + Math.sin(time * 0.5 + i * 0.8) * 0.5;

        sat.mesh.rotation.x += delta * 0.5;
        sat.mesh.rotation.y += delta * 0.3;

        // Update connection lines
        const lp = lines.geometry.attributes.position;
        lp.setXYZ(i * 2, 0, 0, 0); // core center
        lp.setXYZ(i * 2 + 1, sat.mesh.position.x, sat.mesh.position.y, sat.mesh.position.z);
      });
      lines.geometry.attributes.position.needsUpdate = true;

      // Connection line opacity reacts to scroll velocity
      const lineOpacity = 0.04 + Math.min(scrollVelocity * 0.003, 0.15);
      (lineMat as THREE.LineBasicMaterial).opacity = lineOpacity;

      // ── Particles drift & react ──
      const pp = particles.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const y = pp.getY(i);
        pp.setY(i, y + delta * particleSpeeds[i] * (0.3 + scrollVelocity * 0.01));
        // wrap particles that drift too far
        if (pp.getY(i) > 14) pp.setY(i, -14);
      }
      pp.needsUpdate = true;
      particles.rotation.y += delta * 0.03;

      // ── Camera responds to scroll and mouse ──
      camera.position.y = -targetScrollY * 0.003;
      camera.position.z = 9 - scrollRatio * 2; // zoom in as you scroll
      mainGroup.rotation.y = mouseX + targetScrollY * 0.0005;
      mainGroup.rotation.x = mouseY + Math.sin(scrollRatio * Math.PI) * 0.15;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
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
