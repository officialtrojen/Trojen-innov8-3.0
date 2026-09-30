'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BlackHoleCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Uniforms for Black Hole Raymarching Shader
    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_scroll: { value: 0.0 },
    };

    // GLSL Gravitational Lensing & Accretion Disk Shader
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_scroll;

      // Noise functions for Accretion Disk Plasma
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 5; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

        // Smooth mouse gravitation center
        vec2 mouse = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) * 0.6;
        vec2 p = uv - mouse;

        float r = length(p);
        float angle = atan(p.y, p.x);

        // Event Horizon radius
        float eventHorizon = 0.22;
        float photonRing = 0.26;

        // Gravitational Lensing Space Distortion
        float distortion = 1.0 / (r * 3.5 + 0.1);
        vec2 distortedUv = p * (1.0 - distortion * 0.12);

        // Accretion Disk Swirl Dynamics
        float speed = u_time * 0.8 + u_scroll * 0.002;
        float swirl = angle + 4.0 / (r + 0.1) + speed;
        vec2 polarUv = vec2(r * 5.0, swirl * 2.0);

        float plasma = fbm(polarUv);

        // Black Hole Color Palette (Event Horizon, Photon Ring, Plasma Glow)
        vec3 spaceColor = vec3(0.02, 0.03, 0.08); // Dark cosmic space
        vec3 plasmaHot = vec3(0.38, 0.40, 0.96); // Electric Indigo (#6366F1)
        vec3 plasmaCyan = vec3(0.02, 0.71, 0.83); // Cyber Cyan (#06B6D4)
        vec3 photonGlow = vec3(0.76, 0.52, 0.99); // Quantum Violet (#C084FC)
        vec3 amberBeam = vec3(0.98, 0.65, 0.32); // Relativistic Beaming Amber

        vec3 col = spaceColor;

        // Accretion Disk Rendering
        if (r > eventHorizon) {
          float diskIntensity = smoothstep(0.7, eventHorizon, r) * smoothstep(eventHorizon - 0.05, 0.5, r);
          float DopplerBeaming = 0.5 + 0.5 * sin(angle + u_time);
          
          vec3 diskColor = mix(plasmaHot, plasmaCyan, plasma);
          diskColor = mix(diskColor, amberBeam, DopplerBeaming * 0.4);

          col += diskColor * plasma * diskIntensity * 1.8;

          // Photon Ring (Shimmering Light ring around singularity)
          float ringWidth = abs(r - photonRing);
          float ringGlow = exp(-ringWidth * 45.0);
          col += photonGlow * ringGlow * 2.5;
        }

        // Singularity (Pure Event Horizon darkness)
        if (r < eventHorizon) {
          col = vec3(0.0);
        }

        // Outer Gravitational Lens Atmosphere Glow
        float outerGlow = exp(-r * 3.0);
        col += plasmaHot * outerGlow * 0.35;

        // Stars & Quantum Particles
        float star = pow(hash(gl_FragCoord.xy), 40.0) * 0.8;
        if (r > eventHorizon * 1.2) {
          col += vec3(star);
        }

        float alpha = clamp(outerGlow + plasma * 0.5, 0.2, 0.85);

        gl_FragColor = vec4(col, alpha);
      }
    `;

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse & Scroll Interactivity
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / width;
      targetMouseY = 1.0 - e.clientY / height;
    };

    const onScroll = () => {
      uniforms.u_scroll.value = window.scrollY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Resize
    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      renderer.setSize(width, height);
      uniforms.u_resolution.value.set(width, height);
    };

    window.addEventListener('resize', onResize, { passive: true });

    // Animation Loop with Gravitational Inertia
    let animId: number;
    let startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) * 0.001;
      uniforms.u_time.value = elapsed;

      // Smooth gravitational tracking lerp
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      uniforms.u_mouse.value.set(currentMouseX, currentMouseY);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      material.dispose();
      geometry.dispose();
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
