import { Mountain, Layers, Truck, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card } from './ui/Card';
import { StatCard } from './ui/StatCard';
import { ProgressBar } from './ui/ProgressBar';
import { Badge } from './ui/Badge';
import { tunnelInfo, emrStations } from '../data/emrData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const avanceData = [
  { fecha: 'Sem 1', metros: 0 },
  { fecha: 'Sem 2', metros: 12 },
  { fecha: 'Sem 3', metros: 28 },
  { fecha: 'Sem 4', metros: 45 },
  { fecha: 'Sem 5', metros: 68 },
  { fecha: 'Sem 6', metros: 95 },
  { fecha: 'Sem 7', metros: 128 },
  { fecha: 'Sem 8', metros: 165 },
  { fecha: 'Sem 9', metros: 205 },
  { fecha: 'Sem 10', metros: 248 },
  { fecha: 'Sem 11', metros: 295 },
  { fecha: 'Sem 12', metros: 345 },
];

const modulosPorEstado = [
  { estado: 'Terminados', cantidad: 7, color: '#43A047' },
  { estado: 'En ejecución', cantidad: 3, color: '#FDD835' },
  { estado: 'Retrasados', cantidad: 1, color: '#E53935' },
  { estado: 'No iniciados', cantidad: 126, color: '#8E9399' },
];

export function Dashboard() {
  const avanceTotal = ((tunnelInfo.modulosRevestidos / tunnelInfo.modulosTotales) * 100).toFixed(1);
  const metrosRevestidos = (tunnelInfo.modulosRevestidos * 2.8).toFixed(1);
  const metrosFaltantes = ((tunnelInfo.modulosTotales - tunnelInfo.modulosRevestidos) * 2.8).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-texto">Panel de Control</h1>
          <p className="text-texto-secundario mt-1">Resumen general del {tunnelInfo.nombre}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" size="md">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Operación Normal
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Avance Total"
          value={`${avanceTotal}%`}
          subtitle={`${metrosRevestidos}m de ${metrosFaltantes}m restantes`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
          color="text-acento"
        />
        <StatCard
          title="Viga Base"
          value={`${tunnelInfo.avanceVigaBase}%`}
          subtitle="137 módulos completados"
          icon={Layers}
          color="text-exito"
        />
        <StatCard
          title="Geomembrana"
          value={`${tunnelInfo.avanceGeomembrana}%`}
          subtitle="Progreso de impermeabilización"
          icon={Mountain}
          color="text-info"
        />
        <StatCard
          title="Ritmo Diario"
          value={`${tunnelInfo.ritmoDiario} m/día`}
          subtitle="Velocidad de revestimiento"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
          color="text-advertencia"
        />
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress */}
        <Card title="Avance por Grupo" subtitle="Distribución del progreso de obra" className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-exito" />
                  <span className="font-medium">Viga Base</span>
                </div>
                <span className="text-sm text-exito font-semibold">100%</span>
              </div>
              <ProgressBar value={100} color="bg-exito" size="lg" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-info" />
                  <span className="font-medium">Geomembrana</span>
                </div>
                <span className="text-sm text-info font-semibold">75%</span>
              </div>
              <ProgressBar value={75} color="bg-info" size="lg" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-acento" />
                  <span className="font-medium">Revestimiento</span>
                </div>
                <span className="text-sm text-acento font-semibold">5.2%</span>
              </div>
              <ProgressBar value={5.2} color="bg-acento" size="lg" />
            </div>
          </div>
        </Card>

        {/* Module Status */}
        <Card title="Estado de Módulos" subtitle="Distribución por estado">
          <div className="space-y-4">
            {modulosPorEstado.map((item) => (
              <div key={item.estado} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.estado}</span>
                </div>
                <span className="font-semibold">{item.cantidad}</span>
              </div>
            ))}
            <div className="pt-4 border-t border-borde">
              <div className="flex justify-between text-sm">
                <span className="text-texto-secundario">Total módulos</span>
                <span className="font-semibold">137</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S-Curve */}
        <Card title="Curva S de Avance" subtitle="Metros revestidos acumulados vs tiempo">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={avanceData}>
                <defs>
                  <linearGradient id="colorMetros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8F00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF8F00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="fecha" stroke="#8B949E" fontSize={12} />
                <YAxis stroke="#8B949E" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F262E', 
                    border: '1px solid #30363D',
                    borderRadius: '8px',
                    color: '#E6EDF3'
                  }}
                />
                <Area type="monotone" dataKey="metros" stroke="#FF8F00" fill="url(#colorMetros)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* EMR Convergence */}
        <Card title="Convergencias EMR" subtitle="Desplazamiento acumulado por estación (mm)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emrStations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="numero" stroke="#8B949E" fontSize={12} />
                <YAxis stroke="#8B949E" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F262E', 
                    border: '1px solid #30363D',
                    borderRadius: '8px',
                    color: '#E6EDF3'
                  }}
                />
                <Line type="monotone" dataKey="acumulado_mm" stroke="#2F6FB5" strokeWidth={2} dot={{ fill: '#2F6FB5', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <Card title="Alertas y Notificaciones" subtitle="Eventos recientes que requieren atención">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-peligro/10 rounded-lg border border-peligro/20">
            <AlertTriangle className="w-5 h-5 text-peligro flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-peligro">EMR #39 - Convergencia elevada</p>
              <p className="text-sm text-texto-secundario mt-1">Desplazamiento de 394.6 mm en abscisa K6+629.6. Requiere monitoreo especial.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-advertencia/10 rounded-lg border border-advertencia/20">
            <AlertTriangle className="w-5 h-5 text-advertencia flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-advertencia">Módulo 12 - Retraso en revestimiento</p>
              <p className="text-sm text-texto-secundario mt-1">Sin actividad registrada en los últimos 7 días. Verificar disponibilidad de recursos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-exito/10 rounded-lg border border-exito/20">
            <CheckCircle2 className="w-5 h-5 text-exito flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-exito">Viga Base al 100%</p>
              <p className="text-sm text-texto-secundario mt-1">Los 137 módulos de viga base han sido completados exitosamente.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
