import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Text, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { tunnelInfo } from '../data/emrData';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Play, Pause, Eye, EyeOff, Layers, ChevronDown, MapPin, Box } from 'lucide-react';

// Formato de abscisa: K06+420.00
function formatPk(metros: number): string {
  const km = Math.floor(metros / 1000);
  const m = metros % 1000;
  return `K${km.toString().padStart(2, '0')}+${m.toFixed(2).padStart(5, '0')}`;
}

// ============================================================
// GEOMETRÍA DEL TÚNEL - Sección herradura con sobre-excavación
// ============================================================
function createTunnelSection(semiAncho: number, alturaMuro: number, flecha: number, segments: number = 24) {
  const points: THREE.Vector2[] = [];
  points.push(new THREE.Vector2(-semiAncho, 0));
  points.push(new THREE.Vector2(-semiAncho, alturaMuro));
  for (let i = 0; i <= segments; i++) {
    const angle = Math.PI - (i / segments) * Math.PI;
    const x = Math.cos(angle) * semiAncho;
    const y = alturaMuro + Math.sin(angle) * flecha;
    points.push(new THREE.Vector2(x, y));
  }
  points.push(new THREE.Vector2(semiAncho, 0));
  return points;
}

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
    const overExcavation = 0.2 + Math.sin(t * Math.PI * 8) * 0.1;
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
// VIGA BASE - Ambos lados (HD + HI), dentro del túnel, longitud completa
// ============================================================
function VigaBases({ onSelectModule, selectedModule }: { onSelectModule: (mod: number) => void; selectedModule: number | null }) {
  const modulos = [];
  const longitudModulo = tunnelInfo.longitudTotal / tunnelInfo.modulosTotales;
  const { semiAncho } = tunnelInfo;

  for (let i = 0; i < tunnelInfo.modulosTotales; i++) {
    const z = i * longitudModulo + longitudModulo / 2;
    const isSelected = selectedModule === i;
    const ladoHD = semiAncho - 0.8;  // Derecho (dentro del túnel)
    const ladoHI = -semiAncho + 0.8; // Izquierdo (dentro del túnel)

    modulos.push(
      <group key={i}>
        {/* Viga HD (derecho) */}
        <mesh 
          position={[ladoHD, 0.35, z]} 
          castShadow 
          receiveShadow
          onClick={(e) => { e.stopPropagation(); onSelectModule(i); }}
        >
          <boxGeometry args={[0.5, 0.7, longitudModulo - 0.05]} />
          <meshStandardMaterial 
            color={isSelected ? "#66BB6A" : "#43A047"} 
            metalness={0.3} 
            roughness={0.6}
            emissive={isSelected ? "#2E7D32" : "#1B5E20"}
            emissiveIntensity={isSelected ? 0.4 : 0.1}
          />
        </mesh>
        {/* Viga HI (izquierdo) */}
        <mesh 
          position={[ladoHI, 0.35, z]} 
          castShadow 
          receiveShadow
          onClick={(e) => { e.stopPropagation(); onSelectModule(i); }}
        >
          <boxGeometry args={[0.5, 0.7, longitudModulo - 0.05]} />
          <meshStandardMaterial 
            color={isSelected ? "#66BB6A" : "#43A047"} 
            metalness={0.3} 
            roughness={0.6}
            emissive={isSelected ? "#2E7D32" : "#1B5E20"}
            emissiveIntensity={isSelected ? 0.4 : 0.1}
          />
        </mesh>
      </group>
    );
  }
  return <group>{modulos}</group>;
}

// ============================================================
// GEOMEMBRANA - Capa impermeable
// ============================================================
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
        color="#1976D2" 
        metalness={0.1} 
        roughness={0.3}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        emissive="#0D47A1"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// ============================================================
// REVESTIMIENTO - Módulos 1-7 completados
// ============================================================
function Revestimiento({ selectedModule }: { selectedModule: number | null }) {
  const modulosRevestidos = tunnelInfo.modulosRevestidos;
  const longitudModulo = tunnelInfo.longitudTotal / tunnelInfo.modulosTotales;
  const { semiAncho, alturaMuro, flecha } = tunnelInfo;

  return (
    <group>
      {Array.from({ length: modulosRevestidos }).map((_, i) => {
        const z = i * longitudModulo + longitudModulo / 2;
        const isSelected = selectedModule === i;
        return (
          <group key={i}>
            <mesh position={[0, alturaMuro * 0.5 + flecha * 0.3, z]} castShadow>
              <torusGeometry args={[semiAncho - 0.25, 0.2, 8, 32]} />
              <meshStandardMaterial 
                color={isSelected ? "#FFB74D" : "#FF8F00"} 
                metalness={0.3} 
                roughness={0.5} 
                emissive={isSelected ? "#E65100" : "#BF360C"}
                emissiveIntensity={isSelected ? 0.4 : 0.15}
              />
            </mesh>
            <mesh position={[0, alturaMuro * 0.5, z]} castShadow>
              <cylinderGeometry args={[semiAncho - 0.25, semiAncho - 0.25, longitudModulo - 0.05, 24, 1, true]} />
              <meshStandardMaterial 
                color="#FF9800" 
                metalness={0.2} 
                roughness={0.6}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            <Html position={[semiAncho + 2, alturaMuro + flecha * 0.5, z]} center>
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

// ============================================================
// LOZA DE PAVIMENTO - Base para pavimento rígido
// ============================================================
function LozaPavimento() {
  const { semiAncho } = tunnelInfo;
  return (
    <mesh position={[0, 0.05, tunnelInfo.longitudTotal / 2]} receiveShadow>
      <boxGeometry args={[semiAncho * 2 - 1, 0.15, tunnelInfo.longitudTotal]} />
      <meshStandardMaterial color="#78909C" metalness={0.2} roughness={0.8} transparent opacity={0.6} />
    </mesh>
  );
}

// ============================================================
// CAJAS MH + COLECTOR - Sistema de drenaje
// ============================================================
function SistemaDrenaje() {
  const { semiAncho, longitudTotal } = tunnelInfo;
  const cajas = [];
  const numCajas = 15;
  const lado = semiAncho - 1.0;

  // Cajas MH a lo largo del túnel
  for (let i = 0; i < numCajas; i++) {
    const z = (i / (numCajas - 1)) * longitudTotal;
    cajas.push(
      <group key={`mh-${i}`} position={[lado, 0, z]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.7, 0.8, 0.7]} />
          <meshStandardMaterial color="#00BCD4" metalness={0.3} roughness={0.5} emissive="#006064" emissiveIntensity={0.3} />
        </mesh>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#0097A7" metalness={0.4} roughness={0.4} />
        </mesh>
        <pointLight position={[0, 1.2, 0]} intensity={0.4} color="#00BCD4" distance={4} />
      </group>
    );
  }

  // Colector principal (tubería que conecta todas las cajas)
  const puntosColector = [];
  for (let i = 0; i < numCajas; i++) {
    const z = (i / (numCajas - 1)) * longitudTotal;
    puntosColector.push(new THREE.Vector3(lado, 0.6, z));
  }
  const curve = new THREE.CatmullRomCurve3(puntosColector);
  const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);

  return (
    <group>
      {cajas}
      {/* Colector - 100% instalado */}
      <mesh geometry={tubeGeometry} castShadow>
        <meshStandardMaterial color="#7E57C2" metalness={0.4} roughness={0.4} emissive="#4527A0" emissiveIntensity={0.2} />
      </mesh>
      
      {/* Caja A1 - Entrada del túnel */}
      <group position={[lado, 0, -2]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#D32F2F" metalness={0.4} roughness={0.4} emissive="#B71C1C" emissiveIntensity={0.4} />
        </mesh>
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-peligro text-white px-2 py-1 rounded text-xs font-bold">A1</div>
        </Html>
        <pointLight position={[0, 2, 0]} intensity={0.8} color="#D32F2F" distance={6} />
      </group>

      {/* Caja A2 - Salida del túnel */}
      <group position={[lado, 0, longitudTotal + 2]}>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#D32F2F" metalness={0.4} roughness={0.4} emissive="#B71C1C" emissiveIntensity={0.4} />
        </mesh>
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-peligro text-white px-2 py-1 rounded text-xs font-bold">A2</div>
        </Html>
        <pointLight position={[0, 2, 0]} intensity={0.8} color="#D32F2F" distance={6} />
      </group>
    </group>
  );
}

// ============================================================
// EMR MARKERS
// ============================================================
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
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color={emr.color} emissive={emr.color} emissiveIntensity={0.5} />
          </mesh>
          <Html center>
            <div className="bg-superficie border border-borde px-2 py-1 rounded text-center min-w-[80px]">
              <p className="text-[10px] font-bold text-texto">{emr.label}</p>
              <p className="text-xs font-bold" style={{ color: emr.color }}>{emr.value}</p>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
}

// ============================================================
// CÁMARA DE RECORRIDO
// ============================================================
function CameraTour({ isPlaying }: { isPlaying: boolean }) {
  const { camera } = useThree();
  const timeRef = useRef(0);
  
  useFrame((_, delta) => {
    if (!isPlaying) return;
    timeRef.current += delta * 0.12;
    const t = timeRef.current;
    const z = ((t * 4) % tunnelInfo.longitudTotal);
    const angle = Math.sin(t * 0.4) * 0.25;
    const height = tunnelInfo.alturaMuro + 1.5 + Math.sin(t * 0.6) * 1;
    
    camera.position.set(Math.sin(angle) * 3, height, z);
    camera.lookAt(0, tunnelInfo.alturaMuro * 0.5, z + 15);
  });
  return null;
}

// Cámara que se mueve al módulo seleccionado
function CameraToModule({ moduleIndex }: { moduleIndex: number | null }) {
  const { camera } = useThree();
  const longitudModulo = tunnelInfo.longitudTotal / tunnelInfo.modulosTotales;
  
  useFrame(() => {
    if (moduleIndex === null) return;
    const targetZ = moduleIndex * longitudModulo + longitudModulo / 2;
    const targetPos = new THREE.Vector3(18, 12, targetZ + 5);
    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(0, tunnelInfo.alturaMuro, targetZ);
  });
  return null;
}

// ============================================================
// ESCENA PRINCIPAL
// ============================================================
function TunnelScene({ showVigaBase, showGeomembrana, showRevestimiento, showLoza, showDrenaje, showEMR, isTourPlaying, selectedModule, onSelectModule }: {
  showVigaBase: boolean;
  showGeomembrana: boolean;
  showRevestimiento: boolean;
  showLoza: boolean;
  showDrenaje: boolean;
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
      <CameraToModule moduleIndex={selectedModule} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxDistance={250}
        minDistance={3}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, tunnelInfo.alturaMuro, tunnelInfo.longitudTotal / 2]}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 80, 50]} intensity={1.2} castShadow />
      <directionalLight position={[-40, 60, -40]} intensity={0.6} />
      
      {Array.from({ length: 8 }).map((_, i) => (
        <pointLight 
          key={i} 
          position={[0, tunnelInfo.alturaMuro + tunnelInfo.flecha + 3, (i / 7) * tunnelInfo.longitudTotal]} 
          intensity={1.5} 
          color="#FFA726" 
          distance={30} 
        />
      ))}
      
      <Environment preset="warehouse" />
      
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
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {showGeomembrana && <Geomembrana />}
      {showVigaBase && <VigaBases onSelectModule={onSelectModule} selectedModule={selectedModule} />}
      {showRevestimiento && <Revestimiento selectedModule={selectedModule} />}
      {showLoza && <LozaPavimento />}
      {showDrenaje && <SistemaDrenaje />}
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
            <Text position={[0, -1, 0]} fontSize={0.6} color="#90A4AE" anchorX="center">
              {formatPk(tunnelInfo.abscisaInicio + (i / 11) * tunnelInfo.longitudTotal)}
            </Text>
          </group>
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
  const [showLoza, setShowLoza] = useState(true);
  const [showDrenaje, setShowDrenaje] = useState(true);
  const [showEMR, setShowEMR] = useState(true);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const longitudModulo = tunnelInfo.longitudTotal / tunnelInfo.modulosTotales;

  const moduloSeleccionado = selectedModule !== null ? {
    numero: selectedModule + 1,
    pkInicio: tunnelInfo.abscisaInicio + selectedModule * longitudModulo,
    pkFin: tunnelInfo.abscisaInicio + (selectedModule + 1) * longitudModulo,
    esRevestido: selectedModule < tunnelInfo.modulosRevestidos,
    vigaBase: true,
    geomembrana: selectedModule < Math.floor(tunnelInfo.modulosTotales * tunnelInfo.avanceGeomembrana / 100),
    revestimiento: selectedModule < tunnelInfo.modulosRevestidos,
    loza: true,
  } : null;

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
              showLoza={showLoza}
              showDrenaje={showDrenaje}
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
                  isTourPlaying ? 'bg-peligro text-white' : 'bg-acento text-fondo hover:bg-acento/90'
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
          
          {/* Dropdown de módulos - Esquina superior derecha */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-superficie/95 backdrop-blur-sm border border-borde text-texto rounded-lg hover:bg-borde transition-colors"
              >
                <Box className="w-4 h-4" />
                <span className="text-sm">{selectedModule !== null ? `Módulo ${selectedModule + 1}` : 'Seleccionar módulo'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-superficie border border-borde rounded-xl shadow-2xl z-50">
                  <div className="p-3 border-b border-borde sticky top-0 bg-superficie">
                    <input
                      type="text"
                      placeholder="Buscar por módulo o abscisa..."
                      className="w-full px-3 py-2 bg-fondo border border-borde rounded-lg text-texto text-sm placeholder-texto-secundario focus:outline-none focus:border-acento"
                    />
                  </div>
                  <div className="p-2">
                    {Array.from({ length: tunnelInfo.modulosTotales }).map((_, i) => {
                      const pk = tunnelInfo.abscisaInicio + i * longitudModulo;
                      const isRevestido = i < tunnelInfo.modulosRevestidos;
                      return (
                        <button
                          key={i}
                          onClick={() => { setSelectedModule(i); setDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedModule === i ? 'bg-acento/20 border border-acento' : 'hover:bg-borde'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isRevestido ? 'bg-exito' : 'bg-texto-secundario'}`} />
                            <span className="text-sm font-medium">M{i + 1}</span>
                          </div>
                          <span className="text-xs text-texto-secundario">{formatPk(pk)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
                  { label: 'Viga Base', color: '#43A047', active: showVigaBase, toggle: () => setShowVigaBase(!showVigaBase), pct: '100%' },
                  { label: 'Geomembrana', color: '#1976D2', active: showGeomembrana, toggle: () => setShowGeomembrana(!showGeomembrana), pct: '75%' },
                  { label: 'Revestimiento', color: '#FF8F00', active: showRevestimiento, toggle: () => setShowRevestimiento(!showRevestimiento), pct: '5.2%' },
                  { label: 'Loza Pavim.', color: '#78909C', active: showLoza, toggle: () => setShowLoza(!showLoza), pct: '100%' },
                  { label: 'Colector', color: '#7E57C2', active: showDrenaje, toggle: () => setShowDrenaje(!showDrenaje), pct: '100%' },
                  { label: 'EMR', color: '#E53935', active: showEMR, toggle: () => setShowEMR(!showEMR), pct: '25 est.' },
                ].map((layer) => (
                  <button
                    key={layer.label}
                    onClick={layer.toggle}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${
                      layer.active ? 'border-primario bg-primario/10' : 'border-borde bg-superficie opacity-50'
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
          {moduloSeleccionado && (
            <div className="absolute top-16 right-4 bg-superficie/95 backdrop-blur-sm rounded-xl border border-borde p-4 pointer-events-auto max-w-xs">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  Módulo {moduloSeleccionado.numero}
                </h3>
                <button onClick={() => setSelectedModule(null)} className="text-texto-secundario hover:text-texto">
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-texto-secundario flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Abscisa
                  </span>
                  <span className="font-medium text-xs">
                    {formatPk(moduloSeleccionado.pkInicio)} - {formatPk(moduloSeleccionado.pkFin)}
                  </span>
                </div>
                <div className="border-t border-borde pt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-texto-secundario">Viga Base</span>
                    <Badge variant="success" size="sm">✓ 100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-texto-secundario">Geomembrana</span>
                    <Badge variant={moduloSeleccionado.geomembrana ? 'success' : 'danger'} size="sm">
                      {moduloSeleccionado.geomembrana ? '✓ Instalada' : '✗ Pendiente'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-texto-secundario">Revestimiento</span>
                    <Badge variant={moduloSeleccionado.revestimiento ? 'success' : 'danger'} size="sm">
                      {moduloSeleccionado.revestimiento ? '✓ 100%' : '✗ 0%'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-texto-secundario">Loza Pavimento</span>
                    <Badge variant="success" size="sm">✓ 100%</Badge>
                  </div>
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
            <div className="flex justify-between"><span className="text-texto-secundario">Semi-ancho</span><span className="font-medium">{tunnelInfo.semiAncho}m</span></div>
            <div className="flex justify-between"><span className="text-texto-secundario">Altura muros</span><span className="font-medium">{tunnelInfo.alturaMuro}m</span></div>
            <div className="flex justify-between"><span className="text-texto-secundario">Flecha</span><span className="font-medium">{tunnelInfo.flecha}m</span></div>
            <div className="flex justify-between"><span className="text-texto-secundario">Longitud</span><span className="font-medium">{tunnelInfo.longitudTotal}m</span></div>
          </div>
        </Card>
        <Card title="Viga Base" subtitle="137 módulos × 2 lados">
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-texto-secundario text-sm">Progreso</span><Badge variant="success">100%</Badge></div>
            <div className="text-sm text-texto-secundario">HD + HI completados</div>
            <div className="text-sm text-texto-secundario">Concreto: 3,400 m³</div>
          </div>
        </Card>
        <Card title="Sistema Drenaje" subtitle="Colector + 15 cajas">
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-texto-secundario text-sm">Colector</span><Badge variant="success">100%</Badge></div>
            <div className="flex items-center justify-between"><span className="text-texto-secundario text-sm">Cajas MH</span><Badge variant="success">100%</Badge></div>
            <div className="flex items-center justify-between"><span className="text-texto-secundario text-sm">Cajas A1/A2</span><Badge variant="success">100%</Badge></div>
          </div>
        </Card>
        <Card title="Revestimiento" subtitle="7 módulos">
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-texto-secundario text-sm">Progreso</span><Badge variant="warning">5.2%</Badge></div>
            <div className="text-sm text-texto-secundario">Módulos 1-7 completados</div>
            <div className="text-sm text-texto-secundario">Concreto: 1,250 m³</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
