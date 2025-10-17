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

const getWarningColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'crítica': return '#d32f2f';
    case 'alta': return '#f57c00';
    case 'media': return '#fbc02d';
    case 'baja': return '#1976d2';
    default: return '#9e9e9e';
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
              key={`${row.id}-${row.numero}`}
              sx={row.followUp ? { backgroundColor: '#fff8e1' } : {}}
            >
              {visibleColumns.map((col) => {
                const key = columnKeyMap[col];
                const value = row[key];
                return (
                  <TableCell key={col}>
                    {col === "Prioridad" ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon
                          sx={{ color: getWarningColor(value as string), fontSize: 18 }}
                        />
                        <Typography variant="body2">{value}</Typography>
                      </Box>
                    ) : typeof value === 'string' ? value : String(value ?? '')}
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