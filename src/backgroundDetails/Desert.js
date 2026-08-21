import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const LowPolyTexturedDesertShader = {
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: null },
    uTileScale: { value: 8.0 }, 
    uValleyColor: { value: new THREE.Color('#c24d23') },
    uDuneColor: { value: new THREE.Color('#d48b46') },
    uCrestColor: { value: new THREE.Color('#f4cc84') },
  },
  vertexShader: `
    uniform float uTime;
    varying float vHeight;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Layered sine waves simulating slow shifting sand dunes
      float wave1 = sin(pos.x * 0.12 + uTime * 0.3) * cos(pos.y * 0.12 + uTime * 0.2) * 1.8;
      float wave2 = sin(pos.x * 0.25 - uTime * 0.2) * 0.8;
      float wave3 = cos(pos.y * 0.2 + uTime * 0.3) * 0.6;

      float totalHeight = wave1 + wave2 + wave3;
      pos.z += totalHeight;

      vHeight = totalHeight;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uTileScale;
    uniform vec3 uValleyColor;
    uniform vec3 uDuneColor;
    uniform vec3 uCrestColor;
    varying float vHeight;
    varying vec2 vUv;

    void main() {
      // 1. Sample texture at higher tiling scale
      vec4 texColor = texture2D(uTexture, vUv * uTileScale);

      // 2. Convert image to luminance (grayscale detail map) to neutralize baked-in color bands
      float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      
      // Soften contrast so baked shadows don't create hard lines (remaps 0.0-1.0 to 0.7-1.1)
      float grainDetail = mix(0.7, 1.1, luminance);

      // 3. Height-based gradient (valley -> dune -> crest)
      float valleyFactor = smoothstep(-2.0, 0.0, vHeight);
      float crestFactor = smoothstep(0.0, 2.2, vHeight);

      vec3 baseColor = mix(uValleyColor, uDuneColor, valleyFactor);
      vec3 heightColor = mix(baseColor, uCrestColor, crestFactor);

      // 4. Apply texture grain as a subtle surface detail multiplier over 3D geometry
      vec3 finalColor = heightColor * grainDetail;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

export const Desert=({
  width = 120,
  depth = 120,
  segments = 48,
  position = [0, -4, 0],
  tileScale = 8.0,
  textureUrl = 'https://raw.githubusercontent.com/shoshanimayan/shoshanimayan.github.io/master/_images/0040-desert-sand-texture-seamless-hr.jpg'
}) =>{
  const materialRef = useRef();

  const textureMap = useTexture(textureUrl);

  useMemo(() => {
    if (textureMap) {
      textureMap.wrapS = THREE.RepeatWrapping;
      textureMap.wrapT = THREE.RepeatWrapping;
      textureMap.minFilter = THREE.LinearMipmapLinearFilter;
      textureMap.magFilter = THREE.LinearFilter;
      textureMap.needsUpdate = true;
    }
  }, [textureMap]);

  const desertMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(LowPolyTexturedDesertShader.uniforms),
      vertexShader: LowPolyTexturedDesertShader.vertexShader,
      fragmentShader: LowPolyTexturedDesertShader.fragmentShader,
      flatShading: true,
      side: THREE.DoubleSide
    });

    mat.uniforms.uTexture.value = textureMap;
    mat.uniforms.uTileScale.value = tileScale;
    return mat;
  }, [textureMap, tileScale]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth, segments, segments]} />
      <primitive ref={materialRef} object={desertMaterial} attach="material" />
    </mesh>
  );
}