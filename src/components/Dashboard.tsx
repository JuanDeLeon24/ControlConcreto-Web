import { Mountain, Layers, Truck, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from './ui/Card';
import { StatGrid } from './ui/StatCard';
import { ProgressBar } from './ui/ProgressBar';
import { Badge, StatusBadge } from './ui/Badge';
import { tunnelInfo, emrStations } from '../data/emrData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const avanceData = [
  { fecha: '02/10', m3: 0, acumulado: 0 },
  { fecha: '03/10', m3: 120, acumulado: 120 },
  { fecha: '04/10', m3: 145, acumulado: 265 },
  { fecha: '05/10', m3: 130, acumulado: 395 },
  { fecha: '06/10', m3: 155, acumulado: 550 },
  { fecha: '07/10', m3: 140, acumulado: 690 },
  { fecha: '08/10', m3: 160, acumulado: 850 },
  { fecha: '09/10', m3: 135, acumulado: 985 },
  { fecha: '10/10', m3: 145, acumulado: 1130 },
  { fecha: '11/10', m3: 120, acumulado: 1250 },
];

const modulosPorEstado = [
  { estado: 'Terminados', cantidad: 7, status: 'done' as const },
  { estado: 'En ejecución', cantidad: 3, status: 'active' as const },
  { estado: 'Retrasados', cantidad: 1, status: 'late' as const },
  { estado: 'No iniciados', cantidad: 126, status: 'idle' as const },
];

export function Dashboard() {
  const avanceTotal = ((tunnelInfo.modulosRevestidos / tunnelInfo.modulosTotales) * 100).toFixed(1);
  const metrosRevestidos = (tunnelInfo.modulosRevestidos * 2.8).toFixed(1);
  const metrosFaltantes = ((tunnelInfo.modulosTotales - tunnelInfo.modulosRevestidos) * 2.8).toFixed(1);

  const stats = [
    {
      label: 'Avance Total',
      value: `${avanceTotal}%`,
      description: `${metrosRevestidos}m de ${metrosFaltantes}m restantes`,
      icon: <TrendingUp className="w-5 h-5" />,
      trend: { value: 12, up: true },
      valueColor: 'primary' as const,
    },
    {
      label: 'Viga Base',
      value: `${tunnelInfo.avanceVigaBase}%`,
      description: '137 módulos completados',
      icon: <Layers className="w-5 h-5" />,
      valueColor: 'success' as const,
    },
    {
      label: 'Geomembrana',
      value: `${tunnelInfo.avanceGeomembrana}%`,
      description: 'Progreso de impermeabilización',
      icon: <Mountain className="w-5 h-5" />,
      valueColor: 'info' as const,
    },
    {
      label: 'Ritmo Diario',
      value: `${tunnelInfo.ritmoDiario} m/día`,
      description: 'Velocidad de revestimiento',
      icon: <Clock className="w-5 h-5" />,
      trend: { value: 8, up: true },
      valueColor: 'warning' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">Panel de Control</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Resumen general del {tunnelInfo.nombre}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" dot>
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Operación Normal
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <StatGrid stats={stats} />

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Avance por Grupo"
            subtitle="Distribución del progreso de obra"
            action={<Layers className="w-5 h-5 text-primary-600" aria-hidden="true" />}
          />
          <CardBody>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-green-600" aria-hidden="true" />
                    <span className="font-medium">Viga Base</span>
                  </div>
                  <span className="text-sm text-green-600 font-semibold">100%</span>
                </div>
                <ProgressBar value={100} variant="success" size="lg" showLabel />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    <span className="font-medium">Geomembrana</span>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">75%</span>
                </div>
                <ProgressBar value={75} variant="info" size="lg" showLabel />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-600" aria-hidden="true" />
                    <span className="font-medium">Revestimiento</span>
                  </div>
                  <span className="text-sm text-amber-600 font-semibold">5.2%</span>
                </div>
                <ProgressBar value={5.2} variant="warning" size="lg" showLabel />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Module Status */}
        <Card>
          <CardHeader
            title="Estado de Módulos"
            subtitle="Distribución por estado"
          />
          <CardBody>
            <div className="space-y-4">
              {modulosPorEstado.map((item) => (
                <div key={item.estado} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <span className="font-semibold text-neutral-900 dark:text-white">{item.cantidad}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Total módulos</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">137</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S-Curve */}
        <Card>
          <CardHeader
            title="Curva S de Revestimiento"
            subtitle="Concreto acumulado (m³) - Inicio: 02/10/2026"
          />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={avanceData}>
                  <defs>
                    <linearGradient id="colorM3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF8F00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF8F00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="fecha" stroke="#8B949E" fontSize={12} />
                  <YAxis stroke="#8B949E" fontSize={12} label={{ value: 'm³', angle: -90, position: 'insideLeft', fill: '#8B949E' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F262E',
                      border: '1px solid #30363D',
                      borderRadius: '8px',
                      color: '#E6EDF3',
                    }}
                    formatter={(value, name) => [
                      `${(value ?? 0)} m³`,
                      name === 'acumulado' ? 'Acumulado' : 'Diario',
                    ]}
                  />
                  <Area type="monotone" dataKey="acumulado" stroke="#FF8F00" fill="url(#colorM3)" strokeWidth={2} name="Acumulado" />
                  <Area type="monotone" dataKey="m3" stroke="#2F6FB5" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Diario" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* EMR Convergence */}
        <Card>
          <CardHeader
            title="Convergencias EMR"
            subtitle="Desplazamiento acumulado por estación (mm)"
          />
          <CardBody>
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
                      color: '#E6EDF3',
                    }}
                  />
                  <Line type="monotone" dataKey="acumulado_mm" stroke="#2F6FB5" strokeWidth={2} dot={{ fill: '#2F6FB5', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader
          title="Alertas y Notificaciones"
          subtitle="Eventos recientes que requieren atención"
        />
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-red-600">EMR #39 - Convergencia elevada</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Desplazamiento de 394.6 mm en abscisa K6+629.6. Requiere monitoreo especial.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-amber-600">Módulo 12 - Retraso en revestimiento</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Sin actividad registrada en los últimos 7 días. Verificar disponibilidad de recursos.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-green-600">Viga Base al 100%</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Los 137 módulos de viga base han sido completados exitosamente.</p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}