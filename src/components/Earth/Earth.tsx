import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useWeatherData } from '@/hooks/useWeatherData';
import { createParticleSystem } from '@/utils/visualization/particles';
import { latLongToVector3 } from '@/utils/coordinates/coordinateUtils';
import { 
  mapTemperatureToColor, 
  mapPrecipitationToColor,
} from '@/utils/colors/colorMapping';
import { WeatherData } from '@/types/weather';

interface EarthProps {
  width: number;
  height: number;
  displayMode: 'temperature' | 'precipitation' | 'wind' | 'composite';
}

const Earth: React.FC<EarthProps> = ({ width, height, displayMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe>(null);
  const { weatherData, isLoading, error } = useWeatherData();

  const updateTemperatureVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    const points = data.map(point => {
      const position = latLongToVector3(point.latitude, point.longitude, 100);
      const color = mapTemperatureToColor(point.temperature);
      
      return {
        position,
        color: color.getHex(),
        radius: 0.5,
        height: 0.1
      };
    });
  
    globeRef.current
      .hexPolygonsData([])
      .pointsData(points)
      .pointColor('color')
      .pointRadius('radius')
      .pointAltitude('height')
      .pointsMerge(true);
  };
  
  const updatePrecipitationVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    const points = data.map(point => {
      const position = latLongToVector3(point.latitude, point.longitude, 100);
      const color = mapPrecipitationToColor(point.precipitation);
      const radius = Math.min(2, point.precipitation / 10 + 0.5); // Scale radius based on precipitation
  
      return {
        position,
        color: color.getHex(),
        radius,
        height: radius * 0.2
      };
    });
  
    globeRef.current
      .hexPolygonsData([])
      .pointsData(points)
      .pointColor('color')
      .pointRadius('radius')
      .pointAltitude('height')
      .pointsMerge(true);
  };
  
  const updateWindVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    // Remove existing particle systems
    const existingParticles = globeRef.current.children.find(
      child => child.type === 'Points'
    );
    if (existingParticles) {
      globeRef.current.remove(existingParticles);
    }
  
    // Create new particle system for wind visualization
    const windData = data.map(d => ({
      latitude: d.latitude,
      longitude: d.longitude,
      speed: d.windSpeed,
      direction: d.windDirection
    }));
  
    const particleSystem = createParticleSystem(windData);
    globeRef.current.add(particleSystem);
  
    // Clear other visualizations
    globeRef.current
      .hexPolygonsData([])
      .pointsData([]);
  };
  
  const updateCompositeVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    // Create temperature points
    const temperaturePoints = data.map(point => {
      const position = latLongToVector3(point.latitude, point.longitude, 100);
      const color = mapTemperatureToColor(point.temperature);
      
      return {
        position,
        color: color.getHex(),
        radius: 0.5,
        height: 0.1
      };
    });
  
    // Create precipitation overlay
    const precipitationPoints = data
      .filter(point => point.precipitation > 0)
      .map(point => {
        const position = latLongToVector3(point.latitude, point.longitude, 101); // Slightly above temperature layer
        const color = mapPrecipitationToColor(point.precipitation);
        
        return {
          position,
          color: color.getHex(),
          radius: Math.min(1.5, point.precipitation / 10 + 0.3),
          height: 0.05
        };
      });
  
    // Add wind particles
    const windData = data.map(d => ({
      latitude: d.latitude,
      longitude: d.longitude,
      speed: d.windSpeed,
      direction: d.windDirection
    }));
  
    const particleSystem = createParticleSystem(windData);
  
    // Remove existing particle systems
    const existingParticles = globeRef.current.children.find(
      child => child.type === 'Points'
    );
    if (existingParticles) {
      globeRef.current.remove(existingParticles);
    }
  
    // Apply all visualizations
    globeRef.current
      .pointsData([...temperaturePoints, ...precipitationPoints])
      .pointColor('color')
      .pointRadius('radius')
      .pointAltitude('height')
      .pointsMerge(true);
  
    globeRef.current.add(particleSystem);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // Initialize Globe
    const globe = new ThreeGlobe()
      .globeImageUrl('/assets/earth-texture.jpg')
      .bumpImageUrl('/assets/earth-topology.jpg')
      .globeMaterial(new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
      }))
      .atmosphereColor('#1B66C9')
      .atmosphereAltitude(0.1);

    globeRef.current = globe;
    scene.add(globe);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Setup camera position
    camera.position.z = 250;

    // Add controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 150;
    controls.maxDistance = 400;

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      globe.rotation.y += 0.001;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.remove(globe);
      renderer.dispose();
    };
  }, [width, height]);

  // Update visualization based on weather data
  useEffect(() => {
    if (!globeRef.current || !weatherData) return;

    switch (displayMode) {
      case 'temperature':
        updateTemperatureVisualization(weatherData);
        break;
      case 'precipitation':
        updatePrecipitationVisualization(weatherData);
        break;
      case 'wind':
        updateWindVisualization(weatherData);
        break;
      case 'composite':
        updateCompositeVisualization(weatherData);
        break;
    }
  }, [weatherData, displayMode]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading weather data</div>;

  return <div ref={containerRef} />;
};

export default Earth;