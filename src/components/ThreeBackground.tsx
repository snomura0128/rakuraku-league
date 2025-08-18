'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const particlesRef = useRef<THREE.Points>();
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 500;
    cameraRef.current = camera;

    // Renderer setup
    const isMobile = window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: !isMobile
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Create flowing particles
    const createParticles = () => {
      const particleCount = isMobile ? 800 : 1500;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      
      // Orange color palette
      const colorPalette = [
        new THREE.Color(0xff6b35), // Deep orange
        new THREE.Color(0xff8c42), // Orange
        new THREE.Color(0xffa726), // Amber
        new THREE.Color(0xffb74d), // Light amber
        new THREE.Color(0xffc947), // Golden
        new THREE.Color(0xffe0b2), // Peach
      ];

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions
        positions[i3] = (Math.random() - 0.5) * 2000;
        positions[i3 + 1] = (Math.random() - 0.5) * 2000;
        positions[i3 + 2] = (Math.random() - 0.5) * 1000;
        
        // Random velocities for flowing motion
        velocities[i3] = (Math.random() - 0.5) * 0.5;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.3;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
        
        // Assign random orange colors
        const selectedColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = selectedColor.r;
        colors[i3 + 1] = selectedColor.g;
        colors[i3 + 2] = selectedColor.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // Store velocities as custom attribute
      (geometry as any).velocities = velocities;

      const material = new THREE.PointsMaterial({
        size: isMobile ? 2 : 3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      
      return particles;
    };

    particlesRef.current = createParticles();

    // Animation loop
    let lastTime = 0;
    const targetFPS = isMobile ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number = 0) => {
      animationRef.current = requestAnimationFrame(animate);

      if (currentTime - lastTime < frameInterval) return;
      lastTime = currentTime;

      // Animate particles
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = (particlesRef.current.geometry as any).velocities;
        const particleCount = positions.length / 3;

        for (let i = 0; i < particleCount; i++) {
          const i3 = i * 3;
          
          // Update positions based on velocities
          positions[i3] += velocities[i3];
          positions[i3 + 1] += velocities[i3 + 1];
          positions[i3 + 2] += velocities[i3 + 2];
          
          // Create flowing wave motion
          const time = currentTime * 0.001;
          positions[i3] += Math.sin(time + positions[i3 + 1] * 0.01) * 0.2;
          positions[i3 + 1] += Math.cos(time + positions[i3] * 0.01) * 0.1;
          
          // Reset particles that go too far
          if (positions[i3] > 1000) positions[i3] = -1000;
          if (positions[i3] < -1000) positions[i3] = 1000;
          if (positions[i3 + 1] > 1000) positions[i3 + 1] = -1000;
          if (positions[i3 + 1] < -1000) positions[i3 + 1] = 1000;
          if (positions[i3 + 2] > 500) positions[i3 + 2] = -500;
          if (positions[i3 + 2] < -500) positions[i3 + 2] = 500;
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        
        // Rotate the entire particle system slowly
        particlesRef.current.rotation.y += 0.0005;
        particlesRef.current.rotation.x += 0.0002;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js resources
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        if (particlesRef.current.material instanceof THREE.Material) {
          particlesRef.current.material.dispose();
        }
      }
      
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

export default ThreeBackground;