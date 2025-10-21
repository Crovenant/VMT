// src/modules/Main/Components/ListItems/ListWrapper.tsx
import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ListTable from './ListTable';
import useItems from '../../hooks/useItems';

export function mainListItems({
  setShowUploadModal,
}: {
  setShowUploadModal: (val: boolean) => void;
}) {
  return (
    <Tooltip title= "Upload Excel file">
    <ListItemButton onClick={() => setShowUploadModal(true)}>
      <ListItemIcon>
        <UploadFileIcon />
      </ListItemIcon>
      <ListItemText primary="Upload File" />
    </ListItemButton>
    </Tooltip>
  );
}

export const secondaryListItems = (
  <ListItemButton>
    <ListItemText primary="Secondary Action" />
  </ListItemButton>
);

export default function ListWrapper({
  refreshKey,
  filter,
}: {
  refreshKey: number;
  filter: string;
}) {
  const { items } = useItems(refreshKey);
  const filteredItems = items.filter(item => item.prioridad === filter);

  return <ListTable items={filteredItems} />;
}