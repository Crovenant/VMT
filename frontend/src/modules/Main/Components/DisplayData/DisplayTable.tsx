// modules/components/DisplayTable.tsx
import {
  Box,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { Item } from '../../types/item';

const columnKeyMap: Record<string, keyof Item> = {
  "Número": "numero",
  "ID externo": "idExterno",
  "Estado": "estado",
  "Resumen": "resumen",
  "Breve descripción": "breveDescripcion",
  "Elemento de configuración": "elementoConfiguracion",
  "Prioridad": "prioridad",
  "Puntuación de riesgo": "puntuacionRiesgo",
  "Grupo de asignación": "grupoAsignacion",
  "Asignado a": "asignadoA",
  "Creado": "creado",
  "Actualizado": "actualizado",
  "Sites": "sites",
  "Vulnerability solution": "vulnerabilitySolution",
  "Vulnerabilidad": "vulnerabilidad"
};

// ---------- helpers de prioridad (normalización con tildes/mayúsculas) ----------
const normalize = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // remove diacritics
    .toLowerCase()
    .trim();

/**
 * Admite variantes: "Crítico/Crítica/CRITICO", "Alto/Alta", "Medio/Media", "Bajo/Baja".
 * Si llega en inglés (critical/high/medium/low) también lo mapeamos por si acaso.
 */
const getWarningColor = (priority: unknown) => {
  switch (normalize(priority)) {
    case 'critico':
    case 'critica':
    case 'critical':
      return '#d32f2f'; // rojo
    case 'alto':
    case 'alta':
    case 'high':
      return '#f57c00'; // naranja
    case 'medio':
    case 'media':
    case 'medium':
      return '#fbc02d'; // amarillo
    case 'bajo':
    case 'baja':
    case 'low':
      return '#1976d2'; // azul
    default:
      return '#9e9e9e'; // gris por defecto
  }
};

export default function DisplayTable({
  rows,
  visibleColumns,
  visibleRows,
  setVisibleRows,
}: {
  rows: Item[];
  visibleColumns: string[];
  visibleRows: number;
  setVisibleRows: (val: number) => void;
  showFilterPanel: boolean;
}) {
  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableCell key={col}>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, visibleRows).map((row: Item) => (
            <TableRow
              key={`${(row as any).id ?? row.numero}-${row.numero}`}
              sx={row.followUp ? { backgroundColor: '#fff8e1' } : {}}
            >
              {visibleColumns.map((col) => {
                const key = columnKeyMap[col];
                const value = row[key];

                if (key === 'prioridad') {
                  return (
                    <TableCell key={col}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon
                          sx={{ color: getWarningColor(value), fontSize: 18 }}
                        />
                        <Typography variant="body2">{String(value ?? '')}</Typography>
                      </Box>
                    </TableCell>
                  );
                }

                return (
                  <TableCell key={col}>
                    {typeof value === 'string' ? value : String(value ?? '')}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ marginTop: 3 }}>
        {visibleRows < rows.length && (
          <Link
            component="button"
            variant="body2"
            onClick={() => setVisibleRows(visibleRows + 10)}
          >
            See 10 more items.
          </Link>
        )}
      </Box>
    </>
  );
}