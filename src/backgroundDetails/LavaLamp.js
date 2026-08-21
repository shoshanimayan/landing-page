import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const BUBBLE_COUNT = 20;

export const LavaLamp=({ centerRadius = 2.5 })=> {
  const groupRef = useRef();
  const { camera, viewport, pointer, raycaster } = useThree();

  const bubbles = useMemo(() => {
    return Array.from({ length: BUBBLE_COUNT }, (_, i) => {
      const angle = (i / BUBBLE_COUNT) * Math.PI * 2 + Math.random() * 0.5;
      return {
        baseScale: 0.35 + Math.random() * 0.3,
        speed: 0.4 + Math.random() * 0.5,
        angle,
        radiusOffset: centerRadius + 1.2 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.5 + Math.random() * 0.7,
        progress: Math.random()
      };
    });
  }, [centerRadius]);

  const interactionPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const pointer3D = useRef(new THREE.Vector3(-999, -999, 0));

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Raycast current cursor into 3D world space
    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(interactionPlane, pointer3D.current);

    // Calculate vertical 3D height based on active viewport frustum
    const verticalHeight = viewport.height + 4.0;
    const minY = -verticalHeight / 2;
    const maxY = verticalHeight / 2;

    groupRef.current.children.forEach((mesh, idx) => {
      const b = bubbles[idx];

      b.progress += delta * 0.08 * b.speed;
      if (b.progress > 1.0) b.progress = 0.0;

      const currentY = THREE.MathUtils.lerp(minY, maxY, b.progress);
      
      const currentAngle = b.angle + Math.sin(time * 0.5 + b.phase) * 0.2;
      const r = b.radiusOffset + Math.sin(time * b.wobbleSpeed + b.phase) * 0.3;

      let currentX = Math.cos(currentAngle) * r;
      let currentZ = Math.sin(currentAngle) * r;

      const meshPos = new THREE.Vector3(currentX, currentY, currentZ);
      const dist = meshPos.distanceTo(pointer3D.current);
      const pushRadius = 2.5;

      if (dist < pushRadius) {
        const pushForce = (1.0 - dist / pushRadius) * 0.8;
        const pushDir = new THREE.Vector3().subVectors(meshPos, pointer3D.current).normalize();
        currentX += pushDir.x * pushForce;
        currentZ += pushDir.z * pushForce;
      }

      mesh.position.set(currentX, currentY, currentZ);

      let alpha = 0.85;
      if (b.progress > 0.8) {
        alpha = 0.85 * (1.0 - (b.progress - 0.8) / 0.2);
      } else if (b.progress < 0.1) {
        alpha = 0.85 * (b.progress / 0.1);
      }

      mesh.material.opacity = alpha;

      const squish = 1.0 + Math.sin(time * 2.5 + b.phase) * 0.15;
      mesh.scale.set(
        b.baseScale / squish,
        b.baseScale * squish,
        b.baseScale / squish
      );
    });
  });

  return (
    <group ref={groupRef}>
      {bubbles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color="#ff4500"
            emissive="#ff1100"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.1}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}