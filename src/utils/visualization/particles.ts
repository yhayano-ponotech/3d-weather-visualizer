import * as THREE from 'three';
import { WindData } from '@/types/weather';

export const createParticleSystem = (windData: WindData[]): THREE.Points => {
  const particles = new Float32Array(windData.length * 3);
  const colors = new Float32Array(windData.length * 3);
  const sizes = new Float32Array(windData.length);

  windData.forEach((data, i) => {
    const idx = i * 3;
    particles[idx] = data.longitude;
    particles[idx + 1] = data.latitude;
    particles[idx + 2] = 0;

    // Color based on wind speed
    const color = new THREE.Color();
    color.setHSL(0.6, 1.0, Math.min(data.speed / 100, 1));
    colors[idx] = color.r;
    colors[idx + 1] = color.g;
    colors[idx + 2] = color.b;

    sizes[i] = Math.max(2, Math.min(data.speed / 5, 10));
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 1,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.6,
  });

  return new THREE.Points(geometry, material);
};