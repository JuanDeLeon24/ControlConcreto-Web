import { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, MapPin, Ruler } from 'lucide-react';
import { Card, CardHeader, CardBody } from './ui/Card';
import { Badge, StatusBadge } from './ui/Badge';
import { emrStations } from '../data/emrData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';

export function Monitoreo() {
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(emrStations[0]);

  const maxConvergencia = Math.max(...emrStations.map(e => e.acumulado_mm));
  const promedioConvergencia = emrStations.reduce((sum, e) => sum + e.acumulado_mm, 0) / emrStations.length;
  const estacionesAlerta = emrStations.filter(e => e.acumulado_mm > 100).length;

  const datosGrafica = emrStations.map(e => ({
    nombre: e.numero.replace('#', ''),
    convergencia: e.acumulado_mm,
    abscisa: e.abscisa,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">Monitoreo de Convergencias</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Estaciones de Monitoreo Relativo (EMR) - Método de Convergencias</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" dot>
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Sistema Estable
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Estaciones Activas</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{emrStations.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Máxima Convergencia</p>
                <p className="text-2xl font-bold text-red-600">{maxConvergencia.toFixed(1)} mm</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <TrendingDown className="w-6 h-6 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Promedio</p>
                <p className="text-2xl font-bold text-amber-600">{promedioConvergencia.toFixed(1)} mm</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">En Alerta</p>
                <p className="text-2xl font-bold text-red-600">{estacionesAlerta}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Convergencia por Estación"
            subtitle="Desplazamiento acumulado en milímetros"
          />
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosGrafica}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="nombre" stroke="#8B949E" fontSize={12} />
                  <YAxis stroke="#8B949E" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F262E',
                      border: '1px solid #30363D',
                      borderRadius: '8px',
                      color: '#E6EDF3',
                    }}
                    formatter={(value) => [`${value} mm`, 'Convergencia']}
                    labelFormatter={(label) => `EMR #${label}`}
                  />
                  <ReferenceLine y={100} stroke="#E53935" strokeDasharray="3 3" label={{ value: 'Límite', fill: '#E53935', fontSize: 12 }} />
                  <Bar
                    dataKey="convergencia"
                    fill="#2F6FB5"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Distribución por Abscisa"
            subtitle="Ubicación de estaciones a lo largo del túnel"
          />
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={datosGrafica}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis
                    dataKey="abscisa"
                    stroke="#8B949E"
                    fontSize={12}
                    tickFormatter={(value) => `K${(value / 1000).toFixed(2)}`}
                  />
                  <YAxis stroke="#8B949E" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F262E',
                      border: '1px solid #30363D',
                      borderRadius: '8px',
                      color: '#E6EDF3',
                    }}
                    formatter={(value) => [`${value} mm`, 'Convergencia']}
                    labelFormatter={(value) => `Abscisa K${(Number(value) / 1000).toFixed(3)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="convergencia"
                    stroke="#FF8F00"
                    strokeWidth={2}
                    dot={{ fill: '#FF8F00', r: 4 }}
                    activeDot={{ r: 6, fill: '#FF8F00' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabla de estaciones */}
      <Card>
        <CardHeader
          title="Detalle de Estaciones"
          subtitle="Información completa de cada EMR"
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">Estación</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">Abscisa</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">Terreno</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">Convergencia</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-neutral-500 dark:text-neutral-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {emrStations.map((estacion) => (
                  <tr
                    key={estacion.numero}
                    className={`border-b border-neutral-200/50 dark:border-neutral-700/50 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                      estacionSeleccionada.numero === estacion.numero ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    }`}
                    onClick={() => setEstacionSeleccionada(estacion)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-neutral-500" aria-hidden="true" />
                        <span className="font-medium">EMR {estacion.numero}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">K{(estacion.abscisa / 1000).toFixed(3)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral" size="sm">Tipo {estacion.terreno}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-semibold ${
                        estacion.acumulado_mm > 100 ? 'text-red-600' :
                        estacion.acumulado_mm > 50 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {estacion.acumulado_mm.toFixed(2)} mm
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {estacion.acumulado_mm > 100 ? (
                        <StatusBadge status="error" size="sm" />
                      ) : estacion.acumulado_mm > 50 ? (
                        <StatusBadge status="active" size="sm" />
                      ) : (
                        <StatusBadge status="done" size="sm" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Resumen de seguridad */}
      <Card>
        <CardHeader
          title="Evaluación Geomecánica"
          subtitle="Análisis del comportamiento del macizo rocoso"
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" aria-hidden="true" />
                <h4 className="font-medium text-green-600">Comportamiento Aceptable</h4>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                El macizo rocoso presenta un comportamiento geomecánico controlado, con velocidades de deformación
                diaria significativamente por debajo del umbral de tolerancia (±2.00 mm/día).
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <h4 className="font-medium text-amber-600">Zonas de Atención</h4>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                EMR #39 (394.6 mm) y EMR #41 (341.9 mm) requieren monitoreo especial por presentar
                convergencias elevadas asociadas a terreno Tipo III.
              </p>
            </div>
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <h4 className="font-medium text-primary-600">Estabilización</h4>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Las curvas de convergencia han superado la fase de deformación primaria y entran en
                fase secundaria de desaceleración, tendiendo a la horizontalidad (asíntota).
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}