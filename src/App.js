import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

function createCustomCylinder(params) {
  const {
    radiusTop = 1,
    radiusBottom = 1,
    height = 1,
    radialSegments = 32,
    heightSegments = 1,
    openEnded = false,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
    ellipticity = 1,
    obliqueness = 0,
    twist = 0
  } = params;

  const geometry = new THREE.CylinderGeometry(
    1, 1, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength
  );

  const positionAttribute = geometry.attributes.position;

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);

    const heightFraction = (y + height / 2) / height;
    const radius = heightFraction >= 0.5 ? radiusTop : radiusBottom;
    const scaledX = x * radius * (1 / ellipticity);
    const scaledZ = z * radius * ellipticity;

    const twistAngle = twist * heightFraction;
    const twistedX = scaledX * Math.cos(twistAngle) - scaledZ * Math.sin(twistAngle);
    const twistedZ = scaledX * Math.sin(twistAngle) + scaledZ * Math.cos(twistAngle);

    const obliqueX = twistedX + obliqueness * heightFraction;

    positionAttribute.setXYZ(i, obliqueX, y, twistedZ);
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

function CustomCylinder(props) {
  const geometry = useMemo(() => createCustomCylinder(props), [props]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial 
        color="royalblue" 
        wireframe={props.wireframe} 
        roughness={0.5} 
        metalness={0.5}
      />
    </mesh>
  );
}

function Scene({ children }) {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight
        position={[5, 5, 5]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.4} />
      </mesh>
      {children}
    </>
  );
}

function App() {
  const [params, setParams] = useState({
    height: 2,
    ellipticity: 1,
    obliqueness: 0,
    wireframe: false
  });

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="App">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%)', height: '90vh' }}
      >
        <Scene>
          <CustomCylinder {...params} />
        </Scene>
        <OrbitControls 
          enableZoom={true} 
          enablePan={true} 
          maxPolarAngle={Math.PI / 2} 
          minPolarAngle={0} 
        />
      </Canvas>
      <div style={{ margin: '20px' }}>
        {Object.entries(params).map(([key, value]) => (
          key !== 'wireframe' && (
            <label key={key}>
              {key}:
              <input
                type="range"
                min={key.includes('Segments') ? '3' : '0'}
                max={key.includes('Segments') ? '64' : '5'}
                step={key.includes('Segments') ? '1' : '0.1'}
                value={value}
                onChange={(e) => updateParam(key, parseFloat(e.target.value))}
              />
              {value.toFixed(2)}
            </label>
          )
        ))}
        <label>
          Wireframe:
          <input
            type="checkbox"
            checked={params.wireframe}
            onChange={(e) => updateParam('wireframe', e.target.checked)}
          />
        </label>
      </div>
    </div>
  );
}

export default App;