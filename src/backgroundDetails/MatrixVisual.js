import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const MatrixVisual=({
  radius = 35,
  height = 50,
  speed = 1.0 
})=> {
  const textureRef = useRef();

  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 4096;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    return { canvas, ctx, texture };
  }, []);

  const dropsRef = useRef([]);
  const columns = 64; 
  const fontPixelSize = 32; 
  const lineSpacing = fontPixelSize + 10;
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ';

  const getControlledSpeed = () => (1 + Math.random() * 0.6)*5; // Stays between 0.8 and 1.4 always!

  useEffect(() => {
    const drops = [];
    const colWidth = canvas.width / columns;

    for (let i = 0; i < columns; i++) {
      const charCount = 15 + Math.floor(Math.random() * 12);
      const strandChars = [];
      for (let c = 0; c < charCount; c++) {
        strandChars.push(characters[Math.floor(Math.random() * characters.length)]);
      }

      drops[i] = {
        x: i * colWidth + colWidth / 2,
        y: Math.random() * -canvas.height,
        speed: getControlledSpeed(), 
        chars: strandChars,
        length: charCount
      };
    }
    dropsRef.current = drops;
  }, [canvas]);

  useFrame((state, delta) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = `bold ${fontPixelSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const deltaMultiplier = delta * 60;

    dropsRef.current.forEach((drop) => {
      if (Math.random() < 0.03) {
        const randomIndex = Math.floor(Math.random() * drop.length);
        drop.chars[randomIndex] = characters[Math.floor(Math.random() * characters.length)];
      }

      for (let j = 0; j < drop.length; j++) {
        const charY = drop.y - (j * lineSpacing);
        if (charY < -lineSpacing || charY > canvas.height) continue;

        const char = drop.chars[j];

        if (j === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
        } else if (j < 3) {
          ctx.fillStyle = '#66ffaa';
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 8;
        } else {
          const opacity = Math.max(0, 1 - (j / drop.length));
          ctx.fillStyle = `rgba(0, 230, 80, ${opacity * 0.85})`;
          ctx.shadowColor = '#00ff66';
          ctx.shadowBlur = 4;
        }

        ctx.fillText(char, drop.x, charY);
      }

      drop.y += drop.speed * speed * deltaMultiplier;

      if (drop.y - (drop.length * lineSpacing) > canvas.height) {
        drop.y = -Math.random() * 200;
        drop.speed = getControlledSpeed(); // Keep speed consistent on loop!
        
        for (let c = 0; c < drop.length; c++) {
          drop.chars[c] = characters[Math.floor(Math.random() * characters.length)];
        }
      }
    });

    texture.needsUpdate = true;
  });

  return (
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[radius, radius, height, 64, 1, true]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}