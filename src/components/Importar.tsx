import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, FileUp } from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-texto">Importar Reporte</h1>
          <p className="text-texto-secundario mt-1">Carga el archivo Excel del reporte diario de actividades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <Card title="Cargar Archivo" subtitle="Formato .xlsx o .xlsm">
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${arrastrando 
                ? 'border-acento bg-acento/10' 
                : 'border-borde hover:border-acento/50 hover:bg-superficie/50'
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
                  <div className="w-16 h-16 bg-acento/20 rounded-full flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-acento animate-pulse" />
                  </div>
                  <p className="font-medium text-texto mb-2">Procesando {estado.nombreArchivo}...</p>
                  <div className="w-full max-w-xs">
                    <ProgressBar value={65} color="bg-acento" showLabel={false} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-borde rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-texto-secundario" />
                  </div>
                  <p className="font-medium text-texto mb-2">
                    Arrastre su archivo aquí o haga clic para seleccionar
                  </p>
                  <p className="text-sm text-texto-secundario">
                    Formatos soportados: .xlsx, .xlsm (máx. 50MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Formato esperado */}
          <div className="mt-6 p-4 bg-superficie rounded-lg border border-borde">
            <h4 className="font-medium text-sm mb-3">Formato esperado del archivo:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-exito" />
                <span className="text-texto-secundario">Matriz cant.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-exito" />
                <span className="text-texto-secundario">Avances_Diarios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-exito" />
                <span className="text-texto-secundario">BD_Actividades</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-exito" />
                <span className="text-texto-secundario">Módulos_VB</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-exito" />
                <span className="text-texto-secundario">Formato Túnel_Dia</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-exito" />
                <span className="text-texto-secundario">Formato Túnel_Noche</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Resultado */}
        <Card title="Resultado de Importación" subtitle="Detalle del procesamiento">
          {estado.estado === 'idle' && (
            <div className="text-center py-12">
              <FileUp className="w-16 h-16 text-texto-secundario mx-auto mb-4" />
              <p className="text-texto-secundario">Cargue un archivo para ver el resultado</p>
            </div>
          )}

          {estado.estado === 'cargando' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-acento/10 rounded-lg border border-acento/20">
                <div className="animate-spin w-5 h-5 border-2 border-acento border-t-transparent rounded-full" />
                <span>Leyendo hojas del archivo...</span>
              </div>
              <div className="space-y-2">
                <ProgressBar value={30} color="bg-acento" showLabel={false} />
              </div>
            </div>
          )}

          {estado.estado === 'exito' && estado.nombreArchivo && (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-exito/10 rounded-lg border border-exito/20 text-center">
                  <p className="text-3xl font-bold text-exito">{estado.hojasEncontradas}</p>
                  <p className="text-sm text-texto-secundario">Hojas encontradas</p>
                </div>
                <div className="p-4 bg-primario/10 rounded-lg border border-primario/20 text-center">
                  <p className="text-3xl font-bold text-primario">{estado.registrosImportados}</p>
                  <p className="text-sm text-texto-secundario">Registros importados</p>
                </div>
              </div>

              {/* Archivo procesado */}
              <div className="flex items-center gap-3 p-4 bg-superficie rounded-lg border border-borde">
                <CheckCircle2 className="w-8 h-8 text-exito flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-texto truncate">{estado.nombreArchivo}</p>
                  <p className="text-sm text-texto-secundario">Procesado correctamente</p>
                </div>
                <Badge variant="success">Completado</Badge>
              </div>

              {/* Advertencias */}
              {estado.advertencias && estado.advertencias.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-advertencia" />
                    Advertencias ({estado.advertencias.length})
                  </h4>
                  {estado.advertencias.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-advertencia/10 rounded-lg border border-advertencia/20">
                      <AlertTriangle className="w-4 h-4 text-advertencia flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-texto">{adv}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón de acción */}
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-exito text-white font-semibold rounded-lg hover:bg-exito/90 transition-colors">
                <CheckCircle2 className="w-5 h-5" />
                Confirmar y Guardar
              </button>
            </div>
          )}

          {estado.estado === 'error' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-peligro mx-auto mb-4" />
              <p className="font-medium text-peligro mb-2">Error al procesar el archivo</p>
              <p className="text-sm text-texto-secundario mb-4">
                Verifique que el archivo tenga el formato correcto
              </p>
              <button 
                onClick={() => setEstado({ estado: 'idle' })}
                className="px-4 py-2 bg-peligro text-white rounded-lg hover:bg-peligro/90 transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
