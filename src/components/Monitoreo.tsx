import { useState } from 'react';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, MapPin, Ruler } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
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
          <h1 className="text-2xl md:text-3xl font-bold text-texto">Monitoreo de Convergencias</h1>
          <p className="text-texto-secundario mt-1">Estaciones de Monitoreo Relativo (EMR) - Método de Convergencias</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            Sistema Estable
          </Badge>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primario/20 rounded-lg">
              <Activity className="w-6 h-6 text-primario" />
            </div>
            <div>
              <p className="text-sm text-texto-secundario">Estaciones Activas</p>
              <p className="text-2xl font-bold text-texto">{emrStations.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-peligro/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-peligro" />
            </div>
            <div>
              <p className="text-sm text-texto-secundario">Máxima Convergencia</p>
              <p className="text-2xl font-bold text-peligro">{maxConvergencia.toFixed(1)} mm</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-advertencia/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-advertencia" />
            </div>
            <div>
              <p className="text-sm text-texto-secundario">Promedio</p>
              <p className="text-2xl font-bold text-advertencia">{promedioConvergencia.toFixed(1)} mm</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-peligro/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-peligro" />
            </div>
            <div>
              <p className="text-sm text-texto-secundario">En Alerta</p>
              <p className="text-2xl font-bold text-peligro">{estacionesAlerta}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Convergencia por Estación" subtitle="Desplazamiento acumulado en milímetros">
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
                    color: '#E6EDF3'
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
        </Card>

        <Card title="Distribución por Abscisa" subtitle="Ubicación de estaciones a lo largo del túnel">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafica}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis 
                  dataKey="abscisa" 
                  stroke="#8B949E" 
                  fontSize={12}
                  tickFormatter={(value) => `K${(value/1000).toFixed(2)}`}
                />
                <YAxis stroke="#8B949E" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F262E', 
                    border: '1px solid #30363D',
                    borderRadius: '8px',
                    color: '#E6EDF3'
                  }}
                  formatter={(value) => [`${value} mm`, 'Convergencia']}
                  labelFormatter={(value) => `Abscisa K${(Number(value)/1000).toFixed(3)}`}
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
        </Card>
      </div>

      {/* Tabla de estaciones */}
      <Card title="Detalle de Estaciones" subtitle="Información completa de cada EMR">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-borde">
                <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Estación</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Abscisa</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Terreno</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-texto-secundario">Convergencia</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-texto-secundario">Estado</th>
              </tr>
            </thead>
            <tbody>
              {emrStations.map((estacion) => (
                <tr 
                  key={estacion.numero}
                  className={`border-b border-borde/50 hover:bg-superficie/50 transition-colors cursor-pointer ${
                    estacionSeleccionada.numero === estacion.numero ? 'bg-acento/10' : ''
                  }`}
                  onClick={() => setEstacionSeleccionada(estacion)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-texto-secundario" />
                      <span className="font-medium">EMR {estacion.numero}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">K{(estacion.abscisa/1000).toFixed(3)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="default" size="sm">Tipo {estacion.terreno}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-semibold ${
                      estacion.acumulado_mm > 100 ? 'text-peligro' : 
                      estacion.acumulado_mm > 50 ? 'text-advertencia' : 'text-exito'
                    }`}>
                      {estacion.acumulado_mm.toFixed(2)} mm
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {estacion.acumulado_mm > 100 ? (
                      <Badge variant="danger" size="sm">Alerta</Badge>
                    ) : estacion.acumulado_mm > 50 ? (
                      <Badge variant="warning" size="sm">Vigilar</Badge>
                    ) : (
                      <Badge variant="success" size="sm">Normal</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Resumen de seguridad */}
      <Card title="Evaluación Geomecánica" subtitle="Análisis del comportamiento del macizo rocoso">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-exito/10 rounded-lg border border-exito/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-exito" />
              <h4 className="font-medium text-exito">Comportamiento Aceptable</h4>
            </div>
            <p className="text-sm text-texto-secundario">
              El macizo rocoso presenta un comportamiento geomecánico controlado, con velocidades de deformación 
              diaria significativamente por debajo del umbral de tolerancia (±2.00 mm/día).
            </p>
          </div>
          <div className="p-4 bg-advertencia/10 rounded-lg border border-advertencia/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-advertencia" />
              <h4 className="font-medium text-advertencia">Zonas de Atención</h4>
            </div>
            <p className="text-sm text-texto-secundario">
              EMR #39 (394.6 mm) y EMR #41 (341.9 mm) requieren monitoreo especial por presentar 
              convergencias elevadas asociadas a terreno Tipo III.
            </p>
          </div>
          <div className="p-4 bg-primario/10 rounded-lg border border-primario/20">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-5 h-5 text-primario" />
              <h4 className="font-medium text-primario">Estabilización</h4>
            </div>
            <p className="text-sm text-texto-secundario">
              Las curvas de convergencia han superado la fase de deformación primaria y entran en 
              fase secundaria de desaceleración, tendiendo a la horizontalidad (asíntota).
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
