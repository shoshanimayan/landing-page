import React, { useRef, useEffect , useState} from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { SectionEnum } from './App';
import { ColorGrid } from './backgroundDetails/ColorGrid';
import { LinePulse } from './backgroundDetails/LinePulse';
import { MatrixVisual } from './backgroundDetails/MatrixVisual';
import { Desert } from './backgroundDetails/Desert';
import { LavaLamp } from './backgroundDetails/LavaLamp';

const InnerImage = ({ url }) => {
  const texture = useTexture(url);
  return (
    <mesh position={[0, 0, 0]} renderOrder={1}>
      <planeGeometry args={[0.75, 0.75]} />
      <meshBasicMaterial 
        map={texture} 
        transparent={true} 
        side={THREE.DoubleSide} 
        depthWrite={false}
      />
    </mesh>
  );
};

export default function Scene({ imageUrl, sectionType }) {
  const groupRef = useRef();
  const { size } = useThree();
  const [backgroundEffect, setBackgroundEffect]= useState(<React.Fragment></React.Fragment>)

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.scale.set(0, 0, 0);
    }
  }, [imageUrl]);

  useEffect(()=>{
    switch(sectionType){
      case SectionEnum.INTRO:
        setBackgroundEffect(<Desert/>)
        break;
      case SectionEnum.XR:
        setBackgroundEffect(<MatrixVisual/>)

        break;
      case SectionEnum.WEB:
        setBackgroundEffect(<LinePulse/>)

        break;
      case SectionEnum.GAMES:
        setBackgroundEffect(<LavaLamp/>)


        break;
      case SectionEnum.MOBILE:
        setBackgroundEffect(<ColorGrid/>)

        break;
      default:
        setBackgroundEffect(<React.Fragment></React.Fragment>)
    }
  },[sectionType])

  const isMobile = size.width <= 768;
  const targetScale = isMobile ? 0.85 : 1.0;


  useFrame((state, delta) => {
    if (groupRef.current) {
      const speed = delta * 6; 
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, speed);
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScale, speed);
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScale, speed);
    }
  });

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />

      <group ref={groupRef}>
        
        {imageUrl && (
          <React.Suspense fallback={null}>
            <InnerImage url={imageUrl} />
          </React.Suspense>
        )}

        <mesh position={[0, 0, 0]} renderOrder={2}>
          <boxGeometry args={[1.25, 1.25, 1.25]} />
          <meshStandardMaterial
            color="#cfe2f3"
            transparent={true}
            opacity={0.25}
            roughness={0.1}
            metalness={0.1}
            depthWrite={true}
          />
        </mesh>

      </group>

      {backgroundEffect}

      <OrbitControls enableZoom={false} />
    </>
  );
}