// modules/components/FilterBar.tsx
import {
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import GetAppIcon from '@mui/icons-material/GetApp';
import RefreshIcon from '@mui/icons-material/Refresh';

const FilterPanel = ({ columns, setColumns }: {
  columns: string[];
  setColumns: (cols: string[]) => void;
}) => {
  const toggleColumn = (col: string) => {
    const next = columns.includes(col)
      ? columns.filter(c => c !== col)
      : [...columns, col];
    try {
      localStorage.setItem('displayData.visibleColumns', JSON.stringify(next));
    } catch (error) {
      console.error("Error guardando columnas visibles:", error);
    }
    setColumns(next);
  };

  return (
    <Box sx={{ marginBottom: 2, padding: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
      <Grid container spacing={1}>
        {columns.map((col) => (
          <Grid item xs={6} sm={4} md={3} key={col}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={columns.includes(col)}
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
    </Box>
  );
};

export default function FilterBar({
  columns,
  setColumns,
  showPanel,
  togglePanel,
  handleDownload,
}: {
  columns: string[];
  setColumns: (cols: string[]) => void;
  showPanel: boolean;
  togglePanel: () => void;
  handleDownload: () => void;
}) {
  return (
    <Box display="flex" alignItems="center" gap={2}>
      <IconButton onClick={togglePanel}>
        <FilterListIcon sx={{ color: 'primary.main' }} />
      </IconButton>
      <IconButton onClick={() => window.location.reload()}>
        <RefreshIcon sx={{ color: 'primary.main' }} />
      </IconButton>
      <IconButton onClick={handleDownload}>
        <GetAppIcon sx={{ color: 'primary.main' }} />
      </IconButton>
      {showPanel && <FilterPanel columns={columns} setColumns={setColumns} />}
    </Box>
  );
}