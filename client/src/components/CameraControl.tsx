// solar-system-explorer/client/src/components/CameraControl.tsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from 'three';

interface CameraControlProps {
  targetIndex: number;
  planetPositions: [number, number, number][];
  planetActualSizes: Vector3[];
  enabled?: boolean; 
}

const CameraControl: React.FC<CameraControlProps> = ({ targetIndex, planetPositions, planetActualSizes, enabled = true }) => {
  const currentTarget = useRef(new THREE.Vector3());

  useEffect(() => {
    if (planetPositions[targetIndex]) {
      currentTarget.current.set(
        planetPositions[targetIndex][0],
        planetPositions[targetIndex][1],
        planetPositions[targetIndex][2]
      );
    }
  }, [targetIndex, planetPositions]);

  useFrame((state) => {
    if (!enabled) return; 

    if (!planetActualSizes[targetIndex]) {
      return;
    }

    const currentActualSize = planetActualSizes[targetIndex];
    const maxDimension = Math.max(currentActualSize.x, currentActualSize.y, currentActualSize.z);

    const adaptiveOffsetZ = Math.max(8.0, maxDimension * 2.5);

    const targetCameraPosition = new THREE.Vector3(
      currentTarget.current.x,
      currentTarget.current.y,
      currentTarget.current.z + adaptiveOffsetZ
    );

    state.camera.position.lerp(targetCameraPosition, 0.05);
    state.camera.lookAt(currentTarget.current);
    state.camera.updateProjectionMatrix();
  });

  return null;
};

export default CameraControl;