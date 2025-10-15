import useSWR from 'swr';


export type Item = {
  id: number;
  numero: string;
  idExterno: string;
  estado: string;
  resumen: string;
  breveDescripcion: string;
  elementoConfiguracion: string;
  prioridad: string;
  puntuacionRiesgo: string;
  grupoAsignacion: string;
  asignadoA: string;
  creado: string;
  actualizado: string;
  sites: string;
  vulnerabilitySolution: string;
  vulnerabilidad: string;
  followUp?: boolean;
  soonDue?: boolean;
};


const fetcher = ([url]: [string, number]) => fetch(url).then(res => res.json());

function calcularSeguimiento(item: Item): Item {
  const prioridad = item.prioridad.toLowerCase();
  const fecha = new Date(item.creado);
  const hoy = new Date();
  const diasPasados = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));

  const followUp = prioridad === 'crítica' || (prioridad === 'alta' && diasPasados >= 7);
  const soonDue = prioridad === 'media' && diasPasados >= 14;

  return { ...item, followUp, soonDue };
}

export default function useItems(refreshKey: number): {
  items: Item[];
  isLoading: boolean;
  isError: any;
} {
  const { data, error } = useSWR<Item[]>(
    ['http://localhost:8000/risk-data/', refreshKey],
    fetcher,
    { refreshInterval: 5000 }
  );

  const items = (data || []).map(calcularSeguimiento);

  return {
    items,
    isLoading: !error && !data,
    isError: error
  };
}