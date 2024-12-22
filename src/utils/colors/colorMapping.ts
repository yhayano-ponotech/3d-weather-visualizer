import * as THREE from 'three';

export const mapTemperatureToColor = (temperature: number): THREE.Color => {
  // Temperature range from -50°C to 50°C
  const normalizedTemp = (temperature + 50) / 100;
  
  // Create a color gradient from blue (cold) to red (hot)
  const color = new THREE.Color();
  if (temperature < 0) {
    // Blue to white gradient for below freezing
    color.setHSL(0.6, 1.0, 0.5 + normalizedTemp);
  } else {
    // White to red gradient for above freezing
    color.setHSL(0.0, normalizedTemp, 0.5);
  }
  
  return color;
};

export const mapPrecipitationToColor = (precipitation: number): THREE.Color => {
  // Precipitation range from 0 to 100mm/h
  const normalizedPrecip = Math.min(precipitation / 100, 1);
  
  // Create a color gradient from transparent to blue
  const color = new THREE.Color();
  color.setHSL(0.6, normalizedPrecip, 0.5);
  
  return color;
};

export const mapWindSpeedToColor = (speed: number): THREE.Color => {
  // Wind speed range from 0 to 100 km/h
  const normalizedSpeed = Math.min(speed / 100, 1);
  
  // Create a color gradient from green (calm) to yellow (strong)
  const color = new THREE.Color();
  color.setHSL(0.3 - (normalizedSpeed * 0.3), 1.0, 0.5);
  
  return color;
};