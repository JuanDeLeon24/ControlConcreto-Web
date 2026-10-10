import { Card, CardHeader, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { FolderOpen, Plus, MoreHorizontal } from 'lucide-react';

const projects = [
  { id: 'tunel-0', name: 'Túnel 0', ubicacion: 'Línea 2 Metro Lima', estado: 'active', avance: 15.2, modulos: 7 },
  { id: 'tunel-1', name: 'Túnel 1', ubicacion: 'Línea 4 Metro Lima', estado: 'done', avance: 100, modulos: 137 },
  { id: 'tunel-2', name: 'Túnel 2', ubicacion: 'Autopista Central', estado: 'pending', avance: 0, modulos: 0 },
  { id: 'galeria-1', name: 'Galería Emergencia', ubicacion: 'Km 45+200', estado: 'active', avance: 60, modulos: 12 },
];

export function Projects() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">Proyectos</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Gestión de túneles y galerías en ejecución</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          Nuevo Proyecto
        </Button>
      </div>

      {/* Grid de proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((project) => (
          <Card key={project.id} hover className="h-full flex flex-col">
            <CardHeader
              title={project.name}
              subtitle={project.ubicacion}
              action={
                <div className="flex items-center gap-2">
                  <Badge variant={project.estado === 'done' ? 'success' : project.estado === 'active' ? 'warning' : 'info'} size="sm">
                    {project.estado === 'done' ? 'Completado' : project.estado === 'active' ? 'En ejecución' : 'Planificado'}
                  </Badge>
                  <Button variant="ghost" size="icon" aria-label="Más opciones">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              }
            />
            <CardBody className="flex-1 flex flex-col">
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-500 dark:text-neutral-400">Avance general</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{project.avance.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full transition-all duration-500" 
                      style={{ width: `${project.avance}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Módulos completados</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">{project.modulos}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Button variant="outline" size="sm" className="flex-1" leftIcon={<FolderOpen className="w-4 h-4" />}>
                  Ver Detalle
                </Button>
                <Button variant="primary" size="sm" className="flex-1">
                  Entrar
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Proyecto vacío - CTA */}
      <Card>
        <CardBody className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">¿No hay proyectos?</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Comienza creando tu primer proyecto de túnel para gestionar avances, monitoreo y registros.
          </p>
          <Button variant="primary" size="lg" leftIcon={<Plus className="w-5 h-5" />}>
            Crear Primer Proyecto
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}