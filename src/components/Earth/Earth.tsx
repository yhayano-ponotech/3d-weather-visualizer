import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useWeatherData } from '@/hooks/useWeatherData';
import { createParticleSystem } from '@/utils/visualization/particles';
import { 
  mapTemperatureToColor, 
  mapPrecipitationToColor,
} from '@/utils/colors/colorMapping';
import { WeatherData } from '@/types/weather';

interface EarthProps {
  width: number;
  height: number;
  displayMode: 'temperature' | 'precipitation' | 'wind' | 'composite';
  refreshTrigger: number;
}

const Earth: React.FC<EarthProps> = ({ width, height, displayMode, refreshTrigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const texturesRef = useRef<{
    earth?: THREE.Texture;
    topology?: THREE.Texture;
    clouds?: THREE.Texture;
  }>({});
  
  const { weatherData, isLoading, error, refetch } = useWeatherData();

  // Preload textures once
  const loadTextures = useCallback(async () => {
    if (Object.keys(texturesRef.current).length > 0) return;

    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (url: string) => {
      return new Promise<THREE.Texture>((resolve, reject) => {
        textureLoader.load(
          url,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });
    };

    try {
      const [earth, topology, clouds] = await Promise.all([
        loadTexture('/textures/earth-blue-marble.jpg'),
        loadTexture('/textures/earth-topology.png'),
        loadTexture('/textures/clouds.png'),
      ]);

      texturesRef.current = { earth, topology, clouds };
    } catch (error) {
      console.error('Error loading textures:', error);
    }
  }, []);

  // Effect for handling refresh
  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Initialize Three.js scene
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!containerRef.current) return;

      // Load textures first
      await loadTextures();
      if (!mounted) return;

      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 200;
      camera.position.y = 50;
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      rendererRef.current = renderer;

      // Clear container and add renderer
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(renderer.domElement);

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      const pointLight = new THREE.PointLight(0xffffff, 1.0);
      pointLight.position.set(-10, -10, -10);
      scene.add(pointLight);

      // Globe setup
      const globe = new ThreeGlobe({
        animateIn: false,
        waitForGlobeReady: true
      });

      if (texturesRef.current.earth && texturesRef.current.topology && texturesRef.current.clouds) {
        globe.globeMaterial(new THREE.MeshPhongMaterial({
          map: texturesRef.current.earth,
          bumpMap: texturesRef.current.topology,
          bumpScale: 10,
          shininess: 0.5
        }));

        // Add clouds layer
        const cloudsMesh = new THREE.Mesh(
          new THREE.SphereGeometry(100.5, 64, 64),
          new THREE.MeshPhongMaterial({
            map: texturesRef.current.clouds,
            transparent: true,
            opacity: 0.4
          })
        );
        globe.add(cloudsMesh);
      }

      globe.atmosphereColor('#1B66C9');
      globe.atmosphereAltitude(0.25);

      globeRef.current = globe;
      scene.add(globe);

      // Controls setup
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 150;
      controls.maxDistance = 400;
      controls.enablePan = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controlsRef.current = controls;

      // Animation loop
      const animate = () => {
        if (!mounted) return;
        
        requestRef.current = requestAnimationFrame(animate);
        if (globeRef.current) {
          globeRef.current.rotation.y += 0.001;
          // Rotate clouds
          const cloudsMesh = globeRef.current.children.find(
            child => child instanceof THREE.Mesh && child.material.transparent
          );
          if (cloudsMesh) {
            cloudsMesh.rotation.y += 0.0005;
          }
        }
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    };

    init();

    return () => {
      mounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      
      // Don't dispose of textures as they'll be reused
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      controlsRef.current?.dispose();
      rendererRef.current?.dispose();
      
      // Clear references
      globeRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, [width, height, loadTextures]);

  // Update visualization based on weather data
  useEffect(() => {
    if (!globeRef.current || !weatherData || isLoading) return;

    console.log('Updating visualization with weather data:', weatherData);

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
  }, [weatherData, displayMode, isLoading]);

  const updateTemperatureVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    const points = data.map(point => ({
      lat: point.latitude,
      lng: point.longitude,
      size: 0.5,
      color: mapTemperatureToColor(point.temperature).getHexString(),
      altitude: 0.01
    }));
  
    globeRef.current
      .hexPolygonsData([])
      .pointsData(points)
      .pointColor('color')
      .pointAltitude('altitude')
      .pointRadius('size')
      .pointsMerge(true)
      .pointResolution(2);
  };
  
  const updatePrecipitationVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    const points = data
      .filter(point => point.precipitation > 0)
      .map(point => {
        const intensity = Math.min(point.precipitation / 100, 1);
        return {
          lat: point.latitude,
          lng: point.longitude,
          size: Math.max(0.2, intensity * 2),
          color: mapPrecipitationToColor(point.precipitation).getHexString(),
          altitude: 0.01
        };
      });
  
    globeRef.current
      .hexPolygonsData([])
      .pointsData(points)
      .pointColor('color')
      .pointAltitude('altitude')
      .pointRadius('size')
      .pointsMerge(true)
      .pointResolution(2);
  };
  
  const updateWindVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    const existingParticles = globeRef.current.children.find(
      (child: THREE.Object3D) => child.type === 'Points'
    );
    if (existingParticles) {
      globeRef.current.remove(existingParticles);
    }
  
    const filteredWindData = data
      .filter(point => point.windSpeed > 5)
      .map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
        speed: point.windSpeed,
        direction: point.windDirection
      }));
  
    const particleSystem = createParticleSystem(filteredWindData);
    globeRef.current.add(particleSystem);
  
    globeRef.current
      .hexPolygonsData([])
      .pointsData([]);
  };
  
  const updateCompositeVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;
  
    // Temperature visualization
    const temperaturePoints = data.map(point => ({
      lat: point.latitude,
      lng: point.longitude,
      size: 0.4,
      color: mapTemperatureToColor(point.temperature).getHexString(),
      altitude: 0.01
    }));
  
    // Precipitation visualization
    const precipitationPoints = data
      .filter(point => point.precipitation > 0)
      .map(point => ({
        lat: point.latitude,
        lng: point.longitude,
        size: Math.max(0.2, point.precipitation / 50),
        color: mapPrecipitationToColor(point.precipitation).getHexString(),
        altitude: 0.02
      }));
  
    // Wind visualization
    const filteredWindData = data
      .filter(point => point.windSpeed > 5)
      .map(point => ({
        latitude: point.latitude,
        longitude: point.longitude,
        speed: point.windSpeed,
        direction: point.windDirection
      }));
  
    // Clear existing particles
    const existingParticles = globeRef.current.children.find(
      (child: THREE.Object3D) => child.type === 'Points'
    );
    if (existingParticles) {
      globeRef.current.remove(existingParticles);
    }
  
    // Apply all visualizations
    globeRef.current
      .hexPolygonsData([])
      .pointsData([...temperaturePoints, ...precipitationPoints])
      .pointColor('color')
      .pointAltitude('altitude')
      .pointRadius('size')
      .pointsMerge(true)
      .pointResolution(2);
  
    // Add wind particle system
    const particleSystem = createParticleSystem(filteredWindData);
    globeRef.current.add(particleSystem);
  };
  
  if (error) {
    return <div className="text-white p-4">Error loading weather data: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      style={{ width, height }}
      className="relative"
    />
  );
};

export default Earth;