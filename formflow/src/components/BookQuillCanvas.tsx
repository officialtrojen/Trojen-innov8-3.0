// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function BookQuillCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ---------- 1. Scene, Camera, Renderer ----------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 6.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ---------- 2. Lighting ----------
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff2df, 1.8);
    dirLight.position.set(4, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xd4af37, 2.0, 10); // Warm gold accent glow
    pointLight.position.set(-2, 2, 3);
    scene.add(pointLight);

    // ---------- 3. Book Group & Materials ----------
    const bookGroup = new THREE.Group();
    bookGroup.position.set(2.2, -0.6, 0); // Positioned subtly on the right
    bookGroup.rotation.y = -Math.PI * 0.18;
    bookGroup.rotation.x = Math.PI * 0.12;
    scene.add(bookGroup);

    // Materials
    const redCoverMat = new THREE.MeshStandardMaterial({
      color: 0x7a1010, // Dense Crimson Red Book Cover
      roughness: 0.35,
      metalness: 0.1,
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Gold Leaf Trim
      roughness: 0.2,
      metalness: 0.85,
    });

    const pageMat = new THREE.MeshStandardMaterial({
      color: 0xf7f4ea, // Off-white Paper
      roughness: 0.9,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });

    // Book Covers (Dense Red Hardback)
    const coverGeo = new THREE.BoxGeometry(2.4, 0.08, 3.2);
    
    // Bottom Cover
    const bottomCover = new THREE.Mesh(coverGeo, redCoverMat);
    bottomCover.position.set(0, -0.18, 0);
    bottomCover.receiveShadow = true;
    bookGroup.add(bottomCover);

    // Top Cover
    const topCover = new THREE.Mesh(coverGeo, redCoverMat);
    topCover.position.set(-1.18, 0.18, 0);
    topCover.rotation.z = Math.PI * 0.05;
    topCover.receiveShadow = true;
    bookGroup.add(topCover);

    // Book Spine
    const spineGeo = new THREE.BoxGeometry(0.12, 0.44, 3.22);
    const spine = new THREE.Mesh(spineGeo, redCoverMat);
    spine.position.set(-1.22, 0, 0);
    bookGroup.add(spine);

    // Gold Spine Bands
    for (let i = -1; i <= 1; i += 0.6) {
      const bandGeo = new THREE.BoxGeometry(0.14, 0.04, 3.24);
      const band = new THREE.Mesh(bandGeo, goldTrimMat);
      band.position.set(-1.22, i * 0.12, 0);
      bookGroup.add(band);
    }

    // Book Pages Block (Paper Stack)
    const blockGeo = new THREE.BoxGeometry(2.28, 0.32, 3.08);
    const paperBlock = new THREE.Mesh(blockGeo, pageMat);
    paperBlock.position.set(0.02, 0, 0);
    bookGroup.add(paperBlock);

    // ---------- 4. Animated Turning Page Mesh ----------
    // Curving geometry for page turn
    const pageSegments = 16;
    const pageTurnGeo = new THREE.PlaneGeometry(2.2, 3.0, pageSegments, 1);
    pageTurnGeo.translate(1.1, 0, 0); // Origin at spine hinge

    const pageTurnMesh = new THREE.Mesh(pageTurnGeo, pageMat);
    pageTurnMesh.position.set(-1.1, 0.17, 0);
    bookGroup.add(pageTurnMesh);

    // ---------- 5. Feather Quill & Nib ----------
    const quillGroup = new THREE.Group();
    quillGroup.position.set(0.2, 0.6, 0.5);
    quillGroup.rotation.z = -Math.PI * 0.25;
    quillGroup.rotation.x = Math.PI * 0.1;
    bookGroup.add(quillGroup);

    // Quill Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.015, 0.005, 1.8, 8);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xfffcf5, roughness: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.set(0, 0.9, 0);
    quillGroup.add(shaft);

    // Feather Vane (Stylized Feather Body)
    const featherGeo = new THREE.ConeGeometry(0.18, 1.4, 4);
    featherGeo.scale(0.2, 1, 1);
    const featherMat = new THREE.MeshStandardMaterial({
      color: 0xf3ebe1,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const feather = new THREE.Mesh(featherGeo, featherMat);
    feather.position.set(0, 1.1, 0);
    quillGroup.add(feather);

    // Golden Nib
    const nibGeo = new THREE.ConeGeometry(0.02, 0.15, 6);
    const nib = new THREE.Mesh(nibGeo, goldTrimMat);
    nib.position.set(0, 0, 0);
    nib.rotation.x = Math.PI;
    quillGroup.add(nib);

    // Ink Particle Stream
    const inkParticleCount = 45;
    const inkGeo = new THREE.BufferGeometry();
    const inkPositions = new Float32Array(inkParticleCount * 3);
    for (let i = 0; i < inkParticleCount * 3; i++) {
      inkPositions[i] = (Math.random() - 0.5) * 0.05;
    }
    inkGeo.setAttribute('position', new THREE.BufferAttribute(inkPositions, 3));
    const inkParticles = new THREE.Points(inkGeo, new THREE.PointsMaterial({
      color: 0x7a1010,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
    }));
    quillGroup.add(inkParticles);

    // ---------- 6. Scroll Dynamics & Animation Loop ----------
    let scrollProgress = 0;
    let targetScroll = 0;

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetScroll = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      // Reposition book slightly for mobile vs desktop
      if (width < 768) {
        bookGroup.position.set(0, -1.8, -1.5);
        bookGroup.scale.set(0.75, 0.75, 0.75);
      } else {
        bookGroup.position.set(2.2, -0.6, 0);
        bookGroup.scale.set(1, 1, 1);
      }
    };
    window.addEventListener('resize', onResize, { passive: true });
    onResize();

    let animId: number;
    let time = 0;

    const animate = () => {
      time += 0.015;

      // Smooth scroll lerp
      scrollProgress += (targetScroll - scrollProgress) * 0.08;

      // 1. Page Turn Curve (Bend Vertices along sine wave)
      const turnAngle = scrollProgress * Math.PI * 0.85; // Flip from 0 to 150 deg
      const posAttr = pageTurnGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const factor = x / 2.2; // 0 to 1 along page width
        
        // Curl lifting as page turns
        const lift = Math.sin(factor * Math.PI) * Math.sin(turnAngle) * 0.45;
        const zRot = -turnAngle * factor;

        const newX = x * Math.cos(zRot);
        const newY = x * Math.sin(zRot) + lift;

        posAttr.setY(i, newY);
      }
      posAttr.needsUpdate = true;

      // 2. Feather Writing Path (Writing wave over the turning page)
      const writeX = Math.sin(time * 2.5) * 0.6 + (scrollProgress * 0.5 - 0.25);
      const writeZ = Math.cos(time * 1.8) * 0.8;
      const writeY = 0.22 + Math.abs(Math.sin(time * 4)) * 0.04;

      quillGroup.position.set(writeX - 0.5, writeY, writeZ);
      quillGroup.rotation.z = -Math.PI * 0.25 + Math.sin(time * 3) * 0.08;

      // 3. Subtle floating rotation for the whole book
      bookGroup.rotation.y = -Math.PI * 0.18 + Math.sin(time * 0.5) * 0.03 + (scrollProgress * 0.15);
      bookGroup.rotation.x = Math.PI * 0.12 + Math.cos(time * 0.4) * 0.02;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        opacity: 0.9,
      }}
    />
  );
}
