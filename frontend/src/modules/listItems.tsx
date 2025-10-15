import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DashboardIcon from '@mui/icons-material/Dashboard';

export const mainListItems = ({ setShowUploadModal }: { setShowUploadModal: (v: boolean) => void }) => (
  <>
    <ListItemButton>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>
    <ListItemButton onClick={() => setShowUploadModal(true)}>
      <ListItemIcon>
        <UploadFileIcon />
      </ListItemIcon>
      <ListItemText primary="Subir archivo" />
    </ListItemButton>
  </>
);

export const secondaryListItems = (
  <>
    {/* Otros ítems si los necesitas */}
  </>
);