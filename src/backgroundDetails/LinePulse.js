import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VerticalSineShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;

    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Calculate angle along the ring in radians (-PI to +PI)
      float angle = atan(pos.y, pos.x);

      // Primary large sine wave (5 deep peaks around the ring)
      float primarySine = sin(angle * 5.0 + uTime * 2.5);
      
      // Secondary accent wave for fluid shape variation
      float secondarySine = sin(angle * 10.0 - uTime * 1.8) * 0.35;

      // DISPLACE LOCAL Z:
      // Since the mesh is rotated [-PI/2, 0, 0], local Z translates directly 
      // to 3D World Y (Up / Down vertical motion)
      pos.z += (primarySine + secondarySine) * 3.5;

      vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;

    void main() {
      // Core pure white color
      vec3 coreWhite = vec3(1.0, 1.0, 1.0);

      // High-intensity emissive brightness boost
      float brightness = 3.5;

      // Soft opacity falloff along ring tube width
      float alpha = sin(vUv.y * 3.14159);

      gl_FragColor = vec4(coreWhite * brightness, alpha * 0.95);
    }
  `
};

export const LinePulse=()=> {
  const materialRef = useRef();

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
  });

  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* High-segment ring geometry for smooth 3D curves */}
      <ringGeometry args={[15.0, 18.5, 320, 12]} />
      <shaderMaterial
        ref={materialRef}
        args={[VerticalSineShaderMaterial]}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}