import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LineGridShaderMaterial = {
  uniforms: {
    uMouse: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: `
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec2 uMouse;
    varying vec3 vWorldPosition;

    void main() {
      // 1. Grid Line Spacing and Width Settings
      float gridSize = 0.5;
      vec2 st = vWorldPosition.xz / gridSize;
      vec2 tileCoord = fract(st);

      float lineWidth = 0.08;
      
      // Calculate sharp line masks for X and Z grid lines
      float lineX = step(tileCoord.x, lineWidth) + step(1.0 - lineWidth, tileCoord.x);
      float lineZ = step(tileCoord.y, lineWidth) + step(1.0 - lineWidth, tileCoord.y);
      float isGridLine = clamp(lineX + lineZ, 0.0, 1.0);

      if (isGridLine < 0.1) {
        discard;
      }

      float red = clamp((uMouse.x + 1.0) * 0.5, 0.1, 1.0);
      float blue = clamp((uMouse.y + 1.0) * 0.5, 0.1, 1.0);
      float green = clamp((red + blue) * 0.35, 0.05, 0.7);

      vec3 lineColor = vec3(red, green, blue);

      float distFromCenter = length(vWorldPosition.xz);
      float alphaFade = smoothstep(14.0, 1.0, distFromCenter);

      gl_FragColor = vec4(lineColor, alphaFade);
    }
  `
};

export const ColorGrid=()=> {
  const materialRef = useRef();
  const mousePosRef = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const handlePointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      mousePosRef.current.set(x, y);
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uMouse.value.lerp(
      mousePosRef.current,
      delta * 8
    );
  });

  return (
    <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 30, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        args={[LineGridShaderMaterial]}
        transparent={true}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}