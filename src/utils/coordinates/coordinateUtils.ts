import * as THREE from 'three';

export const latLongToVector3 = (
  latitude: number,
  longitude: number,
  radius: number
): THREE.Vector3 => {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
};

export const vector3ToLatLong = (
  vector: THREE.Vector3
): { latitude: number; longitude: number } => {
  const radius = vector.length();
  const phi = Math.acos(vector.y / radius);
  const theta = Math.atan2(vector.z, -vector.x);

  const latitude = 90 - (phi * 180) / Math.PI;
  const longitude = (theta * 180) / Math.PI - 180;

  return { latitude, longitude };
};

export const calculateGreatCircleDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};