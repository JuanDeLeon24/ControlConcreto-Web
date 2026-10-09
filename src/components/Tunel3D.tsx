import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { tunnelInfo } from '../data/emrData';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Play, Pause, Eye, EyeOff, Layers } from 'lucide-react';

// Tunnel cross-section geometry (horseshoe shape)
function createTunnelSection(semiAncho: number, alturaMuro: number, flecha: number, segments: number = 20) {
  const points: THREE.Vector2[] = [];
  
  // Left wall (bottom to top)
  points.push(new THREE.Vector2(-semiAncho, 0));
  points.push(new THREE.Vector2(-semiAncho, alturaMuro));
  
  // Vault (arch) - semicircle
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI - (i / segments) * Math.PI;
    const x = Math.cos(angle) * semiAncho;
    const y = alturaMuro + Math.sin(angle) * flecha;
    points.push(new THREE.Vector2(x, y));
  }
  
  // Right wall (top to bottom)
  points.push(new THREE.Vector2(semiAncho, 0));
  
  return points;
}

// Generate tunnel geometry with varying sections based on EMR data
function generateTunnelGeometry() {
  const { semiAncho, alturaMuro, flecha } = tunnelInfo;
  const section = createTunnelSection(semiAncho, alturaMuro, flecha, 24);
  const sectionPoints = section.length;
  
  // Create multiple rings along the tunnel length
  const tunnelLength = tunnelInfo.longitudTotal;
  const numRings = 100;
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  
  for (let i = 0; i < numRings; i++) {
    const z = (i / (numRings - 1)) * tunnelLength;
    const t = i / (numRings - 1);
    
    // Vary section based on position (simulate geological variations)
    const variation = Math.sin(t * Math.PI * 4) * 0.1;
    const currentSemiAncho = semiAncho * (1 + variation * 0.05);
    const currentFlecha = flecha * (1 - variation * 0.03);
    
    const currentSection = createTunnelSection(currentSemiAncho, alturaMuro, currentFlecha, 24);
    
    for (let j = 0; j < currentSection.length; j++) {
      const point = currentSection[j];
      vertices.push(point.x, point.y, z);
      normals.push(0, 0, 1);
      uvs.push(j / currentSection.length, t * 50);
    }
  }
  
  // Generate faces
  const ringSize = sectionPoints;
  for (let i = 0; i < numRings - 1; i++) {
    for (let j = 0; j < ringSize - 1; j++) {
      const a = i * ringSize + j;
      const b = a + ringSize;
      const c = a + 1;
      const d = b + 1;
      
      indices.push(a, b, c);
      indices.push(c, b, d);
    }
  }
  
  // Add end caps
  const lastRingStart = (numRings - 1) * ringSize;
  for (let j = 1; j < ringSize - 1; j++) {
    indices.push(lastRingStart, lastRingStart + j, lastRingStart + j + 1);
  }
  
  return { vertices, indices, normals, uvs, ringSize, numRings };
}

// Viga Base geometry (inverted U-shape beam)
function VigaBase({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    // I-beam cross section
    const w = 1.2; // width
    const h = 0.8; // height
    const t = 0.15; // thickness
    
    shape.moveTo(-w/2, 0);
    shape.lineTo(-w/2, h*0.3);
    shape.lineTo(-t/2, h*0.3);
    shape.lineTo(-t/2, h*0.7);
    shape.lineTo(-w/2, h*0.7);
    shape.lineTo(-w/2, h);
    shape.lineTo(w/2, h);
    shape.lineTo(w/2, h*0.7);
    shape.lineTo(t/2, h*0.7);
    shape.lineTo(t/2, h*0.3);
    shape.lineTo(w/2, h*0.3);
    shape.lineTo(w/ 2, 0);
    shape.lineTo(t/2, 0);
    shape.lineTo(t/2, h*0.3);
    shape.lineTo(-t/2, h*0.3);
    shape.lineTo(-t/2, 0);
    shape.lineTo(-w/2, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: tunnelInfo.longitudTotal,
      bevelEnabled: false
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);
  
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color="#43A047" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

// Revestimiento (lining) with progress visualization
function Revestimiento({ progress }: { progress: number }) {
  const { vertices, indices, normals, uvs, numRings } = useMemo(() => generateTunnelGeometry(), []);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices, normals, uvs]);
  
  // Calculate how much of the tunnel is lined
  void Math.floor(numRings * progress);
  
  return (
    <group>
      {/* Full tunnel structure (excavated rock) */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#5D4E37" 
          metalness={0.1} 
          roughness={0.9}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Lined portion */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#FF8F00" 
          metalness={0.2} 
          roughness={0.6}
          transparent
          opacity={0.9}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Lining rings visualization */}
      {Array.from({ length: tunnelInfo.modulosRevestidos }).map((_, i) => {
        const z = (i / tunnelInfo.modulosRevestidos) * tunnelInfo.longitudTotal * progress;
        return (
          <mesh key={i} position={[0, 0, z]} castShadow>
            <torusGeometry args={[tunnelInfo.semiAncho + 0.2, 0.15, 8, 32]} />
            <meshStandardMaterial color="#FF8F00" metalness={0.3} roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

// EMR stations markers
function EMRMarkers() {
  return (
    <group>
      {[
        { pos: [0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 1, 50] as [number, number, number], label: "EMR #39", value: "394.6mm" },
        { pos: [0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 1, 100] as [number, number, number], label: "EMR #44", value: "315.9mm" },
        { pos: [0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 1, 150] as [number, number, number], label: "EMR #53", value: "0mm" },
        { pos: [0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 1, 200] as [number, number, number], label: "EMR #60", value: "25.3mm" },
      ].map((emr, i) => (
        <group key={i} position={emr.pos}>
          <mesh>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#E53935" emissive="#E53935" emissiveIntensity={0.5} />
          </mesh>
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.8}
            color="#E6EDF3"
            anchorX="center"
            anchorY="bottom"
          >
            {emr.label}
          </Text>
          <Text
            position={[0, 0.8, 0]}
            fontSize={0.6}
            color="#FF8F00"
            anchorX="center"
            anchorY="bottom"
          >
            {emr.value}
          </Text>
        </group>
      ))}
    </group>
  );
}

// Camera animation for tour mode
function CameraTour({ isPlaying }: { isPlaying: boolean }) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!isPlaying) return;
    
    timeRef.current += delta * 0.1;
    const t = timeRef.current;
    
    // Smooth camera path through the tunnel
    const z = (Math.sin(t) * 0.5 + 0.5) * tunnelInfo.longitudTotal;
    const angle = t * 2;
    const radius = 15;
    
    camera.position.set(
      Math.cos(angle) * radius,
      tunnelInfo.alturaMuro + tunnelInfo.flecha * 0.5 + Math.sin(t * 3) * 3,
      z
    );
    camera.lookAt(0, tunnelInfo.alturaMuro * 0.5, z + 10);
  });
  
  return null;
}

// Main 3D Scene
function TunnelScene({ showVigaBase, showEMR, isTourPlaying }: {
  showVigaBase: boolean;
  showRevestimiento: boolean;
  showEMR: boolean;
  isTourPlaying: boolean;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[20, 15, 30]} fov={60} />
      <CameraTour isPlaying={isTourPlaying} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={200}
        minDistance={5}
        maxPolarAngle={Math.PI * 0.9}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 50, 50]} intensity={1} castShadow />
      <directionalLight position={[-30, 30, -30]} intensity={0.5} />
      <pointLight position={[0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 5, 50]} intensity={1} color="#FF8F00" />
      <pointLight position={[0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 5, 150]} intensity={1} color="#2F6FB5" />
      
      {/* Environment */}
      <Environment preset="warehouse" />
      <Grid 
        position={[0, -0.1, tunnelInfo.longitudTotal / 2]}
        args={[100, tunnelInfo.longitudTotal + 50]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#30363D"
        sectionSize={20}
        sectionThickness={1}
        sectionColor="#484F58"
        fadeDistance={150}
        infiniteGrid={false}
      />
      
      {/* Tunnel structure */}
      <Revestimiento progress={tunnelInfo.avanceRevestimiento / 100} />
      
      {/* Viga Base */}
      {showVigaBase && (
        <VigaBase position={[-tunnelInfo.semiAncho - 0.5, 0, 0]} />
      )}
      
      {/* EMR Markers */}
      {showEMR && <EMRMarkers />}
      
      {/* Station markers along tunnel */}
      {Array.from({ length: 10 }).map((_, i) => {
        const z = (i / 9) * tunnelInfo.longitudTotal;
        return (
          <group key={i} position={[0, 0, z]}>
            <mesh position={[0, -0.5, 0]}>
              <boxGeometry args={[0.2, 1, 0.2]} />
              <meshStandardMaterial color="#8B949E" />
            </mesh>
            <Text
              position={[0, -1.5, 0]}
              fontSize={0.5}
              color="#8B949E"
              anchorX="center"
            >
              K{(tunnelInfo.abscisaInicio + (i / 9) * tunnelInfo.longitudTotal / 1000).toFixed(3)}
            </Text>
          </group>
        );
      })}
    </>
  );
}

export function Tunel3D() {
  const [showVigaBase, setShowVigaBase] = useState(true);
  const [showRevestimiento, setShowRevestimiento] = useState(true);
  const [showEMR, setShowEMR] = useState(true);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-texto">Vista 3D del Túnel</h1>
          <p className="text-texto-secundario mt-1">Visualización interactiva de la geometría y avance de obra</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">
            <Layers className="w-4 h-4 mr-1" />
            384m de longitud
          </Badge>
        </div>
      </div>

      {/* 3D Viewer */}
      <Card className="p-0 overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
          <Canvas shadows>
            <TunnelScene 
              showVigaBase={showVigaBase}
              showRevestimiento={showRevestimiento}
              showEMR={showEMR}
              isTourPlaying={isTourPlaying}
            />
          </Canvas>
          
          {/* Controls overlay */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-start justify-between gap-4 pointer-events-none">
            <div className="flex flex-wrap gap-2 pointer-events-auto">
              <button
                onClick={() => setIsTourPlaying(!isTourPlaying)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isTourPlaying 
                    ? 'bg-peligro text-white' 
                    : 'bg-acento text-fondo hover:bg-acento/90'
                }`}
              >
                {isTourPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isTourPlaying ? 'Detener' : 'Recorrido'}
              </button>
              <button
                onClick={() => setShowControls(!showControls)}
                className="flex items-center gap-2 px-4 py-2 bg-superficie text-texto rounded-lg hover:bg-borde transition-colors"
              >
                {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                Controles
              </button>
            </div>
          </div>
          
          {/* Layer controls */}
          {showControls && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto bg-superficie/95 backdrop-blur-sm rounded-xl border border-borde p-4 pointer-events-auto">
              <h3 className="font-semibold text-sm mb-3">Capas</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showVigaBase}
                    onChange={(e) => setShowVigaBase(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#43A047]"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-exito" />
                    <span className="text-sm">Viga Base (100%)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRevestimiento}
                    onChange={(e) => setShowRevestimiento(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#FF8F00]"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-acento" />
                    <span className="text-sm">Revestimiento (5.2%)</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showEMR}
                    onChange={(e) => setShowEMR(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#E53935]"
                  />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-peligro" />
                    <span className="text-sm">Estaciones EMR (25)</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Geometría del Túnel" subtitle="Sección tipo herradura">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-texto-secundario">Semi-ancho</span>
              <span className="font-medium">{tunnelInfo.semiAncho}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texto-secundario">Altura de muros</span>
              <span className="font-medium">{tunnelInfo.alturaMuro}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texto-secundario">Flecha</span>
              <span className="font-medium">{tunnelInfo.flecha}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texto-secundario">Longitud total</span>
              <span className="font-medium">{tunnelInfo.longitudTotal}m</span>
            </div>
          </div>
        </Card>
        
        <Card title="Viga Base" subtitle="Estado de avance">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario text-sm">Progreso</span>
              <Badge variant="success">100%</Badge>
            </div>
            <div className="text-sm text-texto-secundario">
              137 módulos completados en ambos lados (HD y HI)
            </div>
            <div className="text-sm text-texto-secundario">
              Concreto total: 3,400 m³
            </div>
          </div>
        </Card>
        
        <Card title="Revestimiento" subtitle="Estado actual">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario text-sm">Progreso</span>
              <Badge variant="warning">5.2%</Badge>
            </div>
            <div className="text-sm text-texto-secundario">
              7 módulos revestidos de 137 totales
            </div>
            <div className="text-sm text-texto-secundario">
              Concreto: 1,250 m³ aplicados
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
