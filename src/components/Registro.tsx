import { useState } from 'react';
import { Save, Plus, Trash2, Calendar, Clock, MapPin } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';


interface RegistroActividad {
  id: string;
  fecha: string;
  turno: 'Día' | 'Noche';
  actividad: string;
  lado: 'HD' | 'HI' | 'Ambos';
  pkA: string;
  pkB: string;
  cantidad: number;
  unidad: string;
}

const actividades = [
  { id: 'imp', nombre: 'Geomembrana', grupo: 'Impermeabilización' },
  { id: 'vb_acero', nombre: 'Viga base - Acero', grupo: 'Viga base' },
  { id: 'vb_enc', nombre: 'Viga base - Encofrado', grupo: 'Viga base' },
  { id: 'vb_conc', nombre: 'Viga base - Concreto', grupo: 'Viga base' },
  { id: 'vb_desenc', nombre: 'Viga base - Desencofrado', grupo: 'Viga base' },
  { id: 'rev_malla', nombre: 'Revestimiento - Malla', grupo: 'Revestimiento' },
  { id: 'rev_form', nombre: 'Revestimiento - Formaleta', grupo: 'Revestimiento' },
  { id: 'rev_conc', nombre: 'Revestimiento - Concreto', grupo: 'Revestimiento' },
  { id: 'rev_desenc', nombre: 'Revestimiento - Desencofrado', grupo: 'Revestimiento' },
];

export function Registro() {
  const [registros, setRegistros] = useState<RegistroActividad[]>([
    {
      id: '1',
      fecha: '2026-10-09',
      turno: 'Día',
      actividad: 'rev_conc',
      lado: 'Ambos',
      pkA: 'K6+420',
      pkB: 'K6+450',
      cantidad: 45.5,
      unidad: 'm³',
    },
    {
      id: '2',
      fecha: '2026-10-09',
      turno: 'Noche',
      actividad: 'rev_form',
      lado: 'HD',
      pkA: 'K6+450',
      pkB: 'K6+480',
      cantidad: 30,
      unidad: 'm',
    },
  ]);

  const [nuevoRegistro, setNuevoRegistro] = useState<Partial<RegistroActividad>>({
    fecha: new Date().toISOString().split('T')[0],
    turno: 'Día',
    lado: 'Ambos',
    cantidad: 0,
    unidad: 'm³',
  });

  const handleAddRegistro = () => {
    if (!nuevoRegistro.actividad || !nuevoRegistro.pkA || !nuevoRegistro.pkB) return;
    
    const nuevo: RegistroActividad = {
      id: Date.now().toString(),
      fecha: nuevoRegistro.fecha || new Date().toISOString().split('T')[0],
      turno: (nuevoRegistro.turno as 'Día' | 'Noche') || 'Día',
      actividad: nuevoRegistro.actividad || '',
      lado: (nuevoRegistro.lado as 'HD' | 'HI' | 'Ambos') || 'Ambos',
      pkA: nuevoRegistro.pkA || '',
      pkB: nuevoRegistro.pkB || '',
      cantidad: nuevoRegistro.cantidad || 0,
      unidad: nuevoRegistro.unidad || 'm³',
    };
    
    setRegistros([nuevo, ...registros]);
    setNuevoRegistro({
      fecha: new Date().toISOString().split('T')[0],
      turno: 'Día',
      lado: 'Ambos',
      cantidad: 0,
      unidad: 'm³',
    });
  };

  const handleDeleteRegistro = (id: string) => {
    setRegistros(registros.filter(r => r.id !== id));
  };

  const getActividadNombre = (id: string) => {
    return actividades.find(a => a.id === id)?.nombre || id;
  };

  const getActividadGrupo = (id: string) => {
    return actividades.find(a => a.id === id)?.grupo || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-texto">Registro de Actividades</h1>
          <p className="text-texto-secundario mt-1">Carga manual de actividades diarias del frente de trabajo</p>
        </div>
        <Badge variant="info">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <Card title="Nueva Actividad" subtitle="Ingrese los datos del registro" className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-texto-secundario mb-1.5">Fecha</label>
              <input
                type="date"
                value={nuevoRegistro.fecha}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fecha: e.target.value })}
                className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto focus:outline-none focus:border-acento transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-texto-secundario mb-1.5">Actividad</label>
              <select
                value={nuevoRegistro.actividad}
                onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, actividad: e.target.value })}
                className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto focus:outline-none focus:border-acento transition-colors"
              >
                <option value="">Seleccionar actividad...</option>
                <optgroup label="Impermeabilización">
                  {actividades.filter(a => a.grupo === 'Impermeabilización').map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </optgroup>
                <optgroup label="Viga Base">
                  {actividades.filter(a => a.grupo === 'Viga base').map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </optgroup>
                <optgroup label="Revestimiento">
                  {actividades.filter(a => a.grupo === 'Revestimiento').map(a => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-texto-secundario mb-1.5">Turno</label>
                <select
                  value={nuevoRegistro.turno}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, turno: e.target.value as 'Día' | 'Noche' })}
                  className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto focus:outline-none focus:border-acento transition-colors"
                >
                  <option value="Día">Día</option>
                  <option value="Noche">Noche</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-texto-secundario mb-1.5">Lado</label>
                <select
                  value={nuevoRegistro.lado}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, lado: e.target.value as 'HD' | 'HI' | 'Ambos' })}
                  className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto focus:outline-none focus:border-acento transition-colors"
                >
                  <option value="HD">HD (Derecho)</option>
                  <option value="HI">HI (Izquierdo)</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-texto-secundario mb-1.5">PK Inicial</label>
                <input
                  type="text"
                  placeholder="K6+420"
                  value={nuevoRegistro.pkA}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, pkA: e.target.value })}
                  className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto placeholder-texto-secundario focus:outline-none focus:border-acento transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-texto-secundario mb-1.5">PK Final</label>
                <input
                  type="text"
                  placeholder="K6+450"
                  value={nuevoRegistro.pkB}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, pkB: e.target.value })}
                  className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto placeholder-texto-secundario focus:outline-none focus:border-acento transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-texto-secundario mb-1.5">Cantidad</label>
                <input
                  type="number"
                  step="0.01"
                  value={nuevoRegistro.cantidad}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, cantidad: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto focus:outline-none focus:border-acento transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-texto-secundario mb-1.5">Unidad</label>
                <select
                  value={nuevoRegistro.unidad}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, unidad: e.target.value })}
                  className="w-full px-3 py-2 bg-superficie border border-borde rounded-lg text-texto focus:outline-none focus:border-acento transition-colors"
                >
                  <option value="m³">m³</option>
                  <option value="m">m</option>
                  <option value="kg">kg</option>
                  <option value="unds">unds</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddRegistro}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-acento text-fondo font-semibold rounded-lg hover:bg-acento/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Agregar Registro
            </button>
          </div>
        </Card>

        {/* Lista de registros */}
        <Card title="Registros del Día" subtitle={`${registros.length} actividades registradas`} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-borde">
                  <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Actividad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Turno</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Lado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-texto-secundario">Rango PK</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-texto-secundario">Cantidad</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-texto-secundario">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((registro) => (
                  <tr key={registro.id} className="border-b border-borde/50 hover:bg-superficie/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-texto">{getActividadNombre(registro.actividad)}</p>
                        <p className="text-xs text-texto-secundario">{getActividadGrupo(registro.actividad)}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={registro.turno === 'Día' ? 'warning' : 'info'} size="sm">
                        <Clock className="w-3 h-3 mr-1" />
                        {registro.turno}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">{registro.lado}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3 text-texto-secundario" />
                        {registro.pkA} - {registro.pkB}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium">{registro.cantidad} {registro.unidad}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteRegistro(registro.id)}
                        className="p-2 text-peligro hover:bg-peligro/10 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {registros.length === 0 && (
              <div className="text-center py-12">
                <Save className="w-12 h-12 text-texto-secundario mx-auto mb-4" />
                <p className="text-texto-secundario">No hay registros para mostrar</p>
                <p className="text-sm text-texto-secundario mt-1">Agregue una nueva actividad usando el formulario</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
