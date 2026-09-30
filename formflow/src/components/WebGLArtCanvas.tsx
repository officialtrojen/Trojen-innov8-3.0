// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function WebGLArtCanvas() {
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

    // GLSL Generative 3D Shader Art Uniforms
    const uniforms = {
      u_time: { value: 0.0 },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_scroll: { value: 0.0 },
    };

    // Custom GLSL Fragment Shader Art (Organic Cyber Fluid & Energy Waves)
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_scroll;

      // 2D Simplex Noise Helper Functions
      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                 -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        st.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.25;

        // Mouse interaction ripple
        vec2 mouse = u_mouse * vec2(u_resolution.x / u_resolution.y, 1.0);
        float distToMouse = length(st - mouse);
        float mouseRipple = sin(distToMouse * 20.0 - u_time * 4.0) * exp(-distToMouse * 3.0);

        // Multi-layered generative WebGL Art Noise
        vec2 q = vec2(0.0);
        q.x = snoise(st + vec2(t * 0.1, t * 0.15));
        q.y = snoise(st + vec2(t * 0.2, -t * 0.1));

        vec2 r = vec2(0.0);
        r.x = snoise(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t + mouseRipple * 0.2);
        r.y = snoise(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t + u_scroll * 0.001);

        float f = snoise(st + r * 2.0);

        // Cyber Palette Gradients: Electric Indigo, Neon Cyan, Deep Magenta
        vec3 col1 = vec3(0.04, 0.06, 0.12); // Obsidian base
        vec3 col2 = vec3(0.38, 0.40, 0.94); // Electric Indigo
        vec3 col3 = vec3(0.02, 0.71, 0.83); // Cyber Cyan
        vec3 col4 = vec3(0.92, 0.28, 0.60); // Magenta Pink

        vec3 color = mix(col1, col2, clamp(f * f * 4.0, 0.0, 1.0));
        color = mix(color, col3, clamp(length(q), 0.0, 1.0));
        color = mix(color, col4, clamp(length(r.x), 0.0, 1.0) * 0.3);

        // Subtle Grid Overlay Lines
        float grid = abs(sin(st.x * 40.0) * sin(st.y * 40.0));
        color += vec3(0.2, 0.2, 0.4) * pow(grid, 12.0) * 0.15;

        // Vignette & Opacity
        float alpha = clamp((f + 0.5) * 0.45, 0.15, 0.5);

        gl_FragColor = vec4(color, alpha);
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

    // Track mouse & scroll
    const onMouseMove = (e: MouseEvent) => {
      uniforms.u_mouse.value.set(e.clientX / width, 1.0 - e.clientY / height);
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

    // Render loop
    let animId: number;
    let startTime = performance.now();

    const animate = () => {
      const elapsed = (performance.now() - startTime) * 0.001;
      uniforms.u_time.value = elapsed;

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
