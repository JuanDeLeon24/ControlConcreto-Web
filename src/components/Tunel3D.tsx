import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { tunnelInfo } from '../data/emrData';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Play, Pause, Eye, EyeOff, Layers } from 'lucide-react';

// ============================================================
// TUNNEL GEOMETRY - Herradura section with over-excavation
// ============================================================
function createTunnelSection(semiAncho: number, alturaMuro: number, flecha: number, segments: number = 24) {
  const points: THREE.Vector2[] = [];
  
  // Left wall
  points.push(new THREE.Vector2(-semiAncho, 0));
  points.push(new THREE.Vector2(-semiAncho, alturaMuro));
  
  // Vault (arch)
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI - (i / segments) * Math.PI;
    const x = Math.cos(angle) * semiAncho;
    const y = alturaMuro + Math.sin(angle) * flecha;
    points.push(new THREE.Vector2(x, y));
  }
  
  // Right wall
  points.push(new THREE.Vector2(semiAncho, 0));
  
  return points;
}

// Generate full tunnel with over-excavation variation
function generateTunnelGeometry() {
  const { semiAncho, alturaMuro, flecha } = tunnelInfo;
  const tunnelLength = tunnelInfo.longitudTotal;
  const numRings = 120;
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i < numRings; i++) {
    const t = i / (numRings - 1);
    const z = t * tunnelLength;
    
    // Over-excavation: wider at crown, narrower at walls
    const overExcavation = 0.3 + Math.sin(t * Math.PI * 8) * 0.15;
    const currentSemiAncho = semiAncho + overExcavation;
    const currentFlecha = flecha + overExcavation * 0.5;
    
    const section = createTunnelSection(currentSemiAncho, alturaMuro, currentFlecha, 24);
    
    for (let j = 0; j < section.length; j++) {
      const point = section[j];
      vertices.push(point.x, point.y, z);
      normals.push(0, 0, 1);
      uvs.push(j / section.length, t * 60);
    }
  }

  const ringSize = createTunnelSection(semiAncho, alturaMuro, flecha, 24).length;
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

  return { vertices, indices, normals, uvs, ringSize, numRings };
}

// ============================================================
// COMPONENTES 3D
// ============================================================

// Viga Base - ambos lados (HD y HI) dentro del túnel
function VigaBases() {
  const geometry = useMemo(() => {
    // I-beam shape
    const shape = new THREE.Shape();
    const w = 1.0;
    const h = 0.6;
    const t = 0.12;
    
    shape.moveTo(-w/2, 0);
    shape.lineTo(-w/2, h);
    shape.lineTo(-t/2, h);
    shape.lineTo(-t/2, 0);
    shape.lineTo(t/2, 0);
    shape.lineTo(t/2, h);
    shape.lineTo(w/2, h);
    shape.lineTo(w/2, 0);
    shape.lineTo(-w/2, 0);
    
    const extrudeSettings = {
      steps: 1,
      depth: tunnelInfo.longitudTotal,
      bevelEnabled: false
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group>
      {/* Viga Base Derecho (HD) */}
      <mesh geometry={geometry} position={[tunnelInfo.semiAncho - 0.6, 0.1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#43A047" metalness={0.4} roughness={0.6} emissive="#1B5E20" emissiveIntensity={0.2} />
      </mesh>
      {/* Viga Base Izquierdo (HI) */}
      <mesh geometry={geometry} position={[-tunnelInfo.semiAncho + 0.6, 0.1, 0]} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#43A047" metalness={0.4} roughness={0.6} emissive="#1B5E20" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

// Geomembrana - capa impermeable
function Geomembrana() {
  const { vertices, indices, normals, uvs } = useMemo(() => generateTunnelGeometry(), []);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices, normals, uvs]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial 
        color="#2196F3" 
        metalness={0.1} 
        roughness={0.3}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
        emissive="#0D47A1"
        emissiveIntensity={0.15}
      />
    </mesh>
  );
}

// Revestimiento - módulos completados
function Revestimiento() {
  const modulosRevestidos = tunnelInfo.modulosRevestidos;
  const longitudModulo = tunnelInfo.longitudTotal / tunnelInfo.modulosTotales;
  
  return (
    <group>
      {Array.from({ length: modulosRevestidos }).map((_, i) => {
        const z = i * longitudModulo + longitudModulo / 2;
        
        return (
          <group key={i}>
            {/* Ring de revestimiento */}
            <mesh position={[0, 0, z]} castShadow>
              <torusGeometry args={[tunnelInfo.semiAncho - 0.3, 0.25, 8, 32]} />
              <meshStandardMaterial color="#FF8F00" metalness={0.3} roughness={0.5} emissive="#E65100" emissiveIntensity={0.2} />
            </mesh>
            {/* Cuerpo del módulo */}
            <mesh position={[0, tunnelInfo.alturaMuro * 0.5, z]} castShadow>
              <cylinderGeometry args={[tunnelInfo.semiAncho - 0.3, tunnelInfo.semiAncho - 0.3, longitudModulo, 24, 1, true]} />
              <meshStandardMaterial 
                color="#FF9800" 
                metalness={0.2} 
                roughness={0.6}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Etiqueta del módulo */}
            <Html position={[tunnelInfo.semiAncho + 2, tunnelInfo.alturaMuro, z]} center>
              <div className="bg-acento text-fondo px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                M{i + 1}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// Cajas de Inspección y Drenaje
function CajasInspeccion() {
  const cajas = [];
  const numCajas = 12;
  
  for (let i = 0; i < numCajas; i++) {
    const z = (i / (numCajas - 1)) * tunnelInfo.longitudTotal;
    const side = i % 2 === 0 ? 1 : -1;
    const x = side * (tunnelInfo.semiAncho - 1.2);
    
    cajas.push(
      <group key={i} position={[x, 0, z]}>
        {/* Caja principal */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color="#9C27B0" metalness={0.3} roughness={0.5} emissive="#4A148C" emissiveIntensity={0.3} />
        </mesh>
        {/* Tapa */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.9, 0.1, 0.9]} />
          <meshStandardMaterial color="#7B1FA2" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Indicador luminoso */}
        <pointLight position={[0, 1.5, 0]} intensity={0.5} color="#9C27B0" distance={5} />
      </group>
    );
  }
  
  return <group>{cajas}</group>;
}

// MH - Módulos Húmedos / Pozos de drenaje
function ModulosHumedos() {
  const mhs = [];
  const numMH = 15;
  
  for (let i = 0; i < numMH; i++) {
    const z = (i / (numMH - 1)) * tunnelInfo.longitudTotal + 10;
    
    mhs.push(
      <group key={i} position={[0, 0, z]}>
        {/* Estructura del MH */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.6, 3, 16]} />
          <meshStandardMaterial color="#00BCD4" metalness={0.3} roughness={0.5} emissive="#006064" emissiveIntensity={0.3} transparent opacity={0.8} />
        </mesh>
        {/* Tapa superior */}
        <mesh position={[0, 3.1, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.7, 0.15, 16]} />
          <meshStandardMaterial color="#0097A7" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Etiqueta */}
        <Html position={[0, 4, 0]} center>
          <div className="bg-primario text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
            MH-{i + 1}
          </div>
        </Html>
        {/* Luz indicadora */}
        <pointLight position={[0, 3.5, 0]} intensity={0.8} color="#00BCD4" distance={8} />
      </group>
    );
  }
  
  return <group>{mhs}</group>;
}

// EMR Markers con datos reales
function EMRMarkers() {
  const emrData = [
    { pos: [tunnelInfo.semiAncho + 1.5, tunnelInfo.alturaMuro + tunnelInfo.flecha * 0.5, 40], label: "EMR #39", value: "394.6mm", color: "#E53935" },
    { pos: [tunnelInfo.semiAncho + 1.5, tunnelInfo.alturaMuro + tunnelInfo.flecha * 0.5, 100], label: "EMR #44", value: "315.9mm", color: "#FF9800" },
    { pos: [tunnelInfo.semiAncho + 1.5, tunnelInfo.alturaMuro + tunnelInfo.flecha * 0.5, 160], label: "EMR #53", value: "0mm", color: "#4CAF50" },
    { pos: [tunnelInfo.semiAncho + 1.5, tunnelInfo.alturaMuro + tunnelInfo.flecha * 0.5, 220], label: "EMR #60", value: "25.3mm", color: "#4CAF50" },
    { pos: [tunnelInfo.semiAncho + 1.5, tunnelInfo.alturaMuro + tunnelInfo.flecha * 0.5, 280], label: "EMR #63", value: "21.0mm", color: "#4CAF50" },
  ];

  return (
    <group>
      {emrData.map((emr, i) => (
        <group key={i} position={emr.pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color={emr.color} emissive={emr.color} emissiveIntensity={0.6} />
          </mesh>
          <Html center>
            <div className="bg-superficie border border-borde px-3 py-2 rounded-lg text-center min-w-[100px]">
              <p className="text-xs font-bold text-texto">{emr.label}</p>
              <p className="text-sm font-bold" style={{ color: emr.color }}>{emr.value}</p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// Cámara de recorrido mejorada
function CameraTour({ isPlaying }: { isPlaying: boolean }) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!isPlaying) return;
    
    timeRef.current += delta * 0.15;
    const t = timeRef.current;
    
    // Recorrido suave a través del túnel
    const z = ((t * 5) % tunnelInfo.longitudTotal);
    const angle = Math.sin(t * 0.5) * 0.3;
    const height = tunnelInfo.alturaMuro + 2 + Math.sin(t * 0.8) * 1.5;
    
    camera.position.set(
      Math.sin(angle) * 3,
      height,
      z
    );
    camera.lookAt(
      0,
      tunnelInfo.alturaMuro * 0.5,
      z + 15
    );
  });
  
  return null;
}

// ============================================================
// ESCENA PRINCIPAL
// ============================================================
function TunnelScene({ showVigaBase, showGeomembrana, showRevestimiento, showCajas, showMH, showEMR, isTourPlaying, selectedModule, onSelectModule }: {
  showVigaBase: boolean;
  showGeomembrana: boolean;
  showRevestimiento: boolean;
  showCajas: boolean;
  showMH: boolean;
  showEMR: boolean;
  isTourPlaying: boolean;
  selectedModule: number | null;
  onSelectModule: (mod: number | null) => void;
}) {
  const { vertices, indices, normals, uvs } = useMemo(() => generateTunnelGeometry(), []);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [vertices, indices, normals, uvs]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[25, 20, 40]} fov={55} />
      <CameraTour isPlaying={isTourPlaying} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={250}
        minDistance={3}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, tunnelInfo.alturaMuro, tunnelInfo.longitudTotal / 2]}
      />
      
      {/* Lighting mejorada */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 80, 50]} intensity={1.2} castShadow />
      <directionalLight position={[-40, 60, -40]} intensity={0.6} />
      
      {/* Luces a lo largo del túnel */}
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight 
          key={i} 
          position={[0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 3, (i / 7) * tunnelInfo.longitudTotal]} 
          intensity={1.5} 
          color="#FFA726" 
          distance={30} 
        />
      ))}
      
      {/* Environment */}
      <Environment preset="warehouse" />
      
      {/* Grid */}
      <Grid 
        position={[0, -0.05, tunnelInfo.longitudTotal / 2]}
        args={[120, tunnelInfo.longitudTotal + 100]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#1E3A5F"
        sectionSize={20}
        sectionThickness={1}
        sectionColor="#2F6FB5"
        fadeDistance={200}
        infiniteGrid={false}
      />
      
      {/* Estructura del túnel (roca) */}
      <mesh geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial 
          color="#3E2723" 
          metalness={0.05} 
          roughness={0.95}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Capas activas */}
      {showGeomembrana && <Geomembrana />}
      {showVigaBase && <VigaBases />}
      {showRevestimiento && <Revestimiento />}
      {showCajas && <CajasInspeccion />}
      {showMH && <ModulosHumedos />}
      {showEMR && <EMRMarkers />}
      
      {/* Marcadores de abscisa */}
      {Array.from({ length: 12 }).map((_, i) => {
        const z = (i / 11) * tunnelInfo.longitudTotal;
        return (
          <group key={i} position={[0, 0, z]}>
            <mesh position={[0, -0.3, 0]}>
              <boxGeometry args={[0.15, 0.6, 0.15]} />
              <meshStandardMaterial color="#607D8B" />
            </mesh>
            <Text
              position={[0, -1, 0]}
              fontSize={0.6}
              color="#90A4AE"
              anchorX="center"
            >
              K{(tunnelInfo.abscisaInicio + (i / 11) * tunnelInfo.longitudTotal / 1000).toFixed(3)}
            </Text>
          </group>
        );
      })}
      
      {/* Módulos seleccionables */}
      {Array.from({ length: tunnelInfo.modulosTotales }).map((_, i) => {
        const z = (i / tunnelInfo.modulosTotales) * tunnelInfo.longitudTotal;
        const isRevestido = i < tunnelInfo.modulosRevestidos;
        const isSelected = selectedModule === i;
        
        return (
          <mesh 
            key={i} 
            position={[0, tunnelInfo.alturaMuro * 0.5, z]} 
            onClick={(e) => {
              e.stopPropagation();
              onSelectModule(isSelected ? null : i);
            }}
          >
            <boxGeometry args={[tunnelInfo.semiAncho * 2, tunnelInfo.alturaMuro + tunnelInfo.flecha, 1.5]} />
            <meshStandardMaterial 
              color={isSelected ? "#FF8F00" : isRevestido ? "#4CAF50" : "#37474F"}
              transparent
              opacity={isSelected ? 0.6 : 0.15}
              emissive={isSelected ? "#FF8F00" : isRevestido ? "#4CAF50" : "#000000"}
              emissiveIntensity={isSelected ? 0.5 : 0.1}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export function Tunel3D() {
  const [showVigaBase, setShowVigaBase] = useState(true);
  const [showGeomembrana, setShowGeomembrana] = useState(true);
  const [showRevestimiento, setShowRevestimiento] = useState(true);
  const [showCajas, setShowCajas] = useState(true);
  const [showMH, setShowMH] = useState(true);
  const [showEMR, setShowEMR] = useState(true);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);

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
        <div className="relative h-[500px] md:h-[600px] lg:h-[700px] bg-fondo">
          <Canvas shadows>
            <TunnelScene 
              showVigaBase={showVigaBase}
              showGeomembrana={showGeomembrana}
              showRevestimiento={showRevestimiento}
              showCajas={showCajas}
              showMH={showMH}
              showEMR={showEMR}
              isTourPlaying={isTourPlaying}
              selectedModule={selectedModule}
              onSelectModule={setSelectedModule}
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
                Capas
              </button>
            </div>
          </div>
          
          {/* Layer controls */}
          {showControls && (
            <div className="absolute bottom-4 left-4 right-4 md:right-auto md:max-w-sm bg-superficie/95 backdrop-blur-sm rounded-xl border border-borde p-4 pointer-events-auto">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Capas del Modelo
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'viga', label: 'Viga Base', color: '#43A047', active: showVigaBase, toggle: () => setShowVigaBase(!showVigaBase), pct: '100%' },
                  { key: 'geo', label: 'Geomembrana', color: '#2196F3', active: showGeomembrana, toggle: () => setShowGeomembrana(!showGeomembrana), pct: '75%' },
                  { key: 'rev', label: 'Revestimiento', color: '#FF8F00', active: showRevestimiento, toggle: () => setShowRevestimiento(!showRevestimiento), pct: '5.2%' },
                  { key: 'cajas', label: 'Cajas Insp.', color: '#9C27B0', active: showCajas, toggle: () => setShowCajas(!showCajas), pct: '100%' },
                  { key: 'mh', label: 'MH Drenaje', color: '#00BCD4', active: showMH, toggle: () => setShowMH(!showMH), pct: '100%' },
                  { key: 'emr', label: 'EMR', color: '#E53935', active: showEMR, toggle: () => setShowEMR(!showEMR), pct: '25 est.' },
                ].map((layer) => (
                  <button
                    key={layer.key}
                    onClick={layer.toggle}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      layer.active 
                        ? 'border-primario bg-primario/10' 
                        : 'border-borde bg-superficie opacity-50'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{layer.label}</p>
                      <p className="text-xs text-texto-secundario">{layer.pct}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Info del módulo seleccionado */}
          {selectedModule !== null && (
            <div className="absolute top-4 right-4 bg-superficie/95 backdrop-blur-sm rounded-xl border border-borde p-4 pointer-events-auto max-w-xs">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">Módulo {selectedModule + 1}</h3>
                <button onClick={() => setSelectedModule(null)} className="text-texto-secundario hover:text-texto">
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-texto-secundario">Estado</span>
                  <Badge variant={selectedModule < tunnelInfo.modulosRevestidos ? 'success' : 'default'} size="sm">
                    {selectedModule < tunnelInfo.modulosRevestidos ? 'Revestido' : 'En excavación'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-texto-secundario">Viga Base</span>
                  <Badge variant="success" size="sm">100%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-texto-secundario">Revestimiento</span>
                  <Badge variant={selectedModule < tunnelInfo.modulosRevestidos ? 'success' : 'danger'} size="sm">
                    {selectedModule < tunnelInfo.modulosRevestidos ? '100%' : '0%'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-texto-secundario">Abscisa</span>
                  <span className="font-medium">
                    K{(tunnelInfo.abscisaInicio + (selectedModule / tunnelInfo.modulosTotales) * tunnelInfo.longitudTotal / 1000).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Geometría" subtitle="Sección herradura">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-texto-secundario">Semi-ancho</span>
              <span className="font-medium">{tunnelInfo.semiAncho}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texto-secundario">Altura muros</span>
              <span className="font-medium">{tunnelInfo.alturaMuro}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texto-secundario">Flecha</span>
              <span className="font-medium">{tunnelInfo.flecha}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-texto-secundario">Longitud</span>
              <span className="font-medium">{tunnelInfo.longitudTotal}m</span>
            </div>
          </div>
        </Card>
        
        <Card title="Viga Base" subtitle="Ambos lados">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario text-sm">Progreso</span>
              <Badge variant="success">100%</Badge>
            </div>
            <div className="text-sm text-texto-secundario">137 módulos × 2 lados (HD + HI)</div>
            <div className="text-sm text-texto-secundario">Concreto: 3,400 m³</div>
          </div>
        </Card>
        
        <Card title="Revestimiento" subtitle="7 módulos">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario text-sm">Progreso</span>
              <Badge variant="warning">5.2%</Badge>
            </div>
            <div className="text-sm text-texto-secundario">Módulos 1-7 completados</div>
            <div className="text-sm text-texto-secundario">Concreto: 1,250 m³</div>
          </div>
        </Card>
        
        <Card title="Infraestructura" subtitle="Cajas y MH">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario text-sm">Cajas inspección</span>
              <Badge variant="success">100%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-texto-secundario text-sm">MH drenaje</span>
              <Badge variant="success">100%</Badge>
            </div>
            <div className="text-sm text-texto-secundario">12 cajas + 15 MH instalados</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
