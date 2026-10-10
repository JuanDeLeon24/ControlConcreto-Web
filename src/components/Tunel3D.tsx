import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { tunnelInfo } from '../data/emrData';
import { emrStations } from '../data/emrData';
import { StatusBadge } from './ui/Badge';
import { Card, CardHeader, CardBody } from './ui/Card';
import { Layers, MapPin, Box, EyeOff } from 'lucide-react';
import { formatPk } from '../lib/pk';

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
  const { semiAncho, alturaMuro, flecha } = tunnelInfo;

  for (let i = 0; i < tunnelInfo.modulosTotales; i++) {
    const z = i * longitudModulo + longitudModulo / 2;
    const isSelected = selectedModule === i;
    const ladoHD = semiAncho - 0.8;
    const ladoHI = -semiAncho + 0.8;

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
            emissiveIntensity={isSelected ? 0.3 : 0.1}
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
            emissiveIntensity={isSelected ? 0.3 : 0.1}
          />
        </mesh>

        {/* Indicador PK cada 10 módulos */}
        {(i + 1) % 10 === 0 && (
          <Html
            key={`pk-${i}`}
            position={[0, alturaMuro + flecha + 2, z]}
            fullscreen
            style={{ pointerEvents: 'none', transform: 'translate(-50%, -100%)' }}
          >
            <div className="text-xs font-mono bg-black/70 text-green-300 px-2 py-1 rounded border border-green-500/30">
              {formatPk(i * longitudModulo)}
            </div>
          </Html>
        )}
      </group>
    );
  }

  return <group>{modulos}</group>;
}

// ============================================================
// GEOMEMBRANA - Sobre la viga base, longitud completa
// ============================================================
function Geomembrana() {
  const { alturaMuro } = tunnelInfo;
  const { vertices, indices, normals, uvs } = generateTunnelGeometry();
  const innerVertices = vertices.slice(0);

  for (let i = 0; i < innerVertices.length / 3; i++) {
    const x = innerVertices[i * 3];
    const y = innerVertices[i * 3 + 1];
    if (y > alturaMuro * 0.3) {
      const offset = 0.15;
      const normalX = (x > 0 ? -1 : 1) * offset * 0.5;
      innerVertices[i * 3] = x + normalX;
      innerVertices[i * 3 + 1] = y + offset;
    }
  }

  return (
    <mesh>
      <bufferGeometry>
        <bufferAttribute name="position" args={[new Float32Array(innerVertices), 3]} />
        <bufferAttribute name="index" args={[new Uint32Array(indices), 1]} />
        <bufferAttribute name="normal" args={[new Float32Array(normals), 3]} />
        <bufferAttribute name="uv" args={[new Float32Array(uvs), 2]} />
      </bufferGeometry>
      <meshStandardMaterial
        color="#1976D2"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        metalness={0.1}
        roughness={0.9}
      />
    </mesh>
  );
}

// ============================================================
// REVESTIMIENTO - Progreso dinámico (solo primeros 7 módulos)
// ============================================================
function Revestimiento() {
  const tunnelLength = tunnelInfo.longitudTotal;
  const modulosRevestidos = 7;
  const longitudModulo = tunnelLength / tunnelInfo.modulosTotales;
  const zMax = modulosRevestidos * longitudModulo;

  const { vertices, normals, uvs, ringSize } = generateTunnelGeometry();
  const filteredVertices: number[] = [];
  const filteredIndices: number[] = [];
  const filteredNormals: number[] = [];
  const filteredUvs: number[] = [];
  const ringIndicesMap: Map<number, number> = new Map();

  let newIndex = 0;
  for (let i = 0; i < 60; i++) {
    const t = i / 59;
    const z = t * tunnelLength;
    if (z <= zMax + 0.01) {
      ringIndicesMap.set(i, newIndex);
      for (let j = 0; j < ringSize; j++) {
        const idx = i * ringSize + j;
        filteredVertices.push(vertices[idx * 3], vertices[idx * 3 + 1], vertices[idx * 3 + 2]);
        filteredNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
        filteredUvs.push(uvs[idx * 2], uvs[idx * 2 + 1]);
        newIndex++;
      }
    }
  }

  for (let i = 0; i < 59; i++) {
    if (ringIndicesMap.has(i) && ringIndicesMap.has(i + 1)) {
      const newRingStart = ringIndicesMap.get(i)!;
      const nextRingStart = ringIndicesMap.get(i + 1)!;
      for (let j = 0; j < ringSize - 1; j++) {
        const a = newRingStart + j;
        const b = nextRingStart + j;
        const c = newRingStart + j + 1;
        const d = nextRingStart + j + 1;
        filteredIndices.push(a, b, c);
        filteredIndices.push(c, b, d);
      }
    }
  }

  return (
    <mesh>
      <bufferGeometry>
        <bufferAttribute name="position" args={[new Float32Array(filteredVertices), 3]} />
        <bufferAttribute name="index" args={[new Uint32Array(filteredIndices), 1]} />
        <bufferAttribute name="normal" args={[new Float32Array(filteredNormals), 3]} />
        <bufferAttribute name="uv" args={[new Float32Array(filteredUvs), 2]} />
      </bufferGeometry>
      <meshStandardMaterial
        color="#FF8F00"
        metalness={0.4}
        roughness={0.5}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ============================================================
// LOZA DE PAVIMENTO - Dentro del túnel
// ============================================================
function LozaPavimento() {
  const { semiAncho } = tunnelInfo;
  const tunnelLength = tunnelInfo.longitudTotal;

  return (
    <mesh position={[0, 0.15, tunnelLength / 2]} castShadow receiveShadow>
      <boxGeometry args={[semiAncho * 2 - 1.6, 0.3, tunnelLength]} />
      <meshStandardMaterial color="#78909C" metalness={0.2} roughness={0.7} />
    </mesh>
  );
}

// ============================================================
// COLECTOR DE DRENAJE - Centro del túnel
// ============================================================
function ColectorDrenaje() {
  const tunnelLength = tunnelInfo.longitudTotal;

  return (
    <group>
      <mesh position={[0, -1.5, tunnelLength / 2]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, tunnelLength, 16]} />
        <meshStandardMaterial color="#7E57C2" metalness={0.3} roughness={0.6} />
      </mesh>
      {Array.from({ length: 15 }, (_, i) => {
        const z = (i + 1) * (tunnelLength / 16);
        return (
          <mesh key={i} position={[0, -1.5, z]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 1, 16]} />
            <meshStandardMaterial color="#5E35B1" metalness={0.3} roughness={0.6} />
          </mesh>
        );
      })}
    </group>
  );
}

// ============================================================
// EMR STATIONS - Puntos de monitoreo
// ============================================================
function EMRStations({ onSelectModule }: { onSelectModule: (mod: number) => void }) {
  const { alturaMuro, flecha } = tunnelInfo;

  return (
    <group>
      {emrStations.map((estacion) => {
        const z = estacion.abscisa;
        const y = alturaMuro + flecha + 0.5;
        const x = 0;
        return (
          <group key={estacion.numero} onClick={() => onSelectModule(Math.floor(z / (tunnelInfo.longitudTotal / tunnelInfo.modulosTotales)))} onPointerDown={(e) => e.stopPropagation()}>
            <mesh position={[x, y, z]} scale={0.5} castShadow>
              <octahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#E53935" emissive="#E53935" emissiveIntensity={0.5} />
            </mesh>
            <Html position={[x, y + 1.5, z]} fullscreen style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%)' }}>
              <div className="text-[10px] font-bold text-red-600 bg-white/90 px-1 py-0.5 rounded border border-red-500/30 shadow">
                EMR #{estacion.numero}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================
// MAIN TUNEL3D COMPONENT
// ============================================================
export function Tunel3D() {
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [moduloSeleccionado, setModuloSeleccionado] = useState<{ numero: number; pkInicio: number; pkFin: number; geomembrana: boolean; revestimiento: boolean } | null>(null);

  const [showVigaBase, setShowVigaBase] = useState(true);
  const [showGeomembrana, setShowGeomembrana] = useState(true);
  const [showRevestimiento, setShowRevestimiento] = useState(true);
  const [showLoza, setShowLoza] = useState(true);
  const [showDrenaje, setShowDrenaje] = useState(true);
  const [showEMR, setShowEMR] = useState(true);

  const layers = useMemo(() => ({
    vigaBase: showVigaBase,
    geomembrana: showGeomembrana,
    revestimiento: showRevestimiento,
    loza: showLoza,
    drenaje: showDrenaje,
    emr: showEMR,
  }), [showVigaBase, showGeomembrana, showRevestimiento, showLoza, showDrenaje, showEMR]);

  const handleModuleSelect = (mod: number) => {
    const longitudModulo = tunnelInfo.longitudTotal / tunnelInfo.modulosTotales;
    const pkInicio = mod * longitudModulo;
    const pkFin = (mod + 1) * longitudModulo;

    const geomembrana = mod < 102;
    const revestimiento = mod < 7;

    setSelectedModule(mod);
    setModuloSeleccionado({
      numero: mod + 1,
      pkInicio,
      pkFin,
      geomembrana,
      revestimiento,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">Modelo 3D - {tunnelInfo.nombre}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Túnel de sección herradura con revestimiento de concreto</p>
        </div>
      </div>

      {/* Canvas 3D + Panel lateral */}
      <Card className="overflow-hidden">
        <CardBody className="p-0">
          <div className="relative h-[600px]">
            <Canvas
              camera={{ position: [0, 15, 150], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              shadows
              style={{ width: '100%', height: '100%' }}
            >
              <color attach="background" args={["#0f172a"]} />
              <fog attach="fog" args={["#0f172a", 50, 400]} />

              <Environment preset="city" />

              <PerspectiveCamera makeDefault position={[0, 15, 150]} />

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={20}
                maxDistance={500}
                target={[0, 5, tunnelInfo.longitudTotal / 2]}
              />

              <Grid
                cellSize={10}
                cellThickness={1}
                sectionSize={100}
                cellColor="#1e293b"
                sectionColor="#334155"
                position={[0, -2.5, 0]}
              />

              <ambientLight intensity={0.8} />
              <directionalLight position={[100, 200, 100]} intensity={1.2} castShadow />
              <directionalLight position={[-100, 100, -100]} intensity={0.5} />

              {layers.vigaBase && (
                <VigaBases
                  onSelectModule={handleModuleSelect}
                  selectedModule={selectedModule}
                />
              )}

              {layers.geomembrana && <Geomembrana />}
              {layers.revestimiento && <Revestimiento />}
              {layers.loza && <LozaPavimento />}
              {layers.drenaje && <ColectorDrenaje />}
              {layers.emr && <EMRStations onSelectModule={handleModuleSelect} />}

              {moduloSeleccionado && (
                <Html
                  position={[0, 0, moduloSeleccionado.pkInicio + (moduloSeleccionado.pkFin - moduloSeleccionado.pkInicio) / 2]}
                  fullscreen
                  style={{ pointerEvents: 'auto', transform: 'translate(-50%, -100%)' }}
                >
                  <div className="bg-neutral-900/95 dark:bg-neutral-900/95 backdrop-blur-sm rounded-xl border border-neutral-700 p-4 pointer-events-auto max-w-xs shadow-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2 text-white">
                        <Box className="w-4 h-4 text-amber-400" aria-hidden="true" />
                        Módulo {moduloSeleccionado.numero}
                      </h3>
                      <button onClick={() => { setSelectedModule(null); setModuloSeleccionado(null); }} className="text-neutral-400 hover:text-white">
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" aria-hidden="true" /> Abscisa
                        </span>
                        <span className="font-medium text-xs text-white">
                          {formatPk(moduloSeleccionado.pkInicio)} - {formatPk(moduloSeleccionado.pkFin)}
                        </span>
                      </div>
                      <div className="border-t border-neutral-700 pt-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Viga Base</span>
                          <StatusBadge status="done" size="sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Geomembrana</span>
                          <StatusBadge status={moduloSeleccionado.geomembrana ? 'done' : 'idle'} size="sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Revestimiento</span>
                          <StatusBadge status={moduloSeleccionado.revestimiento ? 'done' : 'idle'} size="sm" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Loza Pavimento</span>
                          <StatusBadge status="done" size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Html>
              )}
            </Canvas>

            {/* Panel de control flotante */}
            <div className="absolute top-4 right-4 pointer-events-auto z-10">
              <Card className="w-64">
                <CardHeader
                  title="Capas del Modelo"
                  action={
                    <Layers className="w-5 h-5 text-primary-600" aria-hidden="true" />
                  }
                />
                <CardBody className="p-4">
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
                          layer.active ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 opacity-50'
                        }`}
                      >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate text-neutral-900 dark:text-white">{layer.label}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{layer.pct}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader
            title="Geometría"
            subtitle="Sección herradura"
          />
          <CardBody>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Semi-ancho</span><span className="font-medium text-neutral-900 dark:text-white">{tunnelInfo.semiAncho}m</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Altura muros</span><span className="font-medium text-neutral-900 dark:text-white">{tunnelInfo.alturaMuro}m</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Flecha</span><span className="font-medium text-neutral-900 dark:text-white">{tunnelInfo.flecha}m</span></div>
              <div className="flex justify-between"><span className="text-neutral-500 dark:text-neutral-400">Longitud</span><span className="font-medium text-neutral-900 dark:text-white">{tunnelInfo.longitudTotal}m</span></div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Viga Base"
            subtitle="137 módulos × 2 lados"
          />
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Progreso</span><StatusBadge status="done" /></div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">HD + HI completados</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Concreto: 3,400 m³</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Sistema Drenaje"
            subtitle="Colector + 15 cajas"
          />
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Colector</span><StatusBadge status="done" /></div>
              <div className="flex items-center justify-between"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Cajas MH</span><StatusBadge status="done" /></div>
              <div className="flex items-center justify-between"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Cajas A1/A2</span><StatusBadge status="done" /></div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Revestimiento"
            subtitle="7 módulos"
          />
          <CardBody>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-neutral-500 dark:text-neutral-400 text-sm">Progreso</span><StatusBadge status="active" /></div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Módulos 1-7 completados</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Concreto: 1,250 m³</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}