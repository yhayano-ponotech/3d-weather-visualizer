import * as THREE from 'three';
import { WindData } from '@/types/weather';
import { latLongToVector3 } from '@/utils/coordinates/coordinateUtils';

export const createParticleSystem = (windData: WindData[]): THREE.Points => {
  const GLOBE_RADIUS = 100;
  const particleCount = windData.length;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  windData.forEach((data, i) => {
    const vector = latLongToVector3(data.latitude, data.longitude, GLOBE_RADIUS + 0.1);
    const idx = i * 3;
    
    positions[idx] = vector.x;
    positions[idx + 1] = vector.y;
    positions[idx + 2] = vector.z;

    // 風速に基づいて色を設定
    const color = new THREE.Color();
    const normalizedSpeed = Math.min(data.speed / 100, 1);
    color.setHSL(0.3 - (normalizedSpeed * 0.3), 0.8, 0.5);
    colors[idx] = color.r;
    colors[idx + 1] = color.g;
    colors[idx + 2] = color.b;

    // 風速に基づいてサイズを設定
    sizes[i] = Math.max(1, Math.min(data.speed / 20, 3));
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true
  });

  return new THREE.Points(geometry, material);
};