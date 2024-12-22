import React, { useEffect, useRef } from 'react';
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
}

const Earth: React.FC<EarthProps> = ({ width, height, displayMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ThreeGlobe | null>(null);
  const requestRef = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const { weatherData, isLoading, error } = useWeatherData();

  // Three.jsシーンの初期化
  useEffect(() => {
    if (!containerRef.current) return;

    console.log('Initializing Three.js scene...');

    // シーンのセットアップ
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // カメラのセットアップ
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 200;
    camera.position.y = 50;

    // レンダラーのセットアップ
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // コンテナのクリアと追加
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lighting setup
    console.log('Setting up lights...');
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // 強度を上げる
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // 強度を上げる
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.0); // 強度を上げる
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    // グローブの初期化
    console.log('Initializing Globe...');
    // テクスチャローダーの初期化
    const textureLoader = new THREE.TextureLoader();
    console.log('Loading textures...');
    
    const earthTexture = textureLoader.load(
      '/textures/earth-blue-marble.jpg',
      () => console.log('Earth texture loaded successfully'),
      undefined,
      (error) => console.error('Error loading earth texture:', error)
    );
    
    const topologyTexture = textureLoader.load(
      '/textures/earth-topology.png',
      () => console.log('Topology texture loaded successfully'),
      undefined,
      (error) => console.error('Error loading topology texture:', error)
    );
    
    const cloudsTexture = textureLoader.load(
      '/textures/clouds.png',
      () => console.log('Clouds texture loaded successfully'),
      undefined,
      (error) => console.error('Error loading clouds texture:', error)
    );

    // Globe initialization
    console.log('Creating Globe...');
    const globe = new ThreeGlobe({
      animateIn: false,
      waitForGlobeReady: true
    });

    // Set globe properties
    globe.globeImageUrl('/textures/earth-blue-marble.jpg');
    globe.bumpImageUrl('/textures/earth-topology.png');
    globe.atmosphereColor('#1B66C9');
    globe.atmosphereAltitude(0.25);

    // グローブのマテリアル設定
    globe.globeMaterial(new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: topologyTexture,
      bumpScale: 10,
      shininess: 0.5
    }));

    // 雲レイヤーの追加
    const cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(100.5, 64, 64), // 地球より少し大きいサイズ
      new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        transparent: true,
        opacity: 0.4
      })
    );
    globe.add(cloudsMesh);

    // 雲の回転アニメーション用の参照を保持
    const cloudsRef = cloudsMesh;

    globeRef.current = globe;
    scene.add(globe);

    // コントロールのセットアップ
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
    let frameCount = 0;
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.001;
        // 最初の数フレームだけログを出力
        if (frameCount < 5) {
          console.log('Rendering frame:', frameCount);
          frameCount++;
        }
      }
      // 雲を地球とは異なる速度で回転
      cloudsRef.rotation.y += 0.0005;
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // クリーンアップ
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [width, height]);

  // 気象データの可視化を更新
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
      altitude: 0.1
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

    const points = data.map(point => ({
      lat: point.latitude,
      lng: point.longitude,
      size: Math.max(0.5, point.precipitation / 10),
      color: mapPrecipitationToColor(point.precipitation).getHexString(),
      altitude: Math.max(0.1, point.precipitation / 50)
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

  const updateWindVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;

    // 既存のパーティクルシステムをクリア
    const existingParticles = globeRef.current.children.find(
      (child: THREE.Object3D) => child.type === 'Points'
    );
    if (existingParticles) {
      globeRef.current.remove(existingParticles);
    }

    // 風データの準備
    const windData = data.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
      speed: point.windSpeed,
      direction: point.windDirection
    }));

    // パーティクルシステムの作成と追加
    const particleSystem = createParticleSystem(windData);
    globeRef.current.add(particleSystem);

    // その他の可視化をクリア
    globeRef.current
      .hexPolygonsData([])
      .pointsData([])
      .customLayerData([]);
  };

  const updateCompositeVisualization = (data: WeatherData[]) => {
    if (!globeRef.current) return;

    // 温度の可視化
    const temperaturePoints = data.map(point => ({
      lat: point.latitude,
      lng: point.longitude,
      size: 0.5,
      color: mapTemperatureToColor(point.temperature).getHexString(),
      altitude: 0.1
    }));

    // 降水の可視化 (降水量がある場合のみ)
    const precipitationPoints = data
      .filter(point => point.precipitation > 0)
      .map(point => ({
        lat: point.latitude,
        lng: point.longitude,
        size: Math.max(0.3, point.precipitation / 15),
        color: mapPrecipitationToColor(point.precipitation).getHexString(),
        altitude: 0.15
      }));

    // 風の可視化
    const windData = data.map(point => ({
      latitude: point.latitude,
      longitude: point.longitude,
      speed: point.windSpeed,
      direction: point.windDirection
    }));

    // 既存のパーティクルシステムをクリア
    const existingParticles = globeRef.current.children.find(
      (child: THREE.Object3D) => child.type === 'Points'
    );
    if (existingParticles) {
      globeRef.current.remove(existingParticles);
    }

    // すべての可視化を適用
    globeRef.current
      .hexPolygonsData([])
      .pointsData([...temperaturePoints, ...precipitationPoints])
      .pointColor('color')
      .pointAltitude('altitude')
      .pointRadius('size')
      .pointsMerge(true)
      .pointResolution(2);

    const particleSystem = createParticleSystem(windData);
    globeRef.current.add(particleSystem);
  };

  if (error) {
    console.error('Error in Earth component:', error);
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