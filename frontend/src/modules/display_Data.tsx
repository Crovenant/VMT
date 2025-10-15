import { useState } from 'react';
import {
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import * as XLSX from 'xlsx';
import Title from './Title';
import useItems from './hooks/useItems';
import type { Item } from './hooks/useItems';

const IconBar = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const FilterPanel = styled(Box)(() => ({
  marginBottom: 16,
  padding: 12,
  backgroundColor: '#e3f2fd',
  borderRadius: 8,
}));

const SeeMore = styled(Box)(() => ({
  marginTop: 24,
}));

const columns = [
  "Número", "ID externo", "Estado", "Resumen", "Breve descripción",
  "Elemento de configuración", "Prioridad", "Puntuación de riesgo",
  "Grupo de asignación", "Asignado a", "Creado", "Actualizado",
  "Sites", "Vulnerability solution", "Vulnerabilidad"
];

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

const DEFAULT_VISIBLE_COLUMNS = [
  "Número",
  "Estado",
  "Resumen",
  "Prioridad",
  "Puntuación de riesgo",
  "Asignado a",
  "Actualizado",
];

const STORAGE_KEY = 'displayData.visibleColumns';

const getWarningColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'crítica':
      return '#d32f2f';
    case 'alta':
      return '#f57c00';
    case 'media':
      return '#fbc02d';
    case 'baja':
      return '#1976d2';
    default:
      return '#9e9e9e';
  }
};

export default function Display_Data({
  refreshKey,
  priorityFilter,
  selectedItemId,
  customFlagFilter,
}: {
  refreshKey: number;
  priorityFilter?: string | null;
  selectedItemId?: number | null;
  customFlagFilter?: 'followUp' | 'soonDue' | null;
}) {
  const [visibleRows, setVisibleRows] = useState<number>(10);
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_VISIBLE_COLUMNS;
    } catch (error) {
      console.error("Error leyendo columnas visibles:", error);
      return DEFAULT_VISIBLE_COLUMNS;
    }
  });

  const { items }: { items: Item[] } = useItems(refreshKey);

  const rows = selectedItemId
    ? items.filter((row: Item) => row.id === selectedItemId)
    : priorityFilter
    ? items.filter((row: Item) =>
        row.prioridad?.toLowerCase() === priorityFilter.toLowerCase()
      )
    : customFlagFilter === 'followUp'
    ? items.filter((row: Item) => row.followUp)
    : customFlagFilter === 'soonDue'
    ? items.filter((row: Item) => row.soonDue)
    : items;

  const toggleColumn = (col: string) => {
    setVisibleColumns((prev: string[]) => {
      const next = prev.includes(col)
        ? prev.filter((c) => c !== col)
        : [...prev, col];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (error) {
        console.error("Error guardando columnas visibles:", error);
      }
      return next;
    });
  };

  const handleDownload = () => {
    const allKeys = Array.from(
      rows.reduce((acc: Set<string>, row: Item) => {
        Object.keys(row).forEach((key) => acc.add(key));
        return acc;
      }, new Set<string>())
    );

    const dataToExport = rows.map((row: Item) => {
      const fullRow: Record<string, string> = {};
      allKeys.forEach((key) => {
        const value = row[key as keyof Item];
        fullRow[key] = typeof value === 'string' ? value : String(value ?? '');
      });
      return fullRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vulnerability list");

    const range = XLSX.utils.decode_range(worksheet['!ref'] ?? '');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          alignment: { horizontal: "center" }
        };
      }
    }

    XLSX.writeFile(workbook, "vulnerability_list_export.xlsx");
  };

  return (
    <>
      <IconBar>
        <Title>Vulnerability list</Title>
        <Box>
          <FilterListIcon
            sx={{ cursor: 'pointer', marginRight: 2, color: 'primary.main' }}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          />
          <RefreshIcon
            sx={{ cursor: 'pointer', marginRight: 2, color: 'primary.main' }}
            onClick={() => window.location.reload()}
          />
          <GetAppIcon
            sx={{ cursor: 'pointer', color: 'primary.main' }}
            onClick={handleDownload}
          />
        </Box>
      </IconBar>

      {showFilterPanel && (
        <FilterPanel>
          <Grid container spacing={1}>
            {columns.map((col) => (
              <Grid item xs={6} sm={4} md={3} key={col}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ lineHeight: 0.55 }}>
                      {col}
                    </Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </FilterPanel>
      )}

      <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
        Mostrando columnas: {visibleColumns.join(', ')}
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.filter(col => visibleColumns.includes(col)).map(col => (
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
              {columns.map((col) => {
                if (!visibleColumns.includes(col)) return null;
                const key = columnKeyMap[col];
                const value = row[key];
                return (
                  <TableCell key={col}>
                    {col === "Prioridad" ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon
                          sx={{
                            color: getWarningColor(value as string),
                            fontSize: 18,
                          }}
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

      <SeeMore>
        {visibleRows < rows.length && (
          <Link
            component="button"
            variant="body2"
            onClick={() => setVisibleRows((prev: number) => prev + 10)}
          >
            See 10 more items.
          </Link>
        )}
      </SeeMore>
    </>
  );
}