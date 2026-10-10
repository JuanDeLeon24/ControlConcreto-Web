import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, FileUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { Button } from './ui/Button';

interface ImportacionEstado {
  estado: 'idle' | 'cargando' | 'exito' | 'error';
  nombreArchivo?: string;
  hojasEncontradas?: number;
  registrosImportados?: number;
  advertencias?: string[];
}

export function Importar() {
  const [estado, setEstado] = useState<ImportacionEstado>({ estado: 'idle' });
  const [arrastrando, setArrastrando] = useState(false);

  const simularImportacion = (nombreArchivo: string) => {
    setEstado({ estado: 'cargando', nombreArchivo });

    setTimeout(() => {
      setEstado({
        estado: 'exito',
        nombreArchivo,
        hojasEncontradas: 6,
        registrosImportados: 1247,
        advertencias: [
          'Se encontraron 3 registros duplicados que fueron omitidos',
          'La hoja "BD_Actividades" contiene 15 registros sin PK válido',
          'Se ignoraron 2 registros de otros túneles',
        ],
      });
    }, 2500);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    simularImportacion(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const resetEstado = () => {
    setEstado({ estado: 'idle' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">Importar Reporte</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Carga el archivo Excel del reporte diario de actividades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card>
          <CardHeader
            title="Cargar Archivo"
            subtitle="Formato .xlsx o .xlsm"
          />
          <CardBody>
            <div
              onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${arrastrando
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-primary-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }
              `}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xlsm"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="flex flex-col items-center">
                {estado.estado === 'cargando' ? (
                  <>
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                      <FileSpreadsheet className="w-8 h-8 text-primary-600 animate-pulse" aria-hidden="true" />
                    </div>
                    <p className="font-medium text-neutral-900 dark:text-white mb-2">Procesando {estado.nombreArchivo}...</p>
                    <div className="w-full max-w-xs">
                      <ProgressBar value={65} variant="primary" showLabel={false} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-8 h-8 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                    </div>
                    <p className="font-medium text-neutral-900 dark:text-white mb-2">
                      Arrastre su archivo aquí o haga clic para seleccionar
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Formatos soportados: .xlsx, .xlsm (máx. 50MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Formato esperado */}
            <div className="mt-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <h4 className="font-medium text-sm mb-3">Formato esperado del archivo:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-400">Matriz cant.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-400">Avances_Diarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-400">BD_Actividades</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-400">Módulos_VB</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-400">Formato Túnel_Dia</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" aria-hidden="true" />
                  <span className="text-neutral-500 dark:text-neutral-400">Formato Túnel_Noche</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Resultado */}
        <Card>
          <CardHeader
            title="Resultado de Importación"
            subtitle="Detalle del procesamiento"
          />
          <CardBody>
            {estado.estado === 'idle' && (
              <div className="text-center py-12">
                <FileUp className="w-16 h-16 text-neutral-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-neutral-500 dark:text-neutral-400">Cargue un archivo para ver el resultado</p>
              </div>
            )}

            {estado.estado === 'cargando' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full" aria-hidden="true" />
                  <span>Leyendo hojas del archivo...</span>
                </div>
                <div className="space-y-2">
                  <ProgressBar value={30} variant="primary" showLabel={false} />
                </div>
              </div>
            )}

            {estado.estado === 'exito' && estado.nombreArchivo && (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <p className="text-3xl font-bold text-green-600">{estado.hojasEncontradas}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Hojas encontradas</p>
                  </div>
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 text-center">
                    <p className="text-3xl font-bold text-primary-600">{estado.registrosImportados}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Registros importados</p>
                  </div>
                </div>

                {/* Archivo procesado */}
                <div className="flex items-center gap-3 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-neutral-900 dark:text-white truncate">{estado.nombreArchivo}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Procesado correctamente</p>
                  </div>
                  <Badge variant="success">Completado</Badge>
                </div>

                {/* Advertencias */}
                {estado.advertencias && estado.advertencias.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                      Advertencias ({estado.advertencias.length})
                    </h4>
                    {estado.advertencias.map((adv, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                        <p className="text-sm text-neutral-900 dark:text-white">{adv}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón de acción */}
                <Button
                  onClick={resetEstado}
                  className="w-full"
                  leftIcon={<CheckCircle2 className="w-5 h-5" />}
                  variant="success"
                >
                  Confirmar y Guardar
                </Button>
              </div>
            )}

            {estado.estado === 'error' && (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" aria-hidden="true" />
                <p className="font-medium text-red-600 mb-2">Error al procesar el archivo</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Verifique que el archivo tenga el formato correcto
                </p>
                <Button
                  onClick={resetEstado}
                  variant="danger"
                >
                  Intentar nuevamente
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}