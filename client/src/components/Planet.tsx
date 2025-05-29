import React, { useRef, useEffect, useMemo, forwardRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber'; 
import { Mesh, Box3, Vector3 } from 'three';


interface PlanetProps {
  modelPath: string;
  position: [number, number, number];
  scale?: number;
  onClick?: () => void;
  onLoad?: (size: Vector3) => void;
  visible?: boolean;
}


const Planet = forwardRef<Mesh, PlanetProps>(({ modelPath, position, scale = 1, onClick, onLoad, visible = true }, ref) => {
  const { scene } = useGLTF(modelPath);
  const meshRef = useRef<Mesh>(null!); 

  React.useImperativeHandle(ref, () => meshRef.current!, [meshRef.current]);

  const stableClonedScene = useMemo(() => {
    const s = scene.clone();
    const boundingBox = new Box3().setFromObject(s);
    const center = new Vector3();
    boundingBox.getCenter(center);
    s.position.sub(center);

    const size = new Vector3();
    boundingBox.getSize(size);
    const maxOriginalDim = Math.max(size.x, size.y, size.z);

    if (maxOriginalDim > 0) {
      const normalizationFactor = 1 / maxOriginalDim;
      s.scale.set(normalizationFactor, normalizationFactor, normalizationFactor);
    }
    return s;
  }, [scene]);

  useEffect(() => {
    if (stableClonedScene && onLoad) {
      const finalBoundingBox = new Box3().setFromObject(stableClonedScene);
      const finalSize = new Vector3();
      finalBoundingBox.getSize(finalSize);
      finalSize.multiplyScalar(scale);
      onLoad(finalSize);
    }
  }, [stableClonedScene, onLoad, scale]);

  // Rotasi Otomatis Model
  useFrame(() => {
    if (meshRef.current && visible) { 
      meshRef.current.rotation.y += 0.002;
    }
  });

  return (
    <mesh
      position={position}
      scale={[scale, scale, scale]}
      ref={meshRef} 
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
      visible={visible}
    >
      <primitive object={stableClonedScene} />
    </mesh>
  );
});

export default Planet;