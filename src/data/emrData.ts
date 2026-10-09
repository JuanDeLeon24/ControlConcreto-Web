export interface EMRStation {
  numero: string;
  acumulado_mm: number;
  abscisa: number;
  terreno: string;
}

export const emrStations: EMRStation[] = [
  { numero: "#39", acumulado_mm: 394.6, abscisa: 6629.6, terreno: "III" },
  { numero: "#40", acumulado_mm: 8.08, abscisa: 6614.9, terreno: "III" },
  { numero: "#41", acumulado_mm: 341.9, abscisa: 6599.9, terreno: "III" },
  { numero: "#42", acumulado_mm: 330.39, abscisa: 6584.79, terreno: "III" },
  { numero: "#43", acumulado_mm: 322.8, abscisa: 6569.9, terreno: "III" },
  { numero: "#44", acumulado_mm: 315.9, abscisa: 6554.9, terreno: "III" },
  { numero: "#45", acumulado_mm: 0, abscisa: 6538.1, terreno: "III" },
  { numero: "#46", acumulado_mm: 0, abscisa: 6521.9, terreno: "III" },
  { numero: "#47", acumulado_mm: 0, abscisa: 6506.49, terreno: "III" },
  { numero: "#48", acumulado_mm: 3.98, abscisa: 6492.37, terreno: "III" },
  { numero: "#49", acumulado_mm: 7.74, abscisa: 6476.27, terreno: "III" },
  { numero: "#50", acumulado_mm: 0, abscisa: 6461, terreno: "III" },
  { numero: "#51", acumulado_mm: 6.47, abscisa: 6446, terreno: "III" },
  { numero: "#52", acumulado_mm: 0, abscisa: 6432.8, terreno: "IV" },
  { numero: "#53", acumulado_mm: 0, abscisa: 6426.12, terreno: "IV" },
  { numero: "#54", acumulado_mm: 7.77, abscisa: 6414.8, terreno: "III" },
  { numero: "#55", acumulado_mm: 0, abscisa: 6403.1, terreno: "III" },
  { numero: "#56", acumulado_mm: 5.01, abscisa: 6388.1, terreno: "III" },
  { numero: "#57", acumulado_mm: 0, abscisa: 6373.1, terreno: "III" },
  { numero: "#58", acumulado_mm: 11.32, abscisa: 6356.03, terreno: "III" },
  { numero: "#59", acumulado_mm: 4.77, abscisa: 6336.58, terreno: "III" },
  { numero: "#60", acumulado_mm: 25.29, abscisa: 6321.44, terreno: "III" },
  { numero: "#61", acumulado_mm: 18.51, abscisa: 6306, terreno: "III" },
  { numero: "#62", acumulado_mm: 24.5, abscisa: 6290.5, terreno: "III" },
  { numero: "#63", acumulado_mm: 21.03, abscisa: 6275.5, terreno: "III" },
];

export const tunnelInfo = {
  nombre: "Túnel Cero - TOYOT2S1",
  longitudTotal: 384,
  abscisaInicio: 6275.5,
  abscisaFin: 6629.6,
  seccion: "Herradura",
  semiAncho: 5.2,
  alturaMuro: 2.6,
  flecha: 3.6,
  terreno: "III/IV",
  estacionesEMR: 25,
  avanceVigaBase: 100,
  avanceGeomembrana: 75,
  avanceRevestimiento: 5.2,
  modulosTotales: 137,
  modulosRevestidos: 7,
  concretoRevestimiento: 1250,
  concretoVigaBase: 3400,
  ritmoDiario: 2.5,
  fechaInicio: "2025-08-15",
  fechaEstimadaFin: "2027-03-30",
};
