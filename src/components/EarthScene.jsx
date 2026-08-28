import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Procedural planet + atmosphere + starfield. No external textures or assets,
   so it works fully offline and stays light. Geometry/particle counts scale
   down on low-power devices via the `quality` prop. */

function Planet({ reducedMotion }) {
  const meshRef = useRef();
  const detail = 4;

  useFrame((_, delta) => {
    if (meshRef.current && !reducedMotion) {
      meshRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group rotation={[0.35, 0, 0.12]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, detail]} />
        <meshStandardMaterial
          color="#1e4f9e"
          emissive="#0a1c48"
          emissiveIntensity={0.28}
          roughness={0.62}
          metalness={0.2}
          flatShading
        />
      </mesh>
      {/* Atmosphere: a slightly larger back-facing shell with a fresnel glow. */}
      <mesh scale={1.2}>
        <sphereGeometry args={[1.3, 48, 48]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{ uColor: { value: new THREE.Color('#4d94e6') } }}
          vertexShader={`
            varying float vIntensity;
            void main() {
              vec3 vNormal = normalize(normalMatrix * normal);
              vec3 viewDir = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
              vIntensity = pow(0.7 - dot(vNormal, -viewDir), 3.4);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying float vIntensity;
            uniform vec3 uColor;
            void main() {
              gl_FragColor = vec4(uColor, clamp(vIntensity, 0.0, 1.0) * 0.5);
            }
          `}
        />
      </mesh>
    </group>
  );
}

function Stars({ count, reducedMotion }) {
  const pointsRef = useRef();
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Distribute on a large sphere shell around the camera.
      const r = 9 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current && !reducedMotion) {
      pointsRef.current.rotation.y += delta * 0.005;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        color="#cfe0ff"
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

export default function EarthScene({ quality = 'high', reducedMotion = false }) {
  const isLow = quality === 'low';
  const starCount = isLow ? 350 : 1100;

  return (
    <Canvas
      dpr={isLow ? 1 : [1, 1.8]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: !isLow, alpha: true, powerPreference: 'high-performance' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 3, 5]} intensity={1.35} color="#eaf3ff" />
      <directionalLight position={[-5, -2, -3]} intensity={0.4} color="#8b5cf6" />
      <Planet reducedMotion={reducedMotion} />
      <Stars count={starCount} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
