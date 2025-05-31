import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/components/ThemeProvider';

interface Keyboard3DProps {
  currentKey?: string;
  accuracy: number;
  wpm: number;
  isTyping: boolean;
}

export const Keyboard3D = ({ currentKey, accuracy, wpm, isTyping }: Keyboard3DProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const keyboardRef = useRef<THREE.Group>();
  const keysRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animationIdRef = useRef<number>();
  const { theme } = useTheme();

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup with theme-based background
    const scene = new THREE.Scene();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    scene.background = new THREE.Color(isDark ? 0x0a0a0a : 0xf8fafc);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Theme-based lighting
    const ambientLight = new THREE.AmbientLight(0x404040, isDark ? 0.3 : 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(isDark ? 0x4fc3f7 : 0x3b82f6, isDark ? 1 : 0.8);
    mainLight.position.set(10, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const accentLight = new THREE.PointLight(isDark ? 0x9c27b0 : 0x8b5cf6, isDark ? 0.8 : 0.5, 20);
    accentLight.position.set(-5, 5, 5);
    scene.add(accentLight);

    // Create keyboard
    const keyboard = new THREE.Group();
    keyboardRef.current = keyboard;
    scene.add(keyboard);

    // Improved keyboard layout with proper key mapping
    const keyLayout = [
      {
        keys: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'],
        startX: -8,
        y: 0,
        z: 1.8
      },
      {
        keys: ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
        startX: -7.5,
        y: 0,
        z: 0.6
      },
      {
        keys: ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
        startX: -7,
        y: 0,
        z: -0.6
      },
      {
        keys: ['shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift'],
        startX: -6.5,
        y: 0,
        z: -1.8
      },
      {
        keys: ['ctrl', 'cmd', 'alt', ' ', 'alt', 'ctrl'],
        startX: -4,
        y: 0,
        z: -3
      }
    ];

    const keyGeometry = new THREE.BoxGeometry(1, 0.2, 1);
    const normalMaterial = new THREE.MeshPhongMaterial({ 
      color: isDark ? 0x2a2a2a : 0xe2e8f0,
      emissive: isDark ? 0x111111 : 0x0f172a
    });

    keyLayout.forEach((row) => {
      row.keys.forEach((key, keyIndex) => {
        const keyMesh = new THREE.Mesh(keyGeometry, normalMaterial.clone());
        
        // Calculate position based on key index and row
        let x = row.startX + (keyIndex * 1.2);
        
        // Handle special key sizes and positions
        if (key === ' ') {
          keyMesh.scale.x = 6;
          x = 0; // Center spacebar
        } else if (key === 'backspace') {
          keyMesh.scale.x = 2;
          x += 0.6;
        } else if (['tab', 'caps', 'enter'].includes(key)) {
          keyMesh.scale.x = 1.8;
          x += 0.4;
        } else if (key === 'shift') {
          keyMesh.scale.x = 2.2;
          if (keyIndex > 6) x += 1; // Right shift adjustment
        }

        keyMesh.position.set(x, row.y, row.z);
        keyMesh.castShadow = true;
        keyMesh.receiveShadow = true;
        keyboard.add(keyMesh);
        
        // Store key with proper mapping
        keysRef.current.set(key.toLowerCase(), keyMesh);
        
        // Also map common variations
        if (key === ' ') keysRef.current.set('space', keyMesh);
        if (key === 'enter') keysRef.current.set('return', keyMesh);
      });
    });

    // Add base platform with theme-based styling
    const baseGeometry = new THREE.BoxGeometry(20, 0.5, 8);
    const baseMaterial = new THREE.MeshPhongMaterial({ 
      color: isDark ? 0x1a1a1a : 0xf1f5f9,
      emissive: isDark ? 0x0a0a0a : 0x475569,
      transparent: true,
      opacity: 0.8
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.5;
    base.receiveShadow = true;
    keyboard.add(base);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Subtle rotation for better view
      if (keyboard) {
        keyboard.rotation.y = Math.sin(Date.now() * 0.0003) * 0.05;
        keyboard.rotation.x = Math.sin(Date.now() * 0.0002) * 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [theme]);

  // Update key highlighting based on typing
  useEffect(() => {
    if (!keysRef.current) return;

    // Reset all keys
    keysRef.current.forEach((keyMesh) => {
      (keyMesh.material as THREE.MeshPhongMaterial).color.setHex(0x2a2a2a);
      (keyMesh.material as THREE.MeshPhongMaterial).emissive.setHex(0x111111);
      keyMesh.position.y = 0;
    });

    // Highlight current key
    if (currentKey) {
      let targetKey = currentKey.toLowerCase();
      
      // Handle special key mappings
      if (targetKey === ' ') targetKey = 'space';
      if (targetKey === 'enter') targetKey = 'return';
      
      const keyMesh = keysRef.current.get(targetKey);
      if (keyMesh) {
        const material = keyMesh.material as THREE.MeshPhongMaterial;
        
        // Color based on accuracy with glass morphism effect
        if (accuracy >= 95) {
          material.color.setHex(0x4caf50); // Green
          material.emissive.setHex(0x1b5e20);
        } else if (accuracy >= 85) {
          material.color.setHex(0x2196f3); // Blue
          material.emissive.setHex(0x0d47a1);
        } else {
          material.color.setHex(0xff9800); // Orange
          material.emissive.setHex(0xe65100);
        }

        // Enhanced key press animation
        keyMesh.position.y = -0.1;
        keyMesh.scale.y = 0.8;
        
        setTimeout(() => {
          keyMesh.position.y = 0;
          keyMesh.scale.y = 1;
        }, 150);
      }
    }

    // Wave effect based on WPM with jiggle
    if (isTyping && wpm > 0) {
      keysRef.current.forEach((keyMesh, key) => {
        const time = Date.now() * 0.008;
        const wave = Math.sin(time + keyMesh.position.x * 0.3) * 0.03 * (wpm / 100);
        const jiggle = Math.cos(time * 2 + keyMesh.position.z * 0.5) * 0.01 * (wpm / 200);
        keyMesh.position.y = wave;
        keyMesh.rotation.y = jiggle;
      });
    }
  }, [currentKey, accuracy, wpm, isTyping]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/70 dark:from-gray-900/50 dark:to-black/70 light:from-white/50 light:to-gray-100/70 border border-gray-700/50 dark:border-gray-700/50 light:border-gray-300/50 backdrop-blur-lg shadow-2xl hover:animate-jiggle transition-all duration-300"
    />
  );
};
