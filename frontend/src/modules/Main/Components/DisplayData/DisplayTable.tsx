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
  Tooltip,
  TableContainer
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

const normalize = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const getWarningColor = (priority: unknown) => {
  switch (normalize(priority)) {
    case 'critico':
    case 'critica':
    case 'critical':
      return '#d32f2f';
    case 'alto':
    case 'alta':
    case 'high':
      return '#f57c00';
    case 'medio':
    case 'media':
    case 'medium':
      return '#fbc02d';
    case 'bajo':
    case 'baja':
    case 'low':
      return '#1976d2';
    default:
      return '#9e9e9e';
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
      <TableContainer sx={{ maxHeight: '70vh', overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
              {visibleColumns.map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: 'bold',
                    color: '#0d47a1',
                    fontSize: '0.95rem',
                    backgroundColor: '#e3f2fd',
                  }}
                >
                  {col}
                </TableCell>
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
      </TableContainer>

      <Box sx={{ marginTop: 3 }}>
        {visibleRows < rows.length && (
          <Tooltip title="See 10 more items">
            <Link
              component="button"
              variant="body2"
              onClick={() => setVisibleRows(visibleRows + 10)}
            >
              View More.
            </Link>
          </Tooltip>
        )}
      </Box>
    </>
  );
}
